import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { ToastContext } from './toast-context';
import type { ToastApi } from './interface';
import './index.css';

const TOAST_DURATION_MS = 2200;
const TOAST_CLASS = 'toast';
const TOAST_SHOW_CLASS = 'toast-show';

/**
 * 全局唯一的 Toast 视口 + Provider。
 *
 * - 同时只展示一条最新消息，新消息会替换旧的并重置倒计时。
 * - 通过 Context 暴露 `toast(msg)`，任意子组件调用即可弹提示。
 */
function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const toast = useCallback<ToastApi['toast']>(
    (msg) => {
      clearTimer();
      setMessage(msg);
      timerRef.current = setTimeout(() => {
        setMessage(null);
        timerRef.current = null;
      }, TOAST_DURATION_MS);
    },
    [clearTimer],
  );

  useEffect(() => clearTimer, [clearTimer]);

  const toastClass = `${TOAST_CLASS} ${message ? TOAST_SHOW_CLASS : ''}`.trim();

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className={toastClass} role="status" aria-live="polite">
        {message ?? ''}
      </div>
    </ToastContext.Provider>
  );
}

export { ToastProvider };
