export type SpawnResult = { ok: boolean; code: number; stdout: string; stderr: string };

export async function runExe(exePath: string, args: string[], timeoutMs = 30000): Promise<SpawnResult> {
  const proc = await Neutralino.os.spawnProcess(exePath, args);
  const pid = proc.id;
  const stdoutChunks: string[] = [];
  const stderrChunks: string[] = [];

  const onOut = (e: any) => { if (e.detail.id === pid) stdoutChunks.push(e.detail.data); };
  const onErr = (e: any) => { if (e.detail.id === pid) stderrChunks.push(e.detail.data); };
  const onExit = (resolve: (code: number) => void) => (e: any) => { if (e.detail.id === pid) resolve(e.detail.exitCode); };

  const offOut = await Neutralino.events.on('stdOut', onOut);
  const offErr = await Neutralino.events.on('stdErr', onErr);

  const exitPromise = new Promise<number>((resolve) => {
    Neutralino.events.on('processExited', onExit(resolve));
  });

  const code = await Promise.race([
    exitPromise,
    new Promise<number>((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs))
  ]).catch(() => -1) as number;

  try { await Neutralino.events.off('stdOut', offOut.id); } catch {}
  try { await Neutralino.events.off('stdErr', offErr.id); } catch {}

  return { ok: code === 0, code, stdout: stdoutChunks.join(''), stderr: stderrChunks.join('') };
}

export async function runJson<T = any>(exePath: string, args: string[], timeoutMs?: number): Promise<{ ok: boolean; data?: T; error?: string }> {
  const res = await runExe(exePath, args, timeoutMs);
  if (!res.ok) return { ok: false, error: `exit ${res.code}: ${res.stderr}` };
  try { return { ok: true, data: JSON.parse(res.stdout) as T }; }
  catch (e: any) { return { ok: false, error: 'invalid json: ' + e.message }; }
}
