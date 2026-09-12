/**
 * JSON 文本转换工具：格式化、压缩、字符串转义/去转义。
 *
 * 设计原则：
 * - `format` 严格要求输入是合法 JSON，否则抛 `SyntaxError`（外层 RawPanel
 *   用 toast 兜住）。
 * - `unescapeText` 优先走 `format`；输入不合法时回退到 `unescapeString`
 *   （字符串层最优努力），覆盖"整篇文本被当成字符串转义保存"的场景。
 * - `minify` / `escapeText` 在输入不合法时同样回退到「字符串层面」处理。
 */

/** JSON 格式化（2 空格缩进） */
export function format(text: string): string {
  return JSON.stringify(JSON.parse(text), null, 2);
}

/** 移除所有空白字符；如果能解析则基于 JSON 压缩，否则做正则替换 */
export function minify(text: string): string {
  try {
    return JSON.stringify(JSON.parse(text));
  } catch {
    return text.replace(/\s+/g, '');
  }
}

/** 删除空格后对引号、反斜杠与控制字符做字符串转义 */
export function escapeText(text: string): string {
  let compressed: string;
  try {
    compressed = JSON.stringify(JSON.parse(text));
  } catch {
    compressed = text.replace(/\s+/g, '');
  }
  return escapeString(compressed);
}

/**
 * 解析为 JSON 后重新以 2 空格缩进格式化。
 *
 * 旧实现是在字符串层全局替换 `\"` `\n` `\t` `\\uXXXX`，会把 JSON 文档本身
 * 的结构性引号也反转义，破坏语法（例如示例数据 line 118 报控制字符）。
 * 本实现：输入合法 JSON 时走 `format`——`JSON.parse` 已经把所有 string 字段值
 * 的两字符转义序列（`\n` `\t` `\"` `\\` `\uXXXX`）解成真字符，`JSON.stringify`
 * 输出时再以字面形式写出，得到的仍是合法 JSON，textarea 多行展示时换行 / Tab
 * 可见；输入不合法时退回到 `unescapeString`（按顺序处理 `\\u` → `\\n` → ... →
 * `\\\\`），用作「整篇文本被当成字符串转义保存」场景的最优努力处理。
 */
export function unescapeText(text: string): string {
  try {
    return format(text);
  } catch {
    return unescapeString(text);
  }
}

/**
 * 将字符串中的反斜杠、引号与控制字符（\n \r \t）转义。
 * 用于把 JSON 文本塞进另一个字符串字段时的预处理。
 */
export function escapeString(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * 反向解码：\uXXXX → 字符，再处理 \\n \\r \\t \\" \\\\
 */
export function unescapeString(s: string): string {
  return s
    .replace(/\\u([0-9a-fA-F]{4})/g, (_m, h: string) =>
      String.fromCharCode(parseInt(h, 16)),
    )
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}