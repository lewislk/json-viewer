import source from './demo.json?raw';

/**
 * 编辑器初始文本 / 「载入示例」数据源。
 *
 * 由 demo.json 原始内容直接提供，避免 JSON.stringify 重新格式化后与原文产生差异
 * （如缩进、文件末尾换行）。
 */
export const INITIAL_TEXT: string = source;
