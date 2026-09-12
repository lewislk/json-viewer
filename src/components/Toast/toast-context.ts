import { createContext } from 'react';
import type { ToastApi } from './interface';

/** Toast 的全局 Context；null 表示尚未被 Provider 包裹 */
export const ToastContext = createContext<ToastApi | null>(null);
