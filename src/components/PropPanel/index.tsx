import type { TreeNode } from '../../types/tree';
import type { PropPanelProps } from './interface';
import { keyDisplay } from '../../utils/tree-builder';
import { PlaceholderEmptyIcon } from '../Icons';
import { ObjectPreview } from './object-preview';
import { PropField } from './prop-field';
import { TypeBadge } from './type-badge';
import { ValueCard } from './value-card';
import './index.css';

/**
 * 选中属性详情面板。
 *
 * - 未选中：显示空状态占位卡片
 * - 已选中：依次展示 4 个字段：属性名 / 类型 / 路径 / 属性值
 *
 * 属性值按节点类型分发：
 * - 基础类型 → `ValueCard`（带复制按钮）
 * - 对象 / 数组 → `ObjectPreview`（带前 3 项预览 + 复制整段 JSON 按钮）
 */
export function PropPanel({ node }: PropPanelProps) {
  return (
    <section className="prop-panel">
      <header className="prop-panel-head">
        <span className="prop-panel-title">选中属性视图</span>
      </header>
      <div className="prop-panel-body">
        {node ? <SelectedContent node={node} /> : <EmptyState />}
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="prop-panel-placeholder-card prop-panel-placeholder-empty">
      <span className="prop-panel-placeholder-icon">
        <PlaceholderEmptyIcon />
      </span>
      <div className="prop-panel-ph-label">未选中字段</div>
      <div className="prop-panel-ph-sub">
        点击左侧 JSON 树中的任意字段，
        <br />
        此处将展示其属性名与属性值
      </div>
    </div>
  );
}

function SelectedContent({ node }: { node: TreeNode }) {
  const isContainer = !!node.children;
  return (
    <>
      <PropField label="属性名">
        <div className="prop-panel-name">{keyDisplay(node)}</div>
      </PropField>
      <PropField label="类型">
        <TypeBadge type={node.type} />
      </PropField>
      <PropField label="路径">
        <div className="prop-panel-path">{node.path}</div>
      </PropField>
      <PropField label="属性值">
        {isContainer ? (
          <ObjectPreview node={node} />
        ) : (
          <ValueCard type={node.type} value={node.value} />
        )}
      </PropField>
    </>
  );
}