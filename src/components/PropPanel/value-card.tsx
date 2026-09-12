import type { JsonType } from "../../types/tree";
import { CopyIcon } from "../Icons";
import { copyText } from "../../utils/clipboard";
import { useToast } from "../Toast/use-toast";
import "./index.css";

type ValueCardProps = {
  type: JsonType;
  value: unknown;
};

/** 基础类型节点的值展示卡片：等宽字体 + 右上角「复制」按钮 */
export function ValueCard({ type, value }: ValueCardProps) {
  const { toast } = useToast();

  const display =
    type === "string"
      ? JSON.stringify(value)
      : value == null
        ? String(value)
        : String(value);

  const handleCopy = async () => {
    const text = type === "string" ? String(value) : String(value);
    const ok = await copyText(text);
    toast(ok ? "已复制到剪贴板" : "复制失败，请手动选择复制");
  };

  return (
    <div className="prop-panel-value-card">
      {display}
      <button
        type="button"
        className="prop-panel-copy-btn"
        onClick={handleCopy}
      >
        <CopyIcon size={11} />
        复制
      </button>
    </div>
  );
}
