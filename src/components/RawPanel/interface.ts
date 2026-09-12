import type { ParseResult } from '../../types/tree';

export type RawPanelProps = {
  /** 当前编辑器内容 */
  rawText: string;
  /** 当前文本的解析结果（成功或失败） */
  parseResult: ParseResult;
  /** 文本变更时回调 */
  onRawTextChange: (next: string) => void;
};