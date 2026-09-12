import type { TreeNode, TreeStats } from '../../types/tree';
import type { MatchInfo } from './tree-view';

export type TreePanelProps = {
  tree: TreeNode | null;
  stats: TreeStats;
  expandedPaths: Set<string>;
  selectedPath: string | null;
  /** 实时搜索框内容（用于输入框 value） */
  searchTerm: string;
  /** 搜索匹配节点列表（基于防抖后的 searchTerm） */
  searchMatches: TreeNode[];
  /** 节点路径 → 命中信息（用于行内高亮） */
  matchMap: Map<string, MatchInfo>;
  /** 高亮用的搜索词（防抖后的，避免输入中抖动） */
  highlightedSearchTerm: string;
  activeMatchIdx: number;
  onSelect: (path: string) => void;
  onToggle: (path: string) => void;
  onSearchChange: (term: string) => void;
  onActiveMatchChange: (idx: number) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
};