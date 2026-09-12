import { useCallback, useMemo } from "react";
import type { RawPanelProps } from "./interface";
import { JsonEditor } from "./json-editor";
import {
  escapeText,
  format,
  minify,
  unescapeText,
} from "../../utils/json-transform";
import { INITIAL_TEXT } from "../../data/demo";
import { useToast } from "../Toast/use-toast";
import "./index.css";

type RawPanelOp = {
  label: string;
  title: string;
  handle: (s: string) => string;
  successMessage: string;
};

const OPS: RawPanelOp[] = [
  {
    label: "格式化",
    title: "解析并格式化（2 空格缩进）",
    handle: format,
    successMessage: "已格式化",
  },
  {
    label: "删除空格",
    title: "删除全部空白字符，压缩为单行",
    handle: minify,
    successMessage: "已删除空格",
  },
  {
    label: "删空转义",
    title: "压缩后转义引号、反斜杠与换行",
    handle: escapeText,
    successMessage: "已删除空格并转义",
  },
  {
    label: "去除转义",
    title: "去除转义并重新格式化",
    handle: unescapeText,
    successMessage: "已去除转义",
  },
  {
    label: "载入示例",
    title: "重新载入示例数据",
    handle: () => INITIAL_TEXT,
    successMessage: "已载入示例数据",
  },
];

/**
 * JSON 原始数据面板：工具栏 + 编辑器 + 状态栏。
 *
 * 状态栏展示行数、字符数、解析状态。解析失败时使用 error 配色。
 */
export function RawPanel({
  rawText,
  parseResult,
  onRawTextChange,
}: RawPanelProps) {
  const { toast } = useToast();

  const applyOp = useCallback(
    (op: RawPanelOp) => {
      try {
        onRawTextChange(op.handle(rawText));
        toast(op.successMessage);
      } catch (e) {
        toast(`操作失败：${(e as Error).message || "未知错误"}`);
      }
    },
    [rawText, onRawTextChange, toast],
  );

  const status = useMemo(() => {
    const lines = rawText.split("\n").length;
    const chars = rawText.length;
    const statusText = parseResult.ok
      ? "有效 JSON"
      : `解析失败：${parseResult.error}`;
    return { lines, chars, statusText, isOk: parseResult.ok };
  }, [rawText, parseResult]);

  const statusClass = status.isOk ? "raw-panel-ok" : "raw-panel-err";

  return (
    <section className="raw-panel">
      <header className="raw-panel-head">
        <div className="raw-panel-tools">
          {OPS.map((op) => (
            <button
              key={op.label}
              type="button"
              className="raw-panel-tbtn"
              title={op.title}
              onClick={() => applyOp(op)}
            >
              {op.label}
            </button>
          ))}
        </div>
      </header>

      <JsonEditor
        value={rawText}
        onChange={onRawTextChange}
        placeholder="在此粘贴或输入 JSON…"
      />

      <footer className="raw-panel-status">
        <span>行 {status.lines}</span>
        <span className="raw-panel-sep">·</span>
        <span>{status.chars} 字符</span>
        <span className="raw-panel-sep">·</span>
        <span className={statusClass}>{status.statusText}</span>
      </footer>
    </section>
  );
}
