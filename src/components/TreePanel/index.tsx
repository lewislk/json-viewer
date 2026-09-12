import { useCallback, useMemo, useRef } from "react";
import type { KeyboardEvent, Ref } from "react";
import type { TreePanelProps } from "./interface";
import { SearchBox } from "./search-box";
import type { SearchBoxHandle } from "./search-box";
import { TreeView } from "./tree-view";
import { useGlobalShortcut } from "../../hooks/use-global-shortcut";
import "./index.css";

export function TreePanel(props: TreePanelProps) {
  const {
    tree,
    stats,
    expandedPaths,
    selectedPath,
    searchTerm,
    searchMatches,
    matchMap,
    highlightedSearchTerm,
    activeMatchIdx,
    onSelect,
    onToggle,
    onSearchChange,
    onActiveMatchChange,
    onExpandAll,
    onCollapseAll,
  } = props;

  const searchRef = useRef<SearchBoxHandle>(null);

  // ⌘F / Ctrl+F 聚焦搜索框
  // 当焦点落在原始视图（RawPanel）内时，跳过拦截、把按键交给浏览器原生查找弹窗，
  // 这样搜的就是 textarea 里的原始文本而不是格式化视图。
  useGlobalShortcut(
    "f",
    () => {
      searchRef.current?.focus();
      searchRef.current?.select();
    },
    {
      withMod: true,
      skipWhen: () => {
        const active = document.activeElement;
        return !!active && active.closest(".raw-panel") !== null;
      },
    },
  );

  const searchCountText = useMemo(() => {
    if (!searchTerm) return "";
    if (searchMatches.length === 0) return "无结果";
    return `${searchMatches.length} 个结果`;
  }, [searchTerm, searchMatches.length]);

  const goNext = useCallback(() => {
    if (searchMatches.length === 0) return;
    onActiveMatchChange((activeMatchIdx + 1) % searchMatches.length);
  }, [onActiveMatchChange, activeMatchIdx, searchMatches.length]);

  const goPrev = useCallback(() => {
    if (searchMatches.length === 0) return;
    onActiveMatchChange(
      (activeMatchIdx - 1 + searchMatches.length) % searchMatches.length,
    );
  }, [onActiveMatchChange, activeMatchIdx, searchMatches.length]);

  const handleEnter = (e: KeyboardEvent) => {
    if (e.shiftKey) {
      goPrev();
    } else {
      goNext();
    }
  };

  const handleEscape = () => {
    onSearchChange("");
    searchRef.current?.focus();
  };

  const activeMatchPath =
    activeMatchIdx >= 0 && activeMatchIdx < searchMatches.length
      ? searchMatches[activeMatchIdx].path
      : null;

  return (
    <section className="tree-panel">
      <header className="tree-panel-head">
        <span className="tree-panel-title">格式化视图</span>
        <div className="tree-panel-tools">
          <SearchBox
            ref={searchRef as Ref<SearchBoxHandle>}
            value={searchTerm}
            count={searchCountText}
            onChange={onSearchChange}
            onEnter={handleEnter}
            onEscape={handleEscape}
          />
          <button
            type="button"
            className="tree-panel-tbtn"
            title="查找上一个（Shift+Enter）"
            aria-label="查找上一个"
            disabled={searchMatches.length === 0}
            onClick={goPrev}
          >
            上一个
          </button>
          <button
            type="button"
            className="tree-panel-tbtn"
            title="查找下一个（Enter）"
            aria-label="查找下一个"
            disabled={searchMatches.length === 0}
            onClick={goNext}
          >
            下一个
          </button>
          <button
            type="button"
            className="tree-panel-tbtn"
            title="展开所有节点（⌘⇧E）"
            onClick={onExpandAll}
          >
            全部展开
          </button>
          <button
            type="button"
            className="tree-panel-tbtn"
            title="收缩所有节点（⌘⇧C）"
            onClick={onCollapseAll}
          >
            全部收缩
          </button>
        </div>
      </header>

      <div className="tree-panel-body">
        {tree ? (
          <TreeView
            root={tree}
            expanded={expandedPaths}
            selectedPath={selectedPath}
            activeMatchPath={activeMatchPath}
            searchTerm={highlightedSearchTerm}
            matchMap={matchMap}
            onSelect={onSelect}
            onToggle={onToggle}
          />
        ) : null}
      </div>

      <footer className="tree-panel-status">
        <span>共 {stats.count} 个字段</span>
        <span className="tree-panel-sep">·</span>
        <span>{stats.maxDepth + 1} 层</span>
        <span className="tree-panel-sep">·</span>
        <span>{expandedPaths.size} 个节点已展开</span>
      </footer>
    </section>
  );
}
