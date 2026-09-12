import type { ReactNode } from 'react';

export type WorkspaceProps = {
  /** 第一栏：原始 JSON */
  rawPanel: ReactNode;
  /** 第二栏：格式化树视图 */
  treePanel: ReactNode;
  /** 第三栏：选中属性详情 */
  propPanel: ReactNode;
};