# React 编码规范（项目级强制约定）

> 本文件是项目级编码规范的唯一来源。新建 / 修改 / 重命名文件前必须阅读本文。
> 涉及本文未定义的规范，按业界主流约定处理，**先与维护者确认后再补登到本文**。

---

## 1. 目录结构

### 1.1 标准项目目录树

```text
my-react-project/
├── public/                # 静态资源（favicon / robots.txt / og-image 等），原样输出
│   └── *.ico / *.svg
├── src/
│   ├── app/               # 应用级：Provider 树、路由、全局错误边界
│   │   ├── providers.tsx
│   │   ├── router.tsx
│   │   └── error-boundary.tsx
│   ├── assets/            # 静态资源：图片、字体、全局 css、svg
│   │   ├── images/
│   │   └── styles/        # 全局样式（global.css / reset.css）
│   ├── components/        # 跨特性的通用组件
│   │   └── <Name>/        # 组件目录（PascalCase），见 §1.3
│   │       ├── index.tsx
│   │       ├── index.css
│   │       ├── interface.ts
│   │       └── <sub>.tsx
│   ├── features/          # 业务特性（业务规模大时启用，见 §1.5）
│   │   └── <feature>/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── types.ts
│   │       └── index.ts
│   ├── hooks/             # 跨特性的通用 React Hook
│   ├── lib/               # 第三方库二次封装（axios 实例、dayjs 配置等）
│   ├── pages/             # 路由级页面（**SPA**，非 Next.js Pages Router）
│   │   ├── Home/
│   │   │   ├── index.tsx
│   │   │   └── index.css
│   │   └── Login/
│   ├── services/          # 网络请求封装（axios / fetch 实例 + api 函数）
│   │   ├── request.ts
│   │   └── api.ts
│   ├── store/             # 全局状态管理（Zustand / Redux / Jotai）
│   │   └── index.ts
│   ├── utils/             # 通用工具（纯函数 + 简单 IO，如 clipboard、localStorage）
│   ├── constants/         # 编译期常量、枚举、固定文案
│   ├── config/            # 运行时配置（import.meta.env 读取、功能开关）
│   ├── types/             # 跨多个特性的全局类型
│   ├── mocks/             # 静态数据、demo、fixture
│   ├── App.tsx            # 根组件（仅做应用编排：Provider 包裹 + Router 挂载）
│   └── main.tsx           # 项目入口，挂载 App 到 #root
├── index.html             # Vite 入口 HTML（<div id="root"></div>）
├── .gitignore
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

> 📌 **新项目按本树初始化**。已有项目按 §1.2 / §1.4 增量收敛，按 §1.5 演进。

### 1.2 通用目录用途一览

| 目录 | 用途 | 文件命名 |
| --- | --- | --- |
| `src/app/` | 应用级：Provider 树、路由、全局错误边界 | `kebab-case` |
| `src/assets/` | 静态资源：图片、字体、全局 css、svg | — |
| `src/components/` | 跨特性的通用组件 | 见 §1.3 |
| `src/features/` | 业务特性（业务规模大时启用） | `kebab-case` |
| `src/hooks/` | 跨特性的通用 React Hook | `kebab-case` |
| `src/lib/` | 第三方库二次封装（axios 实例、dayjs 配置等） | `kebab-case` |
| `src/pages/` | 路由级页面（**SPA**，非 Next.js Pages Router） | `PascalCase`（目录） |
| `src/services/` | **仅**网络请求封装 | `kebab-case` |
| `src/store/` | 全局状态管理 | `kebab-case` |
| `src/utils/` | 通用工具（纯函数 + 简单 IO，如 clipboard、localStorage） | `kebab-case` |
| `src/constants/` | **编译期**常量、枚举、固定文案 | `kebab-case` |
| `src/config/` | **运行时**配置（`import.meta.env` 读取、功能开关） | `kebab-case` |
| `src/types/` | 跨多个特性的全局类型；单特性类型就近放 | `kebab-case` |
| `src/mocks/` | 静态数据、demo、fixture | `kebab-case` |

**目录边界速记**：
- `services/` ↔ `utils/`：网络 IO 进 `services/`，浏览器 API（clipboard、localStorage）进 `utils/`
- `constants/` ↔ `config/`：编译期常量进 `constants/`，运行时读环境的进 `config/`
- `lib/` ↔ `utils/`：`lib/` 专做"对第三方库的封装"，`utils/` 是项目自写的纯函数

### 1.3 组件目录布局（`src/components/<Name>/`）

每个业务组件单独成目录，目录名 = 组件名（`PascalCase`）。目录内固定结构：

```
<Name>/
├── index.tsx         # 组件主入口（必须）
├── interface.ts      # Props / 公开类型（必须）
├── <sub>.tsx         # 子组件（kebab-case）
├── <sub>.css         # 样式（与组件同名）
└── index.css         # 组件根样式（与目录名对应）
```

> ✅ 正确示例：`TreePanel/index.tsx` + `TreePanel/tree-view.tsx` + `TreePanel/index.css`
> ❌ 错误示例：`TreePanel/TreeView.tsx`（子组件大写）、`TreePanel/styles.css`（命名不一致）

### 1.4 目录命名

- 业务 / 公共组件目录：`PascalCase`（如 `TreePanel`、`RawPanel`）
- 工具 / 资源目录：`kebab-case`（如 `utils`、`data`）
- 单文件目录：避免，宁可直接放父目录的 `index.tsx`

### 1.5 目录演进（type-based → hybrid）

当 `src/components/` 出现 15+ 跨特性组件、`src/hooks/` 出现 10+ 跨特性 hook 时，type-based 目录会让"找东西"和"重构"变难。**触发条件**：

| 信号 | 行动 |
| --- | --- |
| 某个业务域有 ≥ 3 个相关组件/hook/工具 | 抽到 `features/<feature>/` |
| 组件被 2+ 特性复用 | 留在 `src/components/` |
| 类型只在 1 个特性内用 | 放 `features/<feature>/types.ts` |

演进后的 hybrid 目录：

```text
src/
├── app/                # 应用级（保留）
├── components/         # 仅放跨特性的通用 UI
├── hooks/              # 仅放跨特性的通用 hooks
├── lib/                # 第三方库封装
├── features/           # 业务特性（按业务域切分）
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── types.ts
│   │   └── index.ts    # barrel export，对外只暴露 index
│   ├── editor/
│   └── ...
├── pages/              # 路由级页面（也可归到 features/<feature>/pages/）
├── utils/
├── constants/
├── config/
├── types/              # 仅放跨多个特性的全局类型
└── mocks/
```

**迁移原则**：
- 一次只迁一个特性，不要一次性重构
- 迁移后用 `features/<feature>/index.ts` 做 barrel export，外部只 `import { useAuth } from '@/features/auth'`
- 旧的 `src/components/<Xxx>/` 可以保留作为"重导出"，渐进删除

### 1.6 测试目录约定

采用 **就近测试**（React Testing Library 文档示例默认）：

| 类型 | 放法 | 示例 |
| --- | --- | --- |
| 单元 / 组件测试 | 与被测文件同目录，`.test.ts(x)` 后缀 | `utils/tree-builder.test.ts`、`TreePanel/tree-view.test.tsx` |
| 集成 / E2E 测试 | `src/testing/e2e/` | `src/testing/e2e/login-flow.test.ts` |
| 通用测试工具 / mock setup | `src/testing/` | `src/testing/test-utils.tsx`、`src/testing/msw-handlers.ts` |

文件命名：`<被测文件名>.test.ts(x)` 或 `<被测文件名>.spec.ts(x)`，同一项目内**只用一种**。

---

## 2. 文件命名规范（强制）

### 2.1 总则
**所有非 React 组件文件统一使用 `kebab-case`（小写 + 短线）**。理由：
- macOS / Windows 默认大小写不敏感，避免 `useDebounce` vs `usedebounce` 引发幽灵 import
- 与 URL、CLI、grep 风格一致
- 与本项目 `components/` 下的子文件风格统一

### 2.2 文件命名速查表

| 文件类型 | 命名风格 | 示例 |
| --- | --- | --- |
| React 组件（主入口） | `kebab-case` | `search-box.tsx`、`json-editor.tsx` |
| 组件 `index.tsx` | 固定 | `index.tsx` |
| 组件 Props / 接口 | `kebab-case` | `interface.ts` |
| 自定义 Hook | `kebab-case` | `use-debounce.ts`、`use-global-shortcut.ts` |
| 工具函数 | `kebab-case` | `tree-builder.ts`、`json-transform.ts`、`clipboard.ts` |
| 类型 / 接口 | `kebab-case` | `tree.ts` |
| 常量 | `kebab-case` | `api-endpoints.ts` |
| 静态数据 | `kebab-case` | `demo.ts`（单词） |
| 样式 | `kebab-case`，与组件同名 | `index.css`、`tree-view.css` |
| 测试 | 与被测文件同名 + `.test.ts(x)`，放被测文件同目录（见 §1.6） | `tree-builder.test.ts` |
| React 组件名（**标识符**） | `PascalCase` | `function TreeView()`、`export function SearchBox` |
| Hook 标识符 | `useXxx`（camelCase） | `export function useDebounce()` |

> ⚠️ **关键区别**：「文件路径」是 `kebab-case`，「导出的标识符（变量 / 函数 / 类名）」是 `PascalCase` / `camelCase`。两者风格刻意不同，目的是从路径一眼看出"这是文件名"。

### 2.3 单个单词的特例
单词本身（如 `clipboard.ts`、`tree.ts`）没有大小写问题，保持原样即可 —— 这同时是 `kebab-case` 也是 `camelCase`。

---

## 3. 标识符命名规范

### 3.1 组件
- React 组件：`PascalCase`，文件名 `kebab-case`。
- 一个文件**只导出一个组件**（默认导出或具名导出），禁止一个文件多组件混杂。
- 子组件私有于父组件时：放在父组件目录内（如 `TreePanel/tree-view.tsx`），不要提升到 `components/` 根。

### 3.2 Hook
- 必须以 `use` 开头，camelCase：`useDebounce`、`useGlobalShortcut`、`useToast`。
- 文件名用 kebab-case：`use-debounce.ts`、`use-global-shortcut.ts`。
- Hook 入参 / 返回值用具名 `type` 而非 `any`；返回对象用 `{ ... }` 解构友好形式。

### 3.3 工具函数
- 函数名：`camelCase` 动词开头：`buildTree`、`walkAll`、`formatJSON`、`copyText`。
- 文件名：`kebab-case`：`tree-builder.ts`、`json-transform.ts`。
- 纯函数：不依赖 React、不持有状态；允许有入参和返回值。
- 副作用函数（剪贴板、localStorage、fetch）：单独放一个文件，名字标明动作：`clipboard.ts` 而非 `utils.ts`。

### 3.4 类型 / 接口
- `type` / `interface` 名：`PascalCase`，不加 `I` 前缀：`TreeNode`、`PropPanelProps`、`MatchInfo`。
- Props 类型以组件名 + `Props` 结尾：`PropPanelProps`、`SearchBoxHandle`。
- 联合类型 / 字面量类型：`PascalCase`：`type NodeType = 'string' | 'number' | ...`。
- 文件名用 kebab-case：`interface.ts`（与组件同名目录内）或 `tree.ts`（全局类型）。

### 3.5 常量
- 模块级常量：`UPPER_SNAKE_CASE`：`INITIAL_TEXT`、`MAX_DEPTH`。
- 枚举值：`UPPER_SNAKE_CASE` 或 `PascalCase`，同一文件内保持一致。
- 配置文件对象（运行时用）：`camelCase`。

### 3.6 CSS 类名
- 全部小写 + 短线，组件作用域前缀：`tree-panel-head`、`tree-view-row-selected`、`prop-panel-copy-btn`。
- 不使用 BEM 严格语法（项目里保持扁平），但要保证**全局唯一**（避免与 Tailwind / 其他组件冲突）。
- 组件 CSS 文件名与组件文件同名：`tree-view.tsx` → `tree-view.css`；目录根样式用 `index.css`。

---

## 4. 导入与导出

### 4.1 导入顺序
按以下分组，组间空一行：

```ts
// 1. React / 框架内置
import { useCallback, useMemo } from 'react';

