import { useCallback, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import './index.css';

type SplitterProps = {
  /** 拖拽过程中持续回调，传入当前 clientX */
  onDragMove: (clientX: number) => void;
  /** 拖拽结束回调 */
  onDragEnd?: () => void;
};

const DRAGGING_CLASS = 'workspace-splitter-dragging';

/**
 * 垂直分隔条。
 *
 * 通过 `setPointerCapture` 在 `pointerdown` 时锁定指针，使后续
 * `pointermove` 即使移出元素也能继续接收。
 *
 * 视觉变化（hover/dragging 颜色）在 index.css 中定义。
 */
export function Splitter({ onDragMove, onDragEnd }: SplitterProps) {
  const draggingRef = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      draggingRef.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      e.currentTarget.classList.add(DRAGGING_CLASS);
      document.body.classList.add('dragging');
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      onDragMove(e.clientX);
    },
    [onDragMove],
  );

  const handlePointerEnd = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore: pointer already released
      }
      e.currentTarget.classList.remove(DRAGGING_CLASS);
      document.body.classList.remove('dragging');
      onDragEnd?.();
    },
    [onDragEnd],
  );

  return (
    <div
      ref={ref}
      className="workspace-splitter"
      role="separator"
      aria-orientation="vertical"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    />
  );
}