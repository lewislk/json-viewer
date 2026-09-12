import { useCallback, useEffect, useMemo, useState } from 'react';
import { Window } from './components/Window';
import { Workspace } from './components/Workspace';
import { RawPanel } from './components/RawPanel';
import { TreePanel } from './components/TreePanel';
import { PropPanel } from './components/PropPanel';
import { useDebounce } from './hooks/use-debounce';
import {
  buildTree,
  collectStats,
  findNodeByPath,
  walkAll,
} from './utils/tree-builder';
import { INITIAL_TEXT } from './data/demo';
import type { ParseResult, TreeNode } from './types/tree';

/** 解析 JSON 文本。空文本视为合法（data = null）。 */
function parseText(text: string): ParseResult {
  try {
    const data = text.trim() === '' ? null : JSON.parse(text);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: (e as Error).message || '语法错误' };
  }
}

/** 树的默认展开集合：根节点 + 根的所有非叶子子节点 */
function defaultExpanded(root: TreeNode): Set<string> {
  const set = new Set<string>([root.path]);
  if (root.children) {
    for (const c of root.children) {
      if (c.children && c.children.length) set.add(c.path);
    }
  }
  return set;
}

/** 节点值的搜索命中信息 */
type MatchInfo = { kM: number; vM: number };

/**
 * 顶层编排组件。
 *
 * 状态归属：
 * - `rawText`：编辑器的实时内容（受控）
 * - `parseResult` / `tree` / `stats`：派生自 rawText 的纯计算
 * - `selectedPath` / `userExpandedPaths`：用户在树上的 UI 状态
 * - `searchTerm` / `activeMatchIdx`：搜索 UI 状态
 *
 * 搜索的副作用（自动展开祖先）通过把「用户展开 ∪ 自动展开祖先」合并成
 * `expandedPaths` 派生值实现，避开了在 effect 里 setState 的级联渲染。
 */
export default function App() {
  // === 输入文本 ===
  const [rawText, setRawText] = useState<string>(INITIAL_TEXT);
  const debouncedText = useDebounce(rawText, 350);

  // === 派生：parseResult / tree / stats ===
  const parseResult = useMemo<ParseResult>(
    () => parseText(debouncedText),
    [debouncedText],
  );

  const tree = useMemo<TreeNode | null>(() => {
    if (!parseResult.ok) return null;
    return buildTree(parseResult.data, '$', '$', 0, false, null);
  }, [parseResult]);

  const stats = useMemo(() => collectStats(tree), [tree]);

  // === 选中 ===
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const selectedNode = useMemo(
    () => findNodeByPath(tree, selectedPath),
    [tree, selectedPath],
  );

  // === 用户展开状态 + tree 变化时重置 ===
  const [userExpandedPaths, setUserExpandedPaths] = useState<Set<string>>(() =>
    tree ? defaultExpanded(tree) : new Set(),
  );
  // React 官方推荐：在 render 中检测 props 变化并 setState（"adjust state during render"）
  const [prevTree, setPrevTree] = useState(tree);
  if (prevTree !== tree) {
    setPrevTree(tree);
    setUserExpandedPaths(tree ? defaultExpanded(tree) : new Set());
  }

  // === 搜索 ===
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearch = useDebounce(searchTerm, 200);

  // 搜索结果：匹配节点 + 命中位置映射 + 自动展开的祖先路径
  const searchData = useMemo(() => {
    const empty = {
      matches: [] as TreeNode[],
      autoExpand: new Set<string>(),
      matchMap: new Map<string, MatchInfo>(),
    };
    if (!tree) return empty;
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return empty;
    const matches: TreeNode[] = [];
    const autoExpand = new Set<string>();
    const matchMap = new Map<string, MatchInfo>();
    walkAll(tree, (n) => {
      const kTxt = (n.isArrayItem ? `[${n.key}]` : n.key).toLowerCase();
      const vTxt = n.children
        ? ''
        : n.type === 'string'
          ? JSON.stringify(n.value).toLowerCase()
          : String(n.value).toLowerCase();
      const kM = kTxt.indexOf(q);
      const vM = vTxt.indexOf(q);
      if (kM >= 0 || vM >= 0) {
        matches.push(n);
        matchMap.set(n.path, { kM, vM });
        let p: TreeNode | null = n.parent;
        while (p) {
          autoExpand.add(p.path);
          p = p.parent;
        }
      }
    });
    return { matches, autoExpand, matchMap };
  }, [tree, debouncedSearch]);

  // 新的搜索到来时把 active 重置到第一条匹配；不是用 effect 而是用 render 比较
  const [activeMatchIdx, setActiveMatchIdx] = useState(-1);
  const [prevMatches, setPrevMatches] = useState(searchData.matches);
  if (prevMatches !== searchData.matches) {
    setPrevMatches(searchData.matches);
    setActiveMatchIdx(searchData.matches.length > 0 ? 0 : -1);
  }

  // 有效的展开路径 = 用户展开 ∪ 搜索自动展开
  const expandedPaths = useMemo(() => {
    const combined = new Set(userExpandedPaths);
    for (const p of searchData.autoExpand) combined.add(p);
    return combined;
  }, [userExpandedPaths, searchData.autoExpand]);

  // 滚动到 active match（纯 DOM 副作用，无 setState）
  useEffect(() => {
    if (activeMatchIdx < 0 || activeMatchIdx >= searchData.matches.length) return;
    const target = searchData.matches[activeMatchIdx];
    const el = document.querySelector<HTMLElement>(
      `[data-path="${CSS.escape(target.path)}"]`,
    );
    el?.scrollIntoView({ block: 'center' });
  }, [activeMatchIdx, searchData.matches]);

  // === Handlers ===
  const handleToggle = useCallback((path: string) => {
    setUserExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const handleSelect = useCallback((path: string) => {
    setSelectedPath(path);
  }, []);

  const handleSearchChange = useCallback((next: string) => {
    setSearchTerm(next);
  }, []);

  const handleExpandAll = useCallback(() => {
    if (!tree) return;
    const all = new Set<string>();
    walkAll(tree, (n) => {
      if (n.children && n.children.length) all.add(n.path);
    });
    setUserExpandedPaths(all);
  }, [tree]);

  const handleCollapseAll = useCallback(() => {
    setUserExpandedPaths(new Set());
  }, []);

  return (
    <Window>
      <Workspace
        rawPanel={
          <RawPanel
            rawText={rawText}
            parseResult={parseResult}
            onRawTextChange={setRawText}
          />
        }
        treePanel={
          <TreePanel
            tree={tree}
            stats={stats}
            expandedPaths={expandedPaths}
            selectedPath={selectedPath}
            searchTerm={searchTerm}
            searchMatches={searchData.matches}
            matchMap={searchData.matchMap}
            highlightedSearchTerm={debouncedSearch}
            activeMatchIdx={activeMatchIdx}
            onSelect={handleSelect}
            onToggle={handleToggle}
            onSearchChange={handleSearchChange}
            onActiveMatchChange={setActiveMatchIdx}
            onExpandAll={handleExpandAll}
            onCollapseAll={handleCollapseAll}
          />
        }
        propPanel={<PropPanel node={selectedNode} />}
      />
    </Window>
  );
}