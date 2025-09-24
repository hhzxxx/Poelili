import axios, { AxiosRequestConfig } from 'axios';
import { HttpResponse, request as requestViaProxy } from './proxyClient';

export async function httpRequest(cfg: AxiosRequestConfig & { useProxy?: boolean }): Promise<HttpResponse> {
  if(cfg.useProxy){
    const res = await requestViaProxy({
      url: cfg.url as string,
      method: (cfg.method || 'GET').toUpperCase(),
      headers: cfg.headers as Record<string,string> | undefined,
      body: typeof cfg.data === 'string' ? cfg.data : (cfg.data ? JSON.stringify(cfg.data) : undefined),
      timeoutMs: cfg.timeout as number | undefined
    });
    return res;
  }
  const start = Date.now();
  const r = await axios(cfg);
  const headers: Record<string,string> = {};
  for(const k of Object.keys(r.headers || {})) headers[k] = String((r.headers as any)[k]);
  return { status: r.status, headers, body: typeof r.data === 'string' ? r.data : JSON.stringify(r.data), durationMs: Date.now()-start };
}
