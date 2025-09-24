import { openDatabase, flushDatabase } from './storage';

function maskCookie(c: string){ if(!c) return ''; return c.length <= 8 ? '*'.repeat(c.length) : c.slice(0,4)+'***'+c.slice(-2); }

export async function listAccounts(){
  const db = await openDatabase();
  const res = db.exec('SELECT id,name,tags,status,verified_at FROM accounts');
  const rows = (res[0]?.values || []).map((r:any[])=>({ id:r[0], name:r[1], tags:r[2], status:r[3], verified_at:r[4] }));
  return rows;
}

export async function saveCookie(id: string, name: string, cookiePlain: string){
  const db = await openDatabase();
  // TODO: 调用 DPAPI 加密：此处先明文占位
  const enc = cookiePlain; 
  db.exec(`INSERT OR REPLACE INTO accounts(id,name,tags,cookie_enc,status) VALUES('${id}','${name}','[]','${enc}','active')`);
  await flushDatabase();
}

export async function getCookieMasked(id: string){
  const db = await openDatabase();
  const res = db.exec(`SELECT cookie_enc FROM accounts WHERE id='${id}'`);
  const val = res[0]?.values?.[0]?.[0] || '';
  return maskCookie(val);
}

export async function verifyAccount(id: string): Promise<{ ok: boolean; reason?: string }>{
  // TODO: 发起一次受保护接口请求验证 cookie 的有效性
  return { ok: true };
}
