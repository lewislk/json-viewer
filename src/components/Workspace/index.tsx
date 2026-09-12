import { useCallback, useRef, useState } from 'react';
import type { WorkspaceProps } from './interface';
import { Splitter } from './splitter';
import './index.css';

type Widths = { raw: number; tree: number };

// 三栏初始宽度比例：raw : tree : prop = 5 : 11 : 3
const PROP_FLEX = 3;
const MIN_FLEX = 1;

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

/**
 * 三栏工作区 + 两个可拖拽分隔条。
 *
 * 宽度由 flex-grow 比例控制：
 * - 第一栏 : 第二栏 : 第三栏 = widths.raw : widths.tree : 3
 * - 第三栏 flex-grow 固定为 3，由用户拖拽不可改变
 *
 * 拖动分隔条时各栏 flex-grow 按以下规则调整：
 * - 拖动 Sp1（raw ↔ tree）：调整第一栏，第二栏 grow 保持不变
 * - 拖动 Sp2（tree ↔ prop）：保持第一栏不变，第二栏 grow 占鼠标位置减第一栏宽度
 */
export function Workspace({ rawPanel, treePanel, propPanel }: WorkspaceProps) {
  const [widths, setWidths] = useState<Widths>({ raw: 5, tree: 11 });
  const wsRef = useRef<HTMLDivElement>(null);

  const total = widths.raw + widths.tree + PROP_FLEX;

  // 鼠标 clientX → 该位置对应的 flex-grow 单位（基于当前 total）
  const clientXToFlex = useCallback(
    (clientX: number) => {
      const el = wsRef.current;
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * total;
    },
    [total],
  );

  const handleRawDrag = useCallback(
    (clientX: number) => {
      const newRaw = clientXToFlex(clientX);
      setWidths((prev) => ({
        raw: clamp(newRaw, MIN_FLEX, total - prev.tree - MIN_FLEX),
        tree: prev.tree,
      }));
    },
    [clientXToFlex, total],
  );

  const handleTreeDrag = useCallback(
    (clientX: number) => {
      const x = clientXToFlex(clientX);
      setWidths((prev) => ({
        raw: prev.raw,
        tree: clamp(x - prev.raw, MIN_FLEX, total - prev.raw - MIN_FLEX),
      }));
    },
    [clientXToFlex, total],
  );

  return (
    <div ref={wsRef} className="workspace-root">
      <section
        className="workspace-panel"
        style={{ flex: `${widths.raw} 1 0` }}
      >
        {rawPanel}
      </section>

      <Splitter onDragMove={handleRawDrag} />

      <section
        className="workspace-panel"
        style={{ flex: `${widths.tree} 1 0` }}
      >
        {treePanel}
      </section>

      <Splitter onDragMove={handleTreeDrag} />

      <section
        className="workspace-panel workspace-prop-panel"
        style={{ flex: `${PROP_FLEX} 1 0` }}
      >
        {propPanel}
      </section>
    </div>
  );
}