import source from "./demo.json?raw";
import { format } from "../utils/json-transform";

/**
 * 编辑器初始文本 / 「载入示例」数据源。
 *
 */
export const INITIAL_TEXT: string = format(source);
