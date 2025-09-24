export type AppPaths = {
  baseDir: string;
  binDir: string;
  dataDir: string;
  imgOpsPath: string;
  httpCliPath: string;
  updaterPath: string;
};

let cached: AppPaths | null = null;

export function getAppBasePath(): string {
  // 在 Neutralino 中，工作目录为应用根目录
  return cached?.baseDir || '.';
}

export async function loadPaths(): Promise<AppPaths> {
  if (cached) return cached;
  const baseDir = '.';
  const binDir = './bin';
  const dataDir = './data';
  let imgOpsPath = `${binDir}/ImgOps.exe`;
  let httpCliPath = `${binDir}/HttpCli.exe`;
  let updaterPath = `${binDir}/Updater.exe`;
  try {
    const text = await Neutralino.filesystem.readFile(`${dataDir}/config/automation.config.json`);
    const cfg = JSON.parse(text);
    imgOpsPath = cfg.imgOpsPath || imgOpsPath;
    httpCliPath = cfg.httpCliPath || httpCliPath;
    updaterPath = cfg.updaterPath || updaterPath;
  } catch {}
  cached = { baseDir, binDir, dataDir, imgOpsPath, httpCliPath, updaterPath };
  return cached;
}

export function getImgOpsPath(): string { return cached?.imgOpsPath || './bin/ImgOps.exe'; }
export function getHttpCliPath(): string { return cached?.httpCliPath || './bin/HttpCli.exe'; }
export function getUpdaterPath(): string { return cached?.updaterPath || './bin/Updater.exe'; }
