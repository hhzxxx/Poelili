export type WSHandlers = {
  onOpen?: () => void;
  onMessage?: (data: any) => void;
  onClose?: (ev: CloseEvent) => void;
  onError?: (ev: Event) => void;
};

export function createWS(url: string, handlers: WSHandlers, autoReconnect = true, backoffMs = 1000): { close: () => void } {
  let ws: WebSocket | null = null;
  let closed = false;

  const connect = () => {
    if(closed) return;
    ws = new WebSocket(url);
    ws.onopen = () => handlers.onOpen?.();
    ws.onmessage = (ev) => handlers.onMessage?.(safeParse(ev.data));
    ws.onclose = (ev) => {
      handlers.onClose?.(ev);
      if(autoReconnect && !closed){ setTimeout(connect, backoffMs = Math.min(backoffMs*2, 15000)); }
    };
    ws.onerror = (ev) => handlers.onError?.(ev);
  };

  connect();

  return {
    close(){ closed = true; try{ ws?.close(); }catch{} }
  };
}

function safeParse(data: any){
  try{ return JSON.parse(data); }catch{ return data; }
}
