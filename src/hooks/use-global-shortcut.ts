import { useEffect } from 'react';

export type ShortcutOptions = {
  /** 是否需要 Cmd/Ctrl 修饰键 */
  withMod?: boolean;
  /** 额外的允许触发条件，例如「搜索框当前没有焦点」 */
  enabled?: boolean;
  /**
   * 返回 true 时**不**阻止浏览器默认行为、也**不**调用 handler。
   *
   * 用于「焦点在某个区域内时把快捷键交还给浏览器原生行为」的场景：
   * 例如 ⌘F 在原始视图 textarea 内时，让浏览器原生查找弹窗接管，
   * 搜索的是 textarea 里的原始文本而不是格式化视图的数据。
   */
  skipWhen?: (e: KeyboardEvent) => boolean;
};

/**
 * 注册全局键盘快捷键。
 *
 * 快捷键命中后会先调用 `e.preventDefault()`，避免浏览器默认行为
 * （例如 ⌘F 触发系统查找弹窗）与应用内快捷键同时生效。
 * 当 `skipWhen` 返回 true 时会跳过拦截与回调，把按键完全交给浏览器。
 *
 * @param key 监听的按键（不区分大小写）
 * @param handler 触发回调
 * @param options 是否需要修饰键、是否启用、是否跳过
 */
export function useGlobalShortcut(
  key: string,
  handler: (e: KeyboardEvent) => void,
  options: ShortcutOptions = {},
): void {
  const { withMod = false, enabled = true, skipWhen } = options;
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== key.toLowerCase()) return;
      if (withMod && !(e.metaKey || e.ctrlKey)) return;
      if (!withMod && (e.metaKey || e.ctrlKey || e.altKey)) return;
      if (skipWhen?.(e)) return;
      e.preventDefault();
      handler(e);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [key, handler, withMod, enabled, skipWhen]);
}