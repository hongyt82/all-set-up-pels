// src/hooks/useWebSocketRoom.ts
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { devLog, devWarn } from '../utils/devConsole';

type UserInfo = {
  USER_ID: string;
  USER_NAME: string;
  DEPT_NM: string;
};

type RoomStatePayload = {
  roomId: string;
  lastPage?: number;
  formValues?: Array<{
    formId: string;
    page: number;
    value: any;
    type?: string;
    raw?: any;
  }>;
};

type ChatValue = {
  clientKey?: string;
  senderDept: string;
  senderId: string;
  senderName: string;
  message: string;
  createdAt: string;
};

type ClientListPayload = {
  roomId: string;
  users: UserInfo[];
};

type WSMessage =
  | {
      roomId: string;
      type: 'newClient';
      clientKey?: string;
      clientId?: string;
      user?: UserInfo;
    }
  | {
      roomId: string;
      type: 'clientLeft';
      clientId?: string;
      userInfo?: UserInfo;
      timestamp?: number;
    }
  | ({ roomId: string; type: 'roomState' } & RoomStatePayload)
  | { roomId: string; type: 'clientList'; users: UserInfo[] }
  | { roomId: string; type: 'broadcast'; value: any; targetClientId?: string }
  | { roomId: string; type: 'chat'; value: any; targetClientId?: string }
  | { roomId: string; type: string; [k: string]: any };

export type UseWebSocketRoomOptions = {
  wsUrl?: string; // optional
  roomId: string;
  clientKey: string;
  user: UserInfo;

  onRoomState?: (p: { lastPage?: number; formValues?: any[] }) => void;
  onMovePage?: (p: { page: number }) => void;
  onSetForm?: (p: {
    formId: string;
    page: number;
    value: string;
    type?: string;
    raw?: any;
  }) => void;
  onChat?: (p: ChatValue) => void;
  onClientList?: (p: ClientListPayload) => void;

  // wsUrl 없을 때 자동생성용 옵션 (기본 8600)
  wsPort?: number;
};

