/** Toast API：暴露给消费侧的 `toast()` 函数 */
export interface ToastApi {
  toast: (msg: string) => void;
}
