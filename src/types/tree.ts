/**
 * JSON 节点类型
 */
export type JsonType = 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array';

/**
 * 树节点
 *
 * 从 JSON 数据派生而来的中间结构。每帧渲染时根据 parsed data 重建。
 * - 叶子节点：拥有 `value`，无 `children`
 * - 非叶子节点（object/array）：拥有 `children` 和 `childCount`
 *
 * `kM` / `vM` 是搜索时设置的命中位置（key/value 中的子串下标），用于在行内渲染 `<mark>` 高亮。
 */
export interface TreeNode {
  /** 节点 key（对象的属性名或数组的下标字符串） */
  key: string;
  /** 从根出发的路径，例如 `$.users[0].name` */
  path: string;
  /** 嵌套深度（根为 0） */
  depth: number;
  /** 是否是数组元素（用于决定 key 显示成 `[i]`） */
  isArrayItem: boolean;
  /** 父节点 */
  parent: TreeNode | null;
  /** JSON 类型 */
  type: JsonType;
  /** 节点对应的原始值（叶子节点等于 value，非叶子是引用本身） */
  data: unknown;
  /** 子节点（仅 object/array） */
  children?: TreeNode[];
  /** 子节点数量（仅 object/array） */
  childCount?: number;
  /** 叶子值（仅叶子节点） */
  value?: unknown;
  /** key 中搜索词命中的下标（-1 表示未命中） */
  kM?: number;
  /** value 中搜索词命中的下标（-1 表示未命中） */
  vM?: number;
}

/** 树统计 */
export interface TreeStats {
  count: number;
  maxDepth: number;
}

/** JSON 解析结果 */
export type ParseResult =
  | { ok: true; data: unknown }
  | { ok: false; error: string };