// 2. 第三方库
import { SomeLib } from 'some-lib';

// 3. 项目内别名路径（@/）—— 当前项目用相对路径，按距离从近到远
import { useToast } from '../Toast/use-toast';
import { keyDisplay } from '../../utils/tree-builder';
import type { TreeNode } from '../../types/tree';

// 4. 样式（必须放最后）
import './index.css';
```

### 4.2 导入路径
- 当前项目用相对路径（`./`、`../`），暂未配置 `@/` 别名。
- 跨目录引用禁止 `../../../` 超过 2 层；如出现，应在 `tsconfig.json` 加 `paths` 改用 `@/`。
- `import type { ... }` 必须显式标注 `type` 关键字，便于 esbuild 摇树。

### 4.3 导出方式
- 组件：`export function Foo()`（具名）或 `export default function Foo()`。**同一项目内推荐具名导出**，便于重构和静态分析。
- Hook / 工具：只用具名 `export function`。
- 一个文件只 export 一个主要标识符；类型可同文件多 export。

---

## 5. 注释与文档

### 5.1 何时写注释
- ✅ 公共函数 / 组件的"做什么"（一句中文 `/** */`）
- ✅ 非显然的设计决策 / 副作用说明
- ✅ 复杂算法的"为什么这样写"而非"做了什么"
- ❌ 显而易见的代码不要写注释
- ❌ 不要用注释代替命名

### 5.2 JSDoc 风格
```ts
/**
 * 树节点的搜索匹配信息。
 * - kM：键中搜索词的下标，-1 表示未命中
 * - vM：值中搜索词的下标，-1 表示未命中
 */
