# JSON 查看器

一个 macOS 风格的本地 JSON 浏览器，三栏式布局：

- **JSON 原始数据**：可编辑的源码区，带行号 gutter 与滚动同步，配套 `格式化 / 删除空格 / 删空转义 / 去除转义 / 载入示例` 等工具按钮；底部状态栏展示行数、字符数与解析结果
- **JSON 格式化视图**：可折叠 / 展开的递归树，支持节点搜索（自动展开命中项的祖先、`Enter` / `Shift+Enter` 跳匹配、行内 `<mark>` 高亮）、`⌘F` / `Ctrl+F` 聚焦搜索框、`Esc` 清空搜索；底部状态栏展示节点总数、最大深度、已展开节点数
- **选中属性视图**：展示当前选中节点的属性名（数组项显示 `[i]`）、类型（6 种彩色 badge）、完整 JSON 路径（形如 `$.users[0].name`）与属性值——基础类型用等宽字体卡片 + 复制按钮，对象 / 数组用占位图标 + 子项数量 + 前 3 项缩略 + 复制整段 JSON

数据流单向，所有派生数据用 `useMemo` 计算，避免 `useEffect` 内 `setState` 引发的级联渲染。树 / 选中 / 展开变化时通过 React 官方推荐的 "adjust state during rendering" 模式重置。

## 技术栈

| 类别       | 选型                                                                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 构建工具   | Vite 8 + `@vitejs/plugin-react`                                                                                                        |
| 编译器增强 | Babel + `babel-plugin-react-compiler`（启用 React Compiler 自动 memoization）                                                          |
| 框架       | React 19                                                                                                                               |
| 语言       | TypeScript 6（`verbatimModuleSyntax` / `erasableSyntaxOnly` / `noUnusedLocals` / `noUnusedParameters` / `noFallthroughCasesInSwitch`） |
| 样式       | CSS Modules 风格的全局 class + CSS 变量（每个组件一个 `.css`，全局变量集中在 `src/index.css`）                                         |
| Lint       | ESLint flat config + `@eslint/js` / `typescript-eslint` / `react-hooks` / `react-refresh`                                              |

无运行时依赖：除 `react` / `react-dom` 外不引入第三方库，状态管理使用原生 `useState` / `useMemo` / `useRef`，UI 通知用 `Context` + 自定义 hook。

## 目录结构

```
src/
├── App.tsx                          # 顶层状态编排（解析、树、选中、搜索、展开）
├── main.tsx                         # 入口，挂载 ToastProvider
├── index.css                        # CSS 变量 + reset
├── components/
│   ├── Window/                      # 全屏外观壳（fixed inset:0）
│   ├── Workspace/                   # 三栏布局 + 可拖拽分隔条（flex-grow 比例 5 : 11 : 3）
│   ├── RawPanel/                    # 原始数据面板 + 带行号编辑器（json-editor 子组件）
│   ├── TreePanel/                   # 树面板 + 搜索框（search-box）+ 递归 TreeView（tree-view）
│   ├── PropPanel/                   # 选中属性详情：type-badge / prop-field / value-card / object-preview
│   ├── Toast/                       # 全局 Toast（Provider + Context + hook 拆分，react-refresh only-components）
│   └── Icons/                       # 内联 SVG 图标集合
├── hooks/
│   ├── use-debounce.ts              # 防抖（默认 200ms）
│   └── use-global-shortcut.ts       # 全局键盘快捷键（自动 preventDefault，支持 withMod）
├── utils/
│   ├── json-transform.ts            # format / minify / escape / unescape
│   ├── tree-builder.ts              # buildTree / walkAll / findNodeByPath / collectStats / keyDisplay
│   └── clipboard.ts                 # copyText（navigator.clipboard + execCommand 兜底）
├── types/
│   └── tree.ts                      # JsonType + TreeNode + TreeStats + ParseResult
└── data/
    ├── demo.json                    # 示例数据（127 行）
    └── demo.ts                      # INITIAL_TEXT：`?raw` 直读 .json 保留原格式（编辑器初始文本 / 「载入示例」）
```

组件目录布局遵循 `docs/knowledge/react-coding.md §1.3`：每个组件一个 `PascalCase/` 目录，子组件用 `kebab-case`。React Compiler 自动 memoization 下不使用 `React.memo`，由编译器在编译期生成。

## 开发

```bash
pnpm install     # 安装依赖
pnpm dev         # 启动 Vite 开发服务器（默认 http://localhost:5173）
pnpm build       # tsc 类型检查（tsc -b） + Vite 生产构建
pnpm lint        # ESLint
pnpm preview     # 预览生产构建产物
```

## 交互速查

### 全局

| 操作                               | 快捷键 / 按钮   |
| ---------------------------------- | --------------- |
| 聚焦树面板搜索框（并全选当前内容） | `⌘F` / `Ctrl+F` |

### 原始数据面板

| 操作                                                              | 按钮             |
| ----------------------------------------------------------------- | ---------------- |
| 解析并以 2 空格缩进格式化                                         | 顶部「格式化」   |
| 删除全部空白，压缩为单行                                          | 顶部「删除空格」 |
| 压缩后再对引号、反斜杠与换行做字符串转义                          | 顶部「删空转义」 |
| 反向解码 `\uXXXX` / `\n` / `\r` / `\t` / `\"` / `\\` 后重新格式化 | 顶部「去除转义」 |
| 重新载入 `data/demo.json`                                         | 顶部「载入示例」 |

所有原始面板操作成功后弹 Toast（如「已格式化」），解析失败时编辑器内容**不**被覆盖，状态栏提示 `解析失败：xxx`。

### 树面板

| 操作                                            | 快捷键 / 按钮                  |
| ----------------------------------------------- | ------------------------------ |
| 搜索节点（key 或 value 子串匹配，大小写不敏感） | 顶部搜索框                     |
| 跳到下一匹配                                    | `Enter` 或「下一个」按钮       |
| 跳到上一匹配                                    | `Shift+Enter` 或「上一个」按钮 |
| 清空搜索                                        | `Esc`                          |
| 展开 / 折叠单个节点                             | 点击 chevron 按钮，或双击该行  |
| 展开所有节点                                    | 「全部展开」                   |
| 收缩所有节点                                    | 「全部收缩」                   |

搜索时：所有命中节点的祖先会自动展开，行内命中子串渲染为 `<mark>` 高亮；当前激活匹配滚动到视口中央。

### 选中属性面板

| 节点类型                                     | 展示                                                                     | 操作                          |
| -------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------- |
| 未选中                                       | 占位卡片（铅笔图标 + 提示文案）                                          | —                             |
| 基础类型（string / number / boolean / null） | 等宽字体卡片 + 类型 badge                                                | 「复制」按钮复制字面值        |
| object / array                               | 占位图标（立方体 / 中括号）+ 类型 + 子项数量 + 前 3 项缩略（超过则 `…`） | 「复制 JSON」按钮复制整段子树 |

### 工作区

| 操作                            | 方式                                   |
| ------------------------------- | -------------------------------------- |
| 调整 RawPanel / TreePanel 宽度  | 拖拽两栏之间的分隔条                   |
| 调整 TreePanel / PropPanel 宽度 | 拖拽两栏之间的分隔条                   |
| PropPanel 宽度                  | 固定（flex-grow 恒为 3，不可拖拽改变） |
