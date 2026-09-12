import {
  useImperativeHandle,
  useRef,
  type ChangeEvent,
  type KeyboardEvent,
  type Ref,
} from 'react';
import { SearchIcon } from '../Icons';
import './index.css';

export type SearchBoxHandle = {
  focus: () => void;
  select: () => void;
};

type SearchBoxProps = {
  ref?: Ref<SearchBoxHandle>;
  value: string;
  count: string;
  onChange: (next: string) => void;
  onEnter: (e: KeyboardEvent<HTMLInputElement>) => void;
  onEscape: () => void;
};

/**
 * 树面板顶部的搜索框。Enter / Esc 由组件内部处理，
 * 焦点 / 选中文本通过 ref 暴露给父级（⌘F 使用）。
 */
export function SearchBox({
  ref,
  value,
  count,
  onChange,
  onEnter,
  onEscape,
}: SearchBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => inputRef.current?.focus(),
      select: () => inputRef.current?.select(),
    }),
    [],
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onEnter(e);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onEscape();
    }
  };

  return (
    <div className="tree-panel-sbox">
      <SearchIcon className="tree-panel-sbox-ico" />
      <input
        ref={inputRef}
        type="text"
        className="tree-panel-sbox-input"
        placeholder="查找"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKey}
        autoComplete="off"
      />
      <span className="tree-panel-sbox-count">{count}</span>
    </div>
  );
}