export type MatchInfo = { kM: number; vM: number };
```

### 5.3 行内注释
- 用 `//` 标注"段落分隔"（如 `// === 搜索 ===`），不要画 ASCII 框。
- 关键不变量、副作用、约束写在一行内：`// 解析失败时仍保留 rawText，让用户编辑`。

---

## 6. TypeScript 规范

### 6.1 类型严格度
- 项目 `tsconfig` 已开启 `strict` 相关选项，**禁止**用 `any` / `// @ts-ignore` 绕过。
- 不确定类型时用 `unknown` + 收窄，或显式 `as` 收窄到具体类型。
- 函数入参 / 返回值必须有显式或推导的类型；公共 API 必须显式声明。

### 6.2 接口 vs 类型别名
- 描述对象形状：优先 `interface`（更易扩展、`extends` 友好）。
- 描述联合类型、工具类型、映射类型：用 `type`。
- 同义重复时（如 `type A = { ... }` 和 `interface A` 行为等价），按上下文就近选择。

### 6.3 泛型
- 单字母大写：`T`、`K`、`V`，约束场景加 `<T extends ...>`。
- 多泛型时给出语义化默认：`<TData, TError>`。

---

## 7. React 组件规范

### 7.1 函数组件
- 只用函数组件 + Hooks，不用 `class` 组件。
- 组件函数顶部顺序：解构 props → `useRef` → `useMemo` / `useCallback` → `useEffect` → 普通函数 → `return`。
- 单组件 JSX 行数 ≤ ~120 行；超出拆子组件。

