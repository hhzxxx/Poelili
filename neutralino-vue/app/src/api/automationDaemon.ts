import { logger } from './logger';
import { getImgOpsPath } from './paths';

type Pending = { resolve: (v:any)=>void; reject:(e:any)=>void; timer:any };
const pending = new Map<string, Pending>();
let proc: any = null;
let pid: number | null = null;
let buffer = '';
let started = false;

function genId(){ return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export async function startDaemon(){
  if(started) return;
  const exe = getImgOpsPath();
  proc = await Neutralino.os.spawnProcess(exe, ['--daemon']);
  pid = proc.id;
  started = true;
  await Neutralino.events.on('stdOut', (e:any)=>{
    if(e.detail.id !== pid) return;
    buffer += e.detail.data;
    let idx;
    while((idx = buffer.indexOf('\n')) >= 0){
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx+1);
      if(!line) continue;
      try{
        const msg = JSON.parse(line);
        const id = msg.id as string;
        const p = pending.get(id);
        if(p){
          clearTimeout(p.timer);
          pending.delete(id);
          if(msg.ok) p.resolve(msg.data);
          else p.reject(new Error(msg.error || 'daemon error'));
        }
      }catch(err){ logger.warn('daemon parse error', { err: String(err), line }); }
    }
  });
  await Neutralino.events.on('processExited', (e:any)=>{
    if(e.detail.id !== pid) return;
    started = false; pid = null; proc = null; buffer = '';
    for(const [id, p] of pending){ clearTimeout(p.timer); p.reject(new Error('daemon exited')); }
    pending.clear();
  });
}

export async function stopDaemon(){
  try { if(pid) await Neutralino.os.killProcess(pid); } catch {}
}

export async function call<T=any>(cmd: string, params: any, timeoutMs = 8000): Promise<T>{
  if(!started) await startDaemon();
  const id = genId();
  const payload = JSON.stringify({ id, cmd, params });
  const timer = setTimeout(()=>{
    const p = pending.get(id); if(p){ pending.delete(id); p.reject(new Error('timeout')); }
  }, timeoutMs);
  const promise = new Promise<T>((resolve, reject)=>{
    pending.set(id, { resolve, reject, timer });
  });
  // 写入 stdin: Neutralino 提供 write 功能（此处用 emit 写入 API 的假设；如无，则使用 os.writeStdinWhenAvailable 类似扩展）
  try {
    await Neutralino.os.writeProcessInput?.(pid, payload + '\n');
  } catch {
    // 如果当前 Neutralino 版本不支持写入 stdin，可回退为一次性进程调用
    throw new Error('write to daemon stdin not supported by current Neutralino build');
  }
  return await promise;
}
