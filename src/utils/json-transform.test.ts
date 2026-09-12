import { describe, it, expect } from 'vitest';

import { escapeText, format, minify, unescapeText } from './json-transform';

// 用 Vite 的 ?raw 直接以 ESM 形式读 demo.json，避免引入 node 类型依赖
import demoRaw from '../data/demo.json?raw';
const DEMO: string = demoRaw;

describe('format', () => {
  it('合法 JSON → 2 空格缩进', () => {
    expect(format('{"a":1,"b":[1,2]}')).toBe('{\n  "a": 1,\n  "b": [\n    1,\n    2\n  ]\n}');
  });

  it('非法 JSON 抛 SyntaxError', () => {
    expect(() => format('{not json}')).toThrow();
  });
});

describe('minify', () => {
  it('合法 JSON → 单行无空白', () => {
    expect(minify('{\n  "a": 1,\n  "b": 2\n}')).toBe('{"a":1,"b":2}');
  });

  it('非法 JSON 退化为正则去空白（不抛）', () => {
    // 输入无法 parse，函数走 text.replace(/\s+/g, '') 分支
    expect(minify('  { a : 1 }  ')).toBe('{a:1}');
  });
});

describe('escapeText', () => {
  it('合法 JSON 走 escapeString 转义关键字符', () => {
    // 输入：JSON.stringify({ a: 'line\n"end"' })
    const input = JSON.stringify({ a: 'line\n"end"' });
    const out = escapeText(input);
    // 期望：用 JSON.stringify 把期望值序列化后比对，避免手写转义
    const compressed = JSON.stringify(JSON.parse(input)); // {"a":"line\n\"end\""}
    const expected = compressed
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
    expect(out).toBe(expected);
  });

  it('非法 JSON 退化为：去空白后再 escape', () => {
    const input = '  hello "world"\n  ';
    const out = escapeText(input);
    // 同样用函数等价写出期望值
    const compressed = input.replace(/\s+/g, ''); // hello"world"
    const expected = compressed
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
    expect(out).toBe(expected);
  });
});

describe('unescapeText', () => {
  it('demo.json 不再破坏 JSON 语法（回归用例）', () => {
    // 旧实现会把整篇文档的 \" \n \t 全反转义，导致 line 118 报控制字符
    const out = unescapeText(DEMO);
    expect(() => JSON.parse(out)).not.toThrow();
  });

  it('demo.json 的 escaped 字段反转义后含真换行 / Tab / 引号 / 反斜杠', () => {
    const out = JSON.parse(unescapeText(DEMO)) as Record<string, unknown>;
    const edge = out.edgeCases as Record<string, unknown>;
    // 用 JSON.stringify 把期望值序列化后再比对，避免测试源码里的转义层级混淆
    expect(JSON.stringify(edge.escaped)).toBe(JSON.stringify('Line 1\nLine 2\tTabbed"Quoted"'));
  });

  it('\\n \\t \\" \\\\ \\uXXXX 在字符串值内被反转义', () => {
    // 用 JSON.stringify 构造 input，保证 a 字段值里的两字符转义序列
    // (\n \t \" \\ \u4e2d) 正确出现在源 JSON 文档中
    // 反转义后字段值是真字符串 Line 1<LF>Line 2<TAB>"Quoted"\x中
    const input = JSON.stringify({ a: 'Line 1\nLine 2\t"Quoted"\\x\u4e2d' });
    const out = JSON.parse(unescapeText(input)) as { a: string };
    expect(out.a).toBe('Line 1\nLine 2\t"Quoted"\\x中');
  });

  it('嵌套 object / 数组结构保持', () => {
    const input = JSON.stringify({ x: { y: ['a\tb', 'c'] }, z: [] });
    const out = JSON.parse(unescapeText(input));
    expect(out).toEqual({ x: { y: ['a\tb', 'c'] }, z: [] });
  });

  it('number / boolean / null 原样', () => {
    const input = JSON.stringify({ n: 1.5, b: true, f: false, z: null });
    expect(JSON.parse(unescapeText(input))).toEqual({ n: 1.5, b: true, f: false, z: null });
  });

  it('非法 JSON 不抛，回退到字符串层 unescapeString', () => {
    // 'not json' 不是合法 JSON，format 抛 SyntaxError，外层 try/catch 兜住
    // 走旧的 unescapeString 路径（无 \\\" \\\\ 时基本是恒等替换）
    expect(() => unescapeText('not json')).not.toThrow();
    expect(unescapeText('not json')).toBe('not json');
  });

  it('含 \\b \\f 等控制字符转义也能正确反转义', () => {
    // \b \f 是 JSON 合法转义；旧 unescapeString 不处理，新实现走 JSON.parse 路径天然支持
    const input = JSON.stringify({ a: 'x\by\fz' });
    const out = JSON.parse(unescapeText(input)) as { a: string };
    expect(out.a).toBe('x\by\fz');
  });
});