### 7.2 Props
- Props 集中放在组件目录的 `interface.ts`。
- 必填字段不放默认值；可选字段给默认值。
- `onXxx` 命名：`onClick`、`onSelect`、`onRawTextChange`，动词在前，camelCase。
- 受控组件的回调签名统一：`(value: T) => void` 或 `(e: Event) => void`，不混用。

### 7.3 状态归属
- 能从 props / 派生数据算出来的不放进 state。
- 跨组件共享的 state 提升到最近的共同祖先；过深时考虑 Context / 状态库。
- 派生数据用 `useMemo`，副作用用 `useEffect`；能 `useMemo` + render 时比较解决的（"adjust state during rendering"）优先用这个模式。

### 7.4 副作用
- 副作用（订阅、定时器、事件监听、DOM 操作）必须在 `useEffect` 内，并在清理函数中释放。
- 纯 DOM 副作用（如 `scrollIntoView`）可以放 `useEffect`，但不要在里面 `setState` 触发级联渲染。

### 7.5 性能
- 子组件频繁重渲、且 props 引用稳定时，用 `React.memo`。
- 列表渲染必须给 `key`，用稳定 ID（业务字段），不用 index（除非列表静态）。
- 大量数据列表考虑虚拟滚动（`react-window` 等）。

---

