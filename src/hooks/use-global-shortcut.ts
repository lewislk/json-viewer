import { useEffect } from 'react';

export type ShortcutOptions = {
  /** 是否需要 Cmd/Ctrl 修饰键 */
  withMod?: boolean;
  /** 额外的允许触发条件，例如「搜索框当前没有焦点」 */
  enabled?: boolean;
};

/**
 * 注册全局键盘快捷键。
 *
 * 快捷键命中后会先调用 `e.preventDefault()`，避免浏览器默认行为
 * （例如 ⌘F 触发系统查找弹窗）与应用内快捷键同时生效。
 *
 * @param key 监听的按键（不区分大小写）
 * @param handler 触发回调
 * @param options 是否需要修饰键、是否启用
 */
export function useGlobalShortcut(
  key: string,
  handler: (e: KeyboardEvent) => void,
  options: ShortcutOptions = {},
): void {
  const { withMod = false, enabled = true } = options;
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== key.toLowerCase()) return;
      if (withMod && !(e.metaKey || e.ctrlKey)) return;
      if (!withMod && (e.metaKey || e.ctrlKey || e.altKey)) return;
      e.preventDefault();
      handler(e);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [key, handler, withMod, enabled]);
}