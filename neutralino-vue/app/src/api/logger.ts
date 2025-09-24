type Level = 'debug'|'info'|'warn'|'error';

let logPath = './data/logs/app.log';
let levelPriority: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
let currentLevel: Level = 'info';

export function configureLogger(path?: string, level?: Level){
  if(path) logPath = path;
  if(level) currentLevel = level;
}

export async function log(level: Level, msg: string, extra?: any){
  if(levelPriority[level] < levelPriority[currentLevel]) return;
  const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${msg}${extra? ' '+safeJson(extra): ''}`;
  console[level === 'debug' ? 'log' : level](line);
  await appendWithRotate(line + '\n');
}

function safeJson(obj:any){
  try { return JSON.stringify(obj); } catch { return String(obj); }
}

async function appendWithRotate(text: string){
  try {
    await Neutralino.filesystem.appendFile(logPath, text);
    const stat = await Neutralino.filesystem.getStats(logPath);
    if(stat.size > 1024 * 512){ // 512KB rotate
      const bak = logPath.replace(/\.log$/, `.log.${Date.now()}`);
      const content = await Neutralino.filesystem.readFile(logPath);
      await Neutralino.filesystem.writeFile(bak, content);
      await Neutralino.filesystem.writeFile(logPath, '');
    }
  } catch {}
}

export const logger = {
  debug: (m:string,e?:any)=>log('debug', m, e),
  info: (m:string,e?:any)=>log('info', m, e),
  warn: (m:string,e?:any)=>log('warn', m, e),
  error: (m:string,e?:any)=>log('error', m, e)
};
