/**
 * 内联 SVG 图标集合。保持与原 HTML 一致的视觉风格。
 */

type IconProps = {
  size?: number;
  className?: string;
  strokeWidth?: number;
};

const baseProps = (p: IconProps) => ({
  width: p.size ?? 16,
  height: p.size ?? 16,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: p.strokeWidth ?? 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className: p.className,
  'aria-hidden': true,
});

/** 树节点的展开/折叠箭头 */
export function ChevronIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M6 4l4 4-4 4" />
    </svg>
  );
}

/** 搜索放大镜 */
export function SearchIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="7" cy="7" r="4.4" />
      <path d="M10.4 10.4L14 14" />
    </svg>
  );
}

/** 复制图标 */
export function CopyIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <rect x="5.5" y="5.5" width="7.5" height="7.5" rx="1.5" />
      <path d="M10.5 5.5v-2a1 1 0 00-1-1H4a1 1 0 00-1 1v6.5a1 1 0 001 1h1.5" />
    </svg>
  );
}

/** 「展开所有」双箭头朝下 */
export function ExpandAllIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M3.5 4.5L8 8.5l4.5-4" />
      <path d="M3.5 9.5L8 13.5l4.5-4" />
    </svg>
  );
}

/** 「收缩所有」双箭头朝上 */
export function CollapseAllIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M3.5 9.5L8 5.5l4.5 4" />
      <path d="M3.5 4.5L8 .5l4.5 4" transform="translate(0 2.5)" />
    </svg>
  );
}

/** 查找上一个：朝上小箭头 */
export function PrevMatchIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M3.5 10.5L8 6.5l4.5 4" />
      <path d="M3.5 6.5L8 2.5l4.5 4" />
    </svg>
  );
}

/** 查找下一个：朝下小箭头 */
export function NextMatchIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M3.5 5.5L8 9.5l4.5-4" />
      <path d="M3.5 9.5L8 13.5l4.5-4" />
    </svg>
  );
}

/** PropPanel 空状态：箭头 + 铅笔 */
export function PlaceholderEmptyIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6.5 3.2L17.8 8.6l-4.9 1.4-1.4 4.9z" />
      <path d="M11.5 12.5L17 18" />
    </svg>
  );
}

/** PropPanel：对象/数组占位（对象 = 立方体，数组 = 中括号） */
export function ObjectPlaceholderIcon({ isArray }: { isArray: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {isArray ? (
        <>
          <path d="M8.5 3.8c-1.3 0-1.9.7-1.9 2.2v2.9c0 1.2-.6 1.9-1.9 2 1.3.1 1.9.8 1.9 2v2.9c0 1.5.6 2.2 1.9 2.2" />
          <path d="M15.5 3.8c1.3 0 1.9.7 1.9 2.2v2.9c0 1.2.6 1.9 1.9 2-1.3.1-1.9.8-1.9 2v2.9c0 1.5-.6 2.2-1.9 2.2" />
        </>
      ) : (
        <>
          <path d="M12 2.8L21 7.4v9.2L12 21.2 3 16.6V7.4z" />
          <path d="M3 7.4l9 4.6 9-4.6" />
          <path d="M12 12v9.2" />
        </>
      )}
    </svg>
  );
}