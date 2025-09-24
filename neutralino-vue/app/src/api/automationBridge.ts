import * as daemon from './automationDaemon';
import { getImgOpsPath } from './paths';
import { runJson } from './process';

export type Result<T> = { ok: boolean; data?: T; error?: string };

async function tryDaemon<T=any>(cmd: string, params: any, timeoutMs: number): Promise<Result<T>>{
  try{
    const data = await daemon.call<T>(cmd, params, timeoutMs);
    return { ok: true, data };
  }catch(e:any){ return { ok: false, error: e.message || String(e) }; }
}

export async function clickAt(x: number, y: number, windowTitle?: string): Promise<Result<null>>{
  const viaDaemon = await tryDaemon<null>('click', { x, y, windowTitle }, 5000);
  if(viaDaemon.ok) return viaDaemon;
  const args = ['click', `--x=${x}`, `--y=${y}`];
  if(windowTitle) args.push(`--win=${windowTitle}`);
  return await runJson<null>(getImgOpsPath(), args, 5000);
}

export async function keypress(text: string): Promise<Result<null>>{
  const viaDaemon = await tryDaemon<null>('keypress', { text }, 5000);
  if(viaDaemon.ok) return viaDaemon;
  return await runJson<null>(getImgOpsPath(), ['keypress', `--text=${text}`], 5000);
}

export async function findTemplate(imagePath: string, area?: {x:number;y:number;w:number;h:number}, threshold = 0.85): Promise<Result<{x:number;y:number;score:number}>>{
  const viaDaemon = await tryDaemon('find-template', { imagePath, area, threshold }, 8000);
  if(viaDaemon.ok) return viaDaemon;
  const a = ['find-template', `--img=${imagePath}`, `--th=${threshold}`];
  if(area) a.push(`--area=${area.x},${area.y},${area.w},${area.h}`);
  return await runJson(getImgOpsPath(), a, 8000);
}

export async function waitPixel(x:number,y:number,rgb:string,timeoutMs=8000): Promise<Result<null>>{
  const viaDaemon = await tryDaemon<null>('wait-pixel', { x, y, rgb, timeoutMs }, timeoutMs+1000);
  if(viaDaemon.ok) return viaDaemon;
  return await runJson<null>(getImgOpsPath(), ['wait-pixel', `--x=${x}`, `--y=${y}`, `--rgb=${rgb}`, `--timeout=${timeoutMs}`], timeoutMs+1000);
}
