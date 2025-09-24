import { rateLimiter } from '../domain/proxy/ratelimit';
import { pickBestProxy } from '../domain/proxy/selector';
import { logger } from './logger';

export type HttpRequest = { url: string; method?: string; headers?: Record<string,string>; body?: string; timeoutMs?: number };
export type HttpResponse = { status: number; headers: Record<string,string>; body: string; durationMs: number };

function headersToArray(headers?: Record<string,string>): string[] {
  if(!headers) return [];
  return Object.entries(headers).map(([k,v]) => `${k}: ${v}`);
}

export async function request(req: HttpRequest): Promise<HttpResponse> {
  await rateLimiter.take();
  const start = Date.now();
  const proxy = await pickBestProxy();
  if(!proxy){
    const r = await fetch(req.url, {
      method: req.method || 'GET',
      headers: req.headers,
      body: req.body,
      signal: req.timeoutMs ? AbortSignal.timeout(req.timeoutMs) : undefined
    });
    const body = await r.text();
    const headers: Record<string,string> = {};
    r.headers.forEach((v,k)=>headers[k]=v);
    return { status: r.status, headers, body, durationMs: Date.now()-start };
  }
  // 使用系统 curl.exe 走代理
  const args = [
    '-sS', '-i', // 包含响应头
    '--max-time', String(Math.ceil((req.timeoutMs ?? 8000)/1000)),
    '-X', req.method || 'GET',
    '--proxy', proxy.url,
  ];
  for(const h of headersToArray(req.headers)) args.push('-H', h);
  if(req.body){ args.push('--data-binary', req.body); }
  args.push(req.url);

  const proc = await Neutralino.os.spawnProcess('curl', args);
  const pid = proc.id;
  let raw = '';
  await new Promise<void>((resolve) => {
    Neutralino.events.on('stdOut', (e:any)=>{ if(e.detail.id===pid){ raw += e.detail.data; }});
    Neutralino.events.on('processExited', (e:any)=>{ if(e.detail.id===pid) resolve(); });
  });
  // 拆分头与体
  const sep = /\r?\n\r?\n/;
  const parts = raw.split(sep);
  // 处理可能的 100 Continue 等中间头：取最后一个头部块
  while(parts.length > 2) parts.shift();
  const headerRaw = parts[0] || '';
  const body = parts.slice(1).join('\n\n');
  const headerLines = headerRaw.split(/\r?\n/).filter(Boolean);
  let status = 0;
  const headers: Record<string,string> = {};
  for(const line of headerLines){
    if(line.startsWith('HTTP/')){
      const m = line.match(/HTTP\/\d\.\d\s+(\d+)/); if(m) status = parseInt(m[1],10);
    } else {
      const idx = line.indexOf(':'); if(idx>0){ const k=line.slice(0,idx).trim().toLowerCase(); const v=line.slice(idx+1).trim(); headers[k]=v; }
    }
  }
  const dur = Date.now()-start;
  if(!status){ await logger.warn('curl no status', { url: req.url }); return { status: 0, headers: {}, body: raw, durationMs: dur }; }
  return { status, headers, body, durationMs: dur };
}
