import type { ReactNode } from 'react';
import './index.css';

/**
 * 全屏窗口外观。包含标题栏与工作区，外层固定铺满视口并加边框。
 */
export function Window({ children }: { children: ReactNode }) {
  return <div className="window-root">{children}</div>;
}