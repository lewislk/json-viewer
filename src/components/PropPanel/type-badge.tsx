import type { JsonType } from '../../types/tree';
import './index.css';

type TypeBadgeProps = { type: JsonType };

const TYPE_CLASS: Record<JsonType, string> = {
  string: 'prop-panel-badge-string',
  number: 'prop-panel-badge-number',
  boolean: 'prop-panel-badge-boolean',
  null: 'prop-panel-badge-null',
  object: 'prop-panel-badge-object',
  array: 'prop-panel-badge-array',
};

/** 类型标签，按 JsonType 着色 */
export function TypeBadge({ type }: TypeBadgeProps) {
  return (
    <span className={`prop-panel-badge ${TYPE_CLASS[type]}`}>{type}</span>
  );
}