## 8. 错误处理

- 同步 try / catch：捕获后转为用户可读信息（如 `toast('操作失败：' + e.message)`），不要让原始 Error 冒泡到 UI。
- 异步：`await` 必须 try / catch 或 `.catch()`，未处理的 Promise 会被 ESLint 警告。
- 解析 / 转换等可能失败的纯函数：返回 `Result<T, E>` 判别联合（参考本项目 `ParseResult`），不抛异常。

---

## 9. 样式约定

- 单文件 CSS（不用 CSS-in-JS、不用 Tailwind，除非项目后续引入）。
- 组件 CSS 与组件同目录：`tree-view.tsx` ↔ `tree-view.css`；目录根样式 `index.css`。
- 全局样式放 `src/assets/styles/`（如 `global.css`、`reset.css`）。
- 颜色 / 间距 / 字号用 CSS 变量集中在 `index.css` 顶部，方便主题切换。

---

## 10. 变更与重构

- 任何**超过 10 行**的改动、改动文件 ≥ 2 个的，按 [`AGENTS.md`](../../AGENTS.md) 规则询问是否沉淀到 `docs/modules/`。
- 涉及本规范未定义的命名 / 结构 / 模式时，**先给建议、用户确认后再补登到本文件**，不要事后追认。
- 跨模块 / 跨文件重命名（如把 `useDebounce.ts` → `use-debounce.ts`）必须用 IDE 重构功能或 `sed` 批量替换 import 路径，并运行 `pnpm lint` 验证。

---

## 11. 组件目录中 Context + Hook + 组件的拆分

**触发条件**：`react-refresh/only-export-components` ESLint 规则报错，或组件目录内需要同时导出 `XxxProvider` 组件 + `useXxx` hook + `XxxContext`。

**问题根因**：
- 组件目录的 `index.tsx` 只能导出"组件类"（首字母大写的标识符 —— React 组件、Context const）
- 不能同时导出"非组件"（如 hook function），否则触发 `react-refresh` 错误

**文件布局**（按 react-refresh 规则都 OK）：

```
<Name>/
├── index.tsx              # 只导出 <Name> 组件（PascalCase，react-refresh 视为 only components）
├── interface.ts           # Props / Context API 类型
├── <name>-context.ts      # 只导出 XxxContext（首字母大写 const，规则视为"组件"）
└── use-<name>.ts          # 只导出 useXxx（首字母小写 function，规则视为"非组件"）
```

**外部导入方式**：

```ts
// ✅ 推荐：直接定位到具体文件
import { ToastProvider } from './components/Toast';
import { useToast } from './components/Toast/use-toast';

// ❌ 避免：index.tsx 二次导出 hook
// export { ToastProvider, useToast } from './use-toast';
// 这种写法会让 index.tsx 不再是 "only components"，再次违反规则
```

**本项目标准示例**：`src/components/Toast/`

```
Toast/
├── index.tsx           # 只导出 ToastProvider
├── interface.ts        # ToastApi 类型
├── toast-context.ts    # 只导出 ToastContext（const）
├── use-toast.ts        # 只导出 useToast（function）
└── index.css
```

**判断文件布局是否合规**：
- `index.tsx` → grep `export function <Name>` 或 `export default function <Name>`，**只能有 1 个组件**
- 任何文件**只导出组件**（首字母大写）或**只导出非组件**（首字母小写）→ OK
- 同一文件**混合**大小写开头的导出 → 必触发 react-refresh 错误

---

## 附：业界规范参考

- React 官方：[File Structure](https://react.dev/learn/start/project-structure)（无强制，但推荐"按功能 / 类型分目录"）
- Vite 模板 / Next.js：`kebab-case` 为主流
- `eslint-plugin-unicorn`：`filename-case` rule 默认推荐 `kebab-case`
- Airbnb React Style Guide
- Bulletproof React：https://github.com/alan2207/bulletproof-react（业界引用最多的 React 架构文档）
