import { useEffect, useState } from 'react';

/**
 * 将一个频繁变化的值防抖后输出。
 *
 * @param value 原始值
 * @param delay 延迟毫秒数（默认 200）
 */
export function useDebounce<T>(value: T, delay = 200): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}