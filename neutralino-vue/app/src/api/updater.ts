import { getUpdaterPath } from './paths';
import { runExe } from './process';
import { readJson } from './storage';

export type Latest = { version: string; url: string; notes?: string; hash?: string };

export async function checkLatest(): Promise<Latest | null>{
  const app = await readJson('./data/config/app.config.json', { feedUrl: '' });
  if(!app.feedUrl) return null;
  const res = await fetch(app.feedUrl, { cache: 'no-store' });
  if(!res.ok) return null;
  return await res.json() as Latest;
}

export async function downloadAndUpdate(latest: Latest){
  const zipPath = `./data/update/app-${latest.version}.zip`;
  const arr = await (await fetch(latest.url)).arrayBuffer();
  await Neutralino.filesystem.writeBinaryFile(zipPath, new Uint8Array(arr));
  await runExe(getUpdaterPath(), [`--zip=${zipPath}`, `--appdir=.` , `--relaunch=1`], 60000);
}
