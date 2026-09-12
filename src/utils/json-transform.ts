/**
 * JSON 文本转换工具：格式化、压缩、字符串转义/去转义。
 *
 * 设计原则：
 * - 当输入可被 `JSON.parse` 时，直接基于 JSON 操作（结果严格合法）。
 * - 当输入不合法时，尽量回退到「字符串层面」的最优努力处理（用于 `minify` / `escape` 按钮）。
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

/** 去除字符串转义后重新格式化 */
export function unescapeText(text: string): string {
  const unescaped = unescapeString(text);
  try {
    return JSON.stringify(JSON.parse(unescaped), null, 2);
  } catch {
    return unescaped;
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