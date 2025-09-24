type Handler = (payload: any) => void;
const bus = new Map<string, Set<Handler>>();

export function on(event: string, handler: Handler){
  if(!bus.has(event)) bus.set(event, new Set());
  bus.get(event)!.add(handler);
  return () => off(event, handler);
}

export function off(event: string, handler: Handler){
  bus.get(event)?.delete(handler);
}

export function emit(event: string, payload?: any){
  for(const h of bus.get(event) || []){
    try { h(payload); } catch {}
  }
}
