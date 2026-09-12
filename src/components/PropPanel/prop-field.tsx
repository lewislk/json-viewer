import type { ReactNode } from 'react';
import './index.css';

type PropFieldProps = {
  label: string;
  children: ReactNode;
};

/**
 * 「属性视图」中的单个字段行：左侧 label + 下方自定义内容。
 */
export function PropField({ label, children }: PropFieldProps) {
  return (
    <div className="prop-panel-field">
      <div className="prop-panel-field-label">{label}</div>
      {children}
    </div>
  );
}