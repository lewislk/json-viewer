import type { TreeNode } from '../../types/tree';
import { keyDisplay } from '../../utils/tree-builder';
import { ChevronIcon } from '../Icons';
import './tree-view.css';

/** 节点值的搜索命中信息（key/value 中搜索词的下标；-1 表示未命中） */
export type MatchInfo = { kM: number; vM: number };

const NO_MATCH: MatchInfo = { kM: -1, vM: -1 };

type CommonProps = {
  expanded: Set<string>;
  selectedPath: string | null;
  activeMatchPath: string | null;
  searchTerm: string;
  matchMap: Map<string, MatchInfo>;
  onSelect: (path: string) => void;
  onToggle: (path: string) => void;
};

type TreeViewProps = CommonProps & {
  root: TreeNode | null;
};

/** 高亮命中的子串；无命中时直接渲染原文本 */
function Highlight({
  text,
  searchTerm,
  matchIdx,
}: {
  text: string;
  searchTerm: string;
  matchIdx: number;
}) {
  if (!searchTerm || matchIdx < 0) return <>{text}</>;
  const before = text.slice(0, matchIdx);
  const match = text.slice(matchIdx, matchIdx + searchTerm.length);
  const after = text.slice(matchIdx + searchTerm.length);
  return (
    <>
      {before}
      <mark className="tree-view-mark">{match}</mark>
      {after}
    </>
  );
}

/** 叶子节点的展示值 */
function displayValue(node: TreeNode): string {
  if (node.type === 'string') {
    const raw = String(node.value);
    const trimmed = raw.length > 90 ? `${raw.slice(0, 90)}…` : raw;
    return JSON.stringify(trimmed);
  }
  return String(node.value);
}

/** 单个节点行（含可能的子节点递归与闭合行） */
function TreeRow({
  node,
  ...common
}: CommonProps & { node: TreeNode }) {
  const isExpanded = common.expanded.has(node.path);
  const isSelected = common.selectedPath === node.path;
  const isActive = common.activeMatchPath === node.path;
  const hasKids = !!(node.children && node.children.length);

  const match = common.matchMap.get(node.path) ?? NO_MATCH;

  const rowClass = [
    'tree-view-row',
    isSelected ? 'tree-view-row-selected' : '',
    isActive ? 'tree-view-row-active' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleSelect = () => common.onSelect(node.path);
  const handleToggle = () => common.onToggle(node.path);

  return (
    <>
      <div
        className={rowClass}
        style={{ ['--depth' as string]: String(node.depth) }}
        data-path={node.path}
        onClick={handleSelect}
        onDoubleClick={hasKids ? handleToggle : undefined}
      >
        {node.depth > 0 && <span className="tree-view-gline" aria-hidden />}

        {hasKids ? (
          <button
            type="button"
            className={`tree-view-twisty ${isExpanded ? 'tree-view-twisty-open' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
            title={isExpanded ? '收缩' : '展开'}
            aria-label={isExpanded ? '收缩' : '展开'}
          >
            <ChevronIcon size={9} />
          </button>
        ) : (
          <span className="tree-view-spacer" aria-hidden />
        )}

        <span
          className={`tree-view-k ${node.isArrayItem ? 'tree-view-k-idx' : ''}`}
        >
          <Highlight
            text={keyDisplay(node)}
            searchTerm={common.searchTerm}
            matchIdx={match.kM}
          />
        </span>

        {!node.isArrayItem && <span className="tree-view-punct">:</span>}

        {hasKids ? (
          isExpanded ? (
            <span className="tree-view-open-bracket">
              {node.type === 'array' ? '[' : '{'}
            </span>
          ) : (
            <>
              <span className="tree-view-obj-bracket">
                {node.type === 'array' ? '[…]' : '{…}'}
              </span>
              <span className="tree-view-cnt">
                {node.childCount}
                {node.type === 'array' ? ' 个元素' : ' 个键'}
              </span>
            </>
          )
        ) : node.children ? (
          // 空对象/空数组
          <span className="tree-view-obj-bracket">
            {node.type === 'array' ? '[]' : '{}'}
          </span>
        ) : (
          <span className={`tree-view-v ${V_TYPE_CLASS[node.type] ?? ''}`}>
            <Highlight
              text={displayValue(node)}
              searchTerm={common.searchTerm}
              matchIdx={match.vM}
            />
          </span>
        )}
      </div>

      {isExpanded && hasKids && (
        <>
          {node.children!.map((c) => (
            <TreeRow key={c.path} node={c} {...common} />
          ))}
          <div
            className="tree-view-close-row"
            style={{ ['--depth' as string]: String(node.depth) }}
            onClick={handleSelect}
          >
            {node.depth > 0 && <span className="tree-view-gline" aria-hidden />}
            <span className="tree-view-spacer" aria-hidden />
            <span className="tree-view-punct">
              {node.type === 'array' ? ']' : '}'}
            </span>
          </div>
        </>
      )}
    </>
  );
}

const V_TYPE_CLASS: Record<string, string> = {
  string: 'tree-view-v-string',
  number: 'tree-view-v-number',
  boolean: 'tree-view-v-boolean',
  null: 'tree-view-v-null',
};

/**
 * 递归渲染整棵树。根节点作为首行展示。
 */
export function TreeView(props: TreeViewProps) {
  if (!props.root) return null;
  return <TreeRow node={props.root} {...props} />;
}