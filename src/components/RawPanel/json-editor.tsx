import { useEffect, useMemo, useRef } from 'react';
import type { ChangeEvent } from 'react';
import './json-editor.css';

type JsonEditorProps = {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
};

/**
 * 带行号 gutter 的 JSON 编辑器。
 *
 * 结构：左侧固定宽度 gutter（行号），右侧 textarea。两侧行高、字号、上内边距完全一致，
 * 因此在视觉上每行对应。当 textarea 滚动时，通过 `transform: translateY(-scrollTop)`
 * 把 gutterInner 同步上移（外层 .gutter 设了 overflow:hidden，无法靠 scrollTop 滚动）。
 */
export function JsonEditor({ value, onChange, placeholder }: JsonEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterInnerRef = useRef<HTMLDivElement>(null);

  // 行号文本：避免每次渲染都做数组 join
  const gutterText = useMemo(() => {
    const lineCount = value.split('\n').length;
    let s = '';
    for (let i = 1; i <= lineCount; i++) s += `${i}\n`;
    return s;
  }, [value]);

  // 同步滚动：textarea.scrollTop → gutterInner.transform
  useEffect(() => {
    const textarea = textareaRef.current;
    const inner = gutterInnerRef.current;
    if (!textarea || !inner) return;
    const onScroll = () => {
      inner.style.transform = `translateY(${-textarea.scrollTop}px)`;
    };
    textarea.addEventListener('scroll', onScroll);
    return () => textarea.removeEventListener('scroll', onScroll);
  }, []);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="raw-panel-body">
      <div className="raw-panel-gutter" aria-hidden>
        <div ref={gutterInnerRef} className="raw-panel-gutter-inner">{gutterText}</div>
      </div>
      <textarea
        ref={textareaRef}
        className="raw-panel-editor"
        spellCheck={false}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
      />
    </div>
  );
}