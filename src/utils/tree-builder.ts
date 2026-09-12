import type { JsonType, TreeNode, TreeStats } from '../types/tree';

/**
 * 推断 JSON 值的类型字符串。
 */
function inferType(data: unknown): JsonType {
  if (data === null) return 'null';
  if (Array.isArray(data)) return 'array';
  return typeof data as JsonType;
}

/**
 * 从任意 JSON 数据构建一棵树。每个节点同时保留路径、深度、原始数据，便于回溯与高亮。
 *
 * - object/array 节点：拥有 `children` 与 `childCount`
 * - 其余节点：拥有 `value`
 */
export function buildTree(
  data: unknown,
  key: string,
  path: string,
  depth: number,
  isArrayItem: boolean,
  parent: TreeNode | null,
): TreeNode {
  const type = inferType(data);
  const node: TreeNode = {
    key,
    path,
    depth,
    isArrayItem,
    parent,
    type,
    data,
  };
  if (type === 'object' || type === 'array') {
    const isArr = type === 'array';
    const entries = isArr
      ? (data as unknown[]).map((v, i) => [String(i), v] as const)
      : Object.entries(data as Record<string, unknown>);
    node.children = entries.map(([k, v]) =>
      buildTree(
        v,
        k,
        isArr ? `${path}[${k}]` : `${path}.${k}`,
        depth + 1,
        isArr,
        node,
      ),
    );
    node.childCount = node.children.length;
  } else {
    node.value = data;
  }
  return node;
}

/** 深度优先遍历整棵树（先序） */
export function walkAll(node: TreeNode, fn: (n: TreeNode) => void): void {
  fn(node);
  if (node.children) {
    for (const c of node.children) walkAll(c, fn);
  }
}

/** 按路径查找节点；找不到返回 null */
export function findNodeByPath(
  root: TreeNode | null,
  path: string | null,
): TreeNode | null {
  if (!root || path == null) return null;
  if (root.path === path) return root;
  if (!root.children) return null;
  for (const c of root.children) {
    const hit = findNodeByPath(c, path);
    if (hit) return hit;
  }
  return null;
}

/** 节点的展示 key：数组项用 `[i]`，对象属性直接显示 */
export function keyDisplay(node: TreeNode): string {
  return node.isArrayItem ? `[${node.key}]` : node.key;
}

/** 收集节点总数与最大深度 */
export function collectStats(root: TreeNode | null): TreeStats {
  const stats: TreeStats = { count: 0, maxDepth: 0 };
  if (!root) return stats;
  walkAll(root, (n) => {
    stats.count += 1;
    if (n.depth > stats.maxDepth) stats.maxDepth = n.depth;
  });
  return stats;
}

/** 在树中查找所有路径在 set 中的节点，方便调试与未来扩展 */
export function ancestorsOf(node: TreeNode): TreeNode[] {
  const chain: TreeNode[] = [];
  let p: TreeNode | null = node.parent;
  while (p) {
    chain.push(p);
    p = p.parent;
  }
  return chain;
}