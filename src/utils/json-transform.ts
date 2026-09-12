/**
 * JSON 文本转换工具：格式化、压缩、字符串转义/去转义。
 *
 * 设计原则：
 * - `format` 严格要求输入是合法 JSON，否则抛 `SyntaxError`（外层 RawPanel
 *   用 toast 兜住）。
 * - `unescapeText` 有三级回退（详见函数内 JSDoc）：
 *   合法 JSON → `format`；`escapeText` 输出 → 解开 `escapeString` 包裹后
 *   再 `format`；其他 → `unescapeString` 字符串层反向解码。
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
 * 三级回退路径：
 * 1. `format` 路径：输入是合法 JSON，直接 `JSON.parse` + `JSON.stringify`。
 *    `JSON.parse` 已把所有 string 字段值的两字符转义序列（`\n` `\t` `\"`
 *    `\\` `\uXXXX`）解成真字符，`JSON.stringify` 输出时再以字面形式写出，
 *    得到的仍是合法 JSON，textarea 多行展示时换行 / Tab 可见。
 *
 * 2. `escapeText` 反向路径：输入是 `escapeText` 处理过的 JSON 文档。
 *    `escapeText` 的输出特征是 `JSON.stringify(...)` 外面套了两层包裹——所有
 *    `\` 都被加倍成 `\\`、所有 `"` 都被转义成 `\"`，但没有裸 LF / CR / Tab。
 *    反向操作是依次把 `\"` 还原成 `"`、`\\` 还原成 `\`；得到的中间结果就是
 *    `JSON.stringify(JSON.parse(orig))`，重新 `format` 即得。这一步主要
 *    服务「删空转义」→「去除转义」的还原场景。
 *
 * 3. `unescapeString` 路径：兜底覆盖「整篇文本被当成字符串转义保存」的
 *    场景——按 `\\u` → `\\n` → ... → `\\\\` 的顺序做字符串层反向解码。
 */
export function unescapeText(text: string): string {
  try {
    return format(text);
  } catch {
    try {
      return format(unescapeEscapeWrapping(text));
    } catch {
      return unescapeString(text);
    }
  }
}

/**
 * 还原 `escapeString` 在合法 JSON 字符串外面套的两层包裹。
 * 即把 `\"` 还原成 `"`，再把 `\\` 还原成 `\`。两个步骤的相对顺序与各自匹配
 * 互不干扰：先 `\"` → `"` 后 `\\` → `\` 可以让 `\\\"` → `\\"` → `\"`，反之
 * `\\\"` → `\\"` → `\"`，结果相同。
 */
function unescapeEscapeWrapping(s: string): string {
  return s.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
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