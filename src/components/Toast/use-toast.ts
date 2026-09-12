import { useContext } from 'react';
import { ToastContext } from './toast-context';
import type { ToastApi } from './interface';

/** 在组件中获取 toast API；缺失 Provider 时返回一个 noop，避免崩溃 */
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) return { toast: () => {} };
  return ctx;
}
