type ProxyItem = { id: string; url: string; score?: number };
let list: ProxyItem[] = [];
let idx = 0;

export async function loadProxies(): Promise<ProxyItem[]> {
  // TODO: 从 DB 或配置加载；现在返回空数组表示未启用代理
  return list;
}
export async function setProxies(items: ProxyItem[]){ list = items; idx = 0; }

export async function pickBestProxy(): Promise<ProxyItem | null> {
  if(list.length === 0) return null;
  const p = list[idx % list.length];
  idx++;
  return p;
}
