import { getAnyActiveCookie } from './cookies';
import { emit } from './events';
import { httpRequest } from './http';
import { domains } from './poeServe';
import { readJson } from './storage';

export type Rule = { id: string; name: string; domain: 1|2; league: string; code?: string; query?: any; freq_s: number; timeout?: number; enabled: boolean };
const seen = new Set<string>();

async function ensureQuery(rule: Rule): Promise<{ id?: string; query: any }>{
  if(rule.query){ return { query: rule.query }; }
  if(rule.code){
    // 旧逻辑：通过搜索页解析 state 以得到 query
    const url = `${domains[rule.domain]}/trade/search/${encodeURI(rule.league)}/${rule.code}`;
    const cookie = await getAnyActiveCookie();
    const res = await httpRequest({ url, method: 'GET', headers: cookie ? { 'Cookie': cookie } : undefined, timeout: rule.timeout ?? 8000, useProxy: true });
    const m = res.body.match(/t\({.*?}\);/s);
    if(!m) throw new Error('无法解析搜索页 state');
    const jsonStr = m[0].replace('t(', '').replace(');', '');
    const q = { query: JSON.parse(jsonStr).state, sort: { indexed: 'desc' } };
    return { query: q };
  }
  throw new Error('规则缺少 query 或 code');
}

async function search(rule: Rule, q: any): Promise<{ searchId: string; resultIds: string[] }>{
  const url = `${domains[rule.domain]}/api/trade/search/${encodeURI(rule.league)}`;
  const cookie = await getAnyActiveCookie();
  const res = await httpRequest({ url, method: 'POST', data: q, headers: { 'Content-Type':'application/json', ...(cookie?{Cookie:cookie}:{}) }, timeout: rule.timeout ?? 8000, useProxy: true });
  const j = JSON.parse(res.body);
  return { searchId: j.id, resultIds: j.result || [] };
}

async function fetch(rule: Rule, searchId: string, ids: string[]): Promise<any[]>{
  if(ids.length === 0) return [];
  const chunks: string[][] = [];
  for(let i=0;i<ids.length;i+=10) chunks.push(ids.slice(i,i+10));
  const cookie = await getAnyActiveCookie();
  const all: any[] = [];
  for(const c of chunks){
    const url = `${domains[rule.domain]}/api/trade/fetch/${c.join(',')}?query=${searchId}`;
    const res = await httpRequest({ url, method:'GET', headers: cookie?{Cookie:cookie}:undefined, timeout: rule.timeout ?? 8000, useProxy: true });
    const j = JSON.parse(res.body);
    if(Array.isArray(j.result)) all.push(...j.result);
  }
  return all;
}

function fingerprint(it: any): string { return JSON.stringify([it?.id, it?.listing?.price?.amount, it?.item?.name, it?.item?.typeLine]).slice(0,256); }

export async function pollOnce(){
  const rules: Rule[] = await readJson('./data/config/trade.rules.json', []);
  for(const rule of rules){
    if(!rule.enabled) continue;
    try{
      const q = await ensureQuery(rule);
      const s = await search(rule, q.query);
      const items = await fetch(rule, s.searchId, s.resultIds);
      for(const it of items){
        const fp = fingerprint(it); if(seen.has(fp)) continue; seen.add(fp);
        emit('trade:new-item', { ruleId: rule.id, item: it });
      }
    }catch(e:any){ emit('trade:error', { ruleId: rule.id, error: e.message || String(e) }); }
  }
}
