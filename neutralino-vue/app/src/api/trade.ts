import { emit } from './events';
import { httpRequest } from './http';
import { readJson } from './storage';

export type Rule = { id: string; name: string; query: any; freq_s: number; timeout?: number; enabled: boolean };
const seen = new Set<string>();

function buildUrl(rule: Rule): string {
  // TODO: 根据真实市集 API 构建；这里用占位
  const q = encodeURIComponent(JSON.stringify(rule.query));
  return `https://example.com/trade?q=${q}`;
}

function fingerprint(item: any): string {
  // TODO: 根据真实返回结构指纹化
  return JSON.stringify([item.id || item.name || item.title, item.price || 0]).slice(0,256);
}

function parseItems(body: string): any[] {
  try { const json = JSON.parse(body); return Array.isArray(json.items) ? json.items : []; }
  catch { return []; }
}

export async function pollOnce(){
  const rules: Rule[] = await readJson('./data/config/trade.rules.json', []);
  for(const rule of rules){
    if(!rule.enabled) continue;
    const url = buildUrl(rule);
    try{
      const res = await httpRequest({ url, method: 'GET', timeout: rule.timeout ?? 6000, useProxy: true });
      const items = parseItems(res.body);
      for(const it of items){
        const fp = fingerprint(it); if(seen.has(fp)) continue; seen.add(fp);
        emit('trade:new-item', { ruleId: rule.id, item: it });
      }
    }catch(e:any){
      emit('trade:error', { ruleId: rule.id, error: e.message || String(e) });
    }
  }
}