function buildWsUrl(explicit?: string, port = 8600) {
  // explicit이 정상 URL이면 그대로 사용
  if (explicit && /^wss?:\/\//i.test(explicit)) return explicit;

  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const host = window.location.hostname; // localhost / 192.168.x.x
  return `${proto}://${host}:${port}`;
}

export function useWebSocketRoom(opts: UseWebSocketRoomOptions) {
  const {
    wsUrl: wsUrlFromOpts,
    wsPort = 8600,
    roomId,
    clientKey,
    user,
    onRoomState,
    onMovePage,
    onSetForm,
    onChat,
    onClientList,
  } = opts;

  const wsUrl = useMemo(
    () => buildWsUrl(wsUrlFromOpts, wsPort),
    [wsUrlFromOpts, wsPort]
  );

  useEffect(() => {
    devLog('🔥 ViewerPage MOUNT');
    return () => {
      devLog('💀 ViewerPage UNMOUNT');
    };
  }, []);

  useEffect(() => {
    devLog('[WS CONFIG]', {
      page: window.location.href,
      wsUrl,
      roomId,
      clientKey,
      user,
    });
  }, [wsUrl, roomId, clientKey, user]);

  // ==========================
  // Debug: connect call tracing
  // ==========================
  const connectCallCountRef = useRef(0);
  const connectSeqRef = useRef(0); // 렌더마다 초기화되지 않게 ref 사용

  // ==========================
  // Handlers ref (핵심)
  // - ViewerPage 리렌더로 콜백이 매번 새로 생성되어도
  //   connect/useEffect 재실행을 유발하지 않도록 고정
  // ==========================
  const handlersRef = useRef({
    onRoomState,
    onMovePage,
    onSetForm,
    onChat,
    onClientList,
  });

  useEffect(() => {
    handlersRef.current = {
      onRoomState,
      onMovePage,
      onSetForm,
      onChat,
      onClientList,
    };
  }, [onRoomState, onMovePage, onSetForm, onChat, onClientList]);

  const wsRef = useRef<WebSocket | null>(null);
  const manualCloseRef = useRef(false);

  const retryRef = useRef(0);
  const reconnectTimerRef = useRef<number | null>(null);
  const MAX_RETRY = 5;

  const [isOpen, setIsOpen] = useState(false);

  // connect 중복(동시) 방지
  const connectInFlightRef = useRef(false);

  const safeSend = useCallback((obj: any) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      devLog('[WS OUT SKIP]', obj);
      return false;
    }
    devLog('[WS OUT]', obj);
    ws.send(JSON.stringify(obj));
    return true;
  }, []);

  const sendNewClient = useCallback(() => {
    return safeSend({
      roomId,
      type: 'newClient',
      clientKey,
      user,
      debug: 'FROM_WEB_VIEWER',
    });
  }, [safeSend, roomId, clientKey, user]);

  const sendMovePage = useCallback(
    (pdfPageNo: number) => {
      return safeSend({
        roomId,
        type: 'broadcast',
        value: { event: 'movePage', page: String(pdfPageNo) },
      });
    },
    [safeSend, roomId]
  );

  type SendChatOptions = {
    targetClientId?: string;
    createdAt?: string;
  };

  const sendChat = useCallback(
    (messageHtml: string, options?: SendChatOptions) => {
      return safeSend({
        roomId,
        type: 'chat',
        ...(options?.targetClientId
          ? { targetClientId: options.targetClientId }
          : {}),
        value: {
          clientKey,
          senderDept: user.DEPT_NM,
          senderId: user.USER_ID,
          senderName: user.USER_NAME,
          message: messageHtml,
          createdAt: options?.createdAt ?? new Date().toISOString(),
        },
      });
    },
    [safeSend, roomId, user, clientKey]
  );

  const requestClientList = useCallback(() => {
    return safeSend({ roomId, type: 'clientList' });
  }, [safeSend, roomId]);

  const close = useCallback(() => {
    manualCloseRef.current = true;
    setIsOpen(false);

    if (reconnectTimerRef.current) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    const ws = wsRef.current;
    wsRef.current = null;
    connectInFlightRef.current = false;

    if (
      ws &&
      (ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING)
    ) {
      ws.close();
    }
  }, []);

  const connect = useCallback(() => {
    // ===== connect 폭주 추적용 =====
    const seq = ++connectSeqRef.current;
    connectCallCountRef.current += 1;
    if (import.meta.env.DEV) {
      console.groupCollapsed(
        `%c[WS CONNECT CALL #${connectCallCountRef.current} | seq=${seq}]`,
        'color:orange;font-weight:bold;'
      );
      console.log('time=', new Date().toISOString());
      console.log('page=', window.location.href);
      console.log('wsUrl:', wsUrl);
      console.log('roomId:', roomId);
      console.log('clientKey:', clientKey);
      console.log('existing ws:', wsRef.current);
      console.log(
        'existing readyState:',
        wsRef.current ? wsRef.current.readyState : 'none'
      );
      console.trace('[WS CONNECT TRACE]');
      console.groupEnd();
    }

    manualCloseRef.current = false;

    // ✅ 이미 열려있거나 연결중이면 새로 만들지 않기
    const existing = wsRef.current;
    if (
      existing &&
      (existing.readyState === WebSocket.OPEN ||
        existing.readyState === WebSocket.CONNECTING)
    ) {
      devLog('[WS CONNECT SKIP] already open/connecting');
      return;
    }

    // ✅ connect() 동시 진입 방지 (브라우저 리소스 폭주 방지)
    if (connectInFlightRef.current) {
      devLog('[WS CONNECT SKIP] in-flight');
      return;
    }
    connectInFlightRef.current = true;

    // ✅ reconnect timer 중복 방지
    if (reconnectTimerRef.current) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    devLog('[WS CONNECT TRY]', wsUrl);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      devLog('[WS OPEN]', { wsUrl, roomId, clientKey });
      setIsOpen(true);

      retryRef.current = 0; // 성공하면 카운터 리셋
      connectInFlightRef.current = false;

      // join
      sendNewClient();

      // join 처리 시간을 주고 list 요청
      window.setTimeout(() => requestClientList(), 200);
    };

    ws.onmessage = (ev: MessageEvent) => {
      let raw: any = null;
      try {
        raw = JSON.parse(String(ev.data));
      } catch {
        return;
      }

      const msg: WSMessage = (raw?.payload ?? raw) as WSMessage;
      devLog('[WS IN]', raw, '=>', msg);

      if (!msg) return;
      if (msg.roomId && msg.roomId !== roomId) return;

      // ✅ 항상 최신 핸들러 사용
      const {
        onRoomState: _onRoomState,
        onMovePage: _onMovePage,
        onSetForm: _onSetForm,
        onChat: _onChat,
        onClientList: _onClientList,
      } = handlersRef.current;

      if (msg.type === 'newClient' || msg.type === 'clientLeft') {
        requestClientList();
        return;
      }

      if (msg.type === 'roomState') {
        _onRoomState?.({
          lastPage: (msg as any).lastPage,
          formValues: (msg as any).formValues ?? [],
        });
        return;
      }

      if (msg.type === 'clientList' && Array.isArray((msg as any).users)) {
        _onClientList?.({ roomId, users: (msg as any).users });
        return;
      }

      if (msg.type === 'chat') {
        const v = (msg as any).value;
        if (v) _onChat?.(v);
        return;
      }

      if (msg.type === 'broadcast') {
        const v = (msg as any).value;
        const event = String(v?.event ?? '');

        if (event === 'movePage') {
          const page = Number(v?.page ?? 0);
          if (page > 0) _onMovePage?.({ page });
          return;
        }

        if (event === 'setForm') {
          _onSetForm?.({
            formId: String(v?.formId ?? ''),
            page: Number(v?.page ?? 0),
            value: String(v?.value ?? ''),
            type: v?.type ? String(v.type) : undefined,
            raw: v,
          });
          return;
        }
      }
    };

    ws.onerror = e => {
      console.error('[WS ERROR]', e);
      // 에러가 떠도 onclose로 이어지는 경우가 많지만, 혹시를 위해 해제
      connectInFlightRef.current = false;
    };

    ws.onclose = ev => {
      devLog('[WS CLOSE]', ev.code, ev.reason);
      setIsOpen(false);
      wsRef.current = null;
      connectInFlightRef.current = false;

      if (manualCloseRef.current) return;

      retryRef.current += 1;
      if (retryRef.current > MAX_RETRY) {
        devWarn('[WS] retry stopped');
        return;
      }

      reconnectTimerRef.current = window.setTimeout(() => {
        connect();
      }, 1200);
    };
  }, [wsUrl, roomId, clientKey, sendNewClient, requestClientList]);

  useEffect(() => {
    connect();
    return () => close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connect]);

  return {
    isOpen,
    sendMovePage,
    sendChat,
    requestClientList,
    close,
  };
}
