import { useMemo } from "react";
import type { TreeNode } from "../../types/tree";
import { keyDisplay } from "../../utils/tree-builder";
import { CopyIcon, ObjectPlaceholderIcon } from "../Icons";
import { copyText } from "../../utils/clipboard";
import { useToast } from "../Toast/use-toast";
import "./index.css";

type ObjectPreviewProps = {
  node: TreeNode;
};

/** 节点值的简短展示（用于对象/数组预览卡内的子项缩略） */
function shortValueOf(node: TreeNode): string {
  if (node.children) {
    return node.type === "array" ? "[…]" : "{…}";
  }
  if (node.type === "string") {
    const raw = String(node.value);
    return JSON.stringify(raw.length > 30 ? `${raw.slice(0, 30)}…` : raw);
  }
  return String(node.value);
}

/**
 * 对象 / 数组节点的值预览卡片。
 *
 * 显示类型、子项数量、前 3 个子项的 `key : value` 缩略，
 * 并提供「复制 JSON」按钮把整段值复制到剪贴板。
 */
export function ObjectPreview({ node }: ObjectPreviewProps) {
  const { toast } = useToast();
  const isArray = node.type === "array";

  const previewText = useMemo(() => {
    const count = node.childCount ?? 0;
    if (!node.children || count === 0) return "";
    const head = node.children
      .slice(0, 3)
      .map((c) => `${keyDisplay(c)} : ${shortValueOf(c)}`)
      .join("  ·  ");
    return count > 3 ? `${head}  ·  …` : head;
  }, [node]);

  const handleCopy = async () => {
    const ok = await copyText(JSON.stringify(node.data, null, 2));
    toast(ok ? "已复制到剪贴板" : "复制失败，请手动选择复制");
  };

  return (
    <div className="prop-panel-placeholder-card">
      <span className="prop-panel-placeholder-icon">
        <ObjectPlaceholderIcon isArray={isArray} />
      </span>
      <div className="prop-panel-ph-label">{node.type}</div>
      <div className="prop-panel-ph-sub">
        {isArray
          ? `包含 ${node.childCount ?? 0} 个元素（非基础数据类型）`
          : `包含 ${node.childCount ?? 0} 个键（非基础数据类型）`}
      </div>
      {previewText && (
        <div className="prop-panel-ph-preview">{previewText}</div>
      )}
      <button
        type="button"
        className="prop-panel-copy-btn"
        onClick={handleCopy}
      >
        <CopyIcon size={11} />
        复制 JSON
      </button>
    </div>
  );
}
