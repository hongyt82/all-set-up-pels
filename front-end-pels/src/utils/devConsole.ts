/**
 * Vite dev 서버(local / dev 스크립트)에서만 콘솔 출력.
 * `vite build` 산출물(PROD)에서는 호출이 무시되어지며 실제 콘솔에서는 크게 이상 없을것.
 * `console.error`는 그대로 두고, 디버그·추적용 log/warn만 이곳으로 모아서 정리.
 */
export function devLog(...args: unknown[]): void {
  if (import.meta.env.DEV) console.log(...args);
}

export function devWarn(...args: unknown[]): void {
  if (import.meta.env.DEV) console.warn(...args);
}

export function devInfo(...args: unknown[]): void {
  if (import.meta.env.DEV) console.info(...args);
}

export function devDebug(...args: unknown[]): void {
  if (import.meta.env.DEV) console.debug(...args);
}
