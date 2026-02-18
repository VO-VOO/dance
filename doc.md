# I SEE YOU 网页完整开发文档

## 1. 文档目标与范围

本文件基于初始设计文稿 `I see you.md`，定义一套可直接进入工程实施的完整开发规范，覆盖：

- 页面信息架构与模块边界
- 视觉系统（色彩、字体、间距、材质）
- 动效语法（统一时序、曲线、编排规则）
- 关键交互（上下页、左右页内、卡片翻转、图库堆叠、视频切换、探照灯文本）
- 代码实现模式与示例（React + TypeScript + CSS Variables）
- 可访问性、性能护栏与验收标准

该文档是开发基线，后续视觉资产（图片/视频）可按文档接口直接接入。

---

## 2. 全局产品定义

### 2.1 交互模型

- 纵向：`ArrowUp` / `ArrowDown` 切换页面
- 横向：`ArrowLeft` / `ArrowRight` 切换当前页面内部子内容（lane）
- 右下角页码指示器常驻
- 页面结构必须可独立维护（每页一个模块）
- 支持用户调节文字大小/文字颜色

### 2.2 页面清单

根据设计稿，当前明确页面为：

- Page 1：标题页 `认识AI。`
- Page 2：时间线页
- Page 3：商用领域卡片页
- Page 5：图库堆叠页
- Page 6：视频页
- Page 7：模型对比表格页
- Page 8：艺术文本页（双语探照灯效果）

说明：Page 4 在设计稿中缺失，工程上保留占位，确保后续可无痛扩展。

---

## 3. 技术栈与实现模式决策

## 3.1 推荐栈

- 框架：`React + TypeScript + Vite`
- 状态：`useReducer`（或 Zustand，二选一）
- 动画：`GSAP Timeline`（主推荐）
- 样式：`CSS Variables + 局部模块化 CSS`（可混合 Tailwind）

选择理由：

- 该项目强调“分段编舞 + 可中断 + 可 seek”，时间线动画比纯声明式更稳
- 页面独立模块 + 全局壳层结构，便于后续新增页面/替换资产
- TypeScript 可以约束页面协议，减少后期维护成本

## 3.2 核心架构

- `AppShell`：全局键盘路由、页码、设置面板、背景层、媒体调度
- `PageHost`：只挂载 `active + prev + next` 三页窗口
- `PageModule`：每页独立导出渲染与动画接口
- `MediaScheduler`：根据当前页与下一步预测进行资源预取与取消

---

## 4. 目录结构（默认落地蓝图）

```text
src/
  app/
    AppShell.tsx
    PageHost.tsx
    PageIndicator.tsx
    SettingsPanel.tsx
  engine/
    nav/
      navTypes.ts
      navReducer.ts
      useKeyboardNav.ts
      focusPolicy.ts
    motion/
      timelineRunner.ts
      motionTokens.ts
      useReducedMotion.ts
    media/
      assetManifest.ts
      mediaScheduler.ts
  ui/
    backdrop/BlurBackdrop.tsx
    cards/CardDeck.tsx
    gallery/ImageStack.tsx
    video/VideoFrame.tsx
    text/FlashlightText.tsx
  pages/
    page-1/index.tsx
    page-2/index.tsx
    page-3/index.tsx
    page-4/index.tsx
    page-5/index.tsx
    page-6/index.tsx
    page-7/index.tsx
    page-8/index.tsx
  styles/
    tokens.css
    global.css
```

---

## 5. 视觉系统（Design Tokens）

风格定位：极简、克制、电影感；避免紫色偏置；以中性色和冷色强调为主。

## 5.1 色彩

```css
:root {
  --bg-0: #f2f0ed;
  --bg-1: #ffffff;
  --bg-2: #e5e0dc;

  --text-0: #1f1b18;
  --text-1: #6b6661;

  --accent-0: #2c4f6b; /* 主强调 */
  --accent-1: #b83a32; /* 警示/对比 */

  --line-soft: rgba(31, 27, 24, 0.14);
  --shadow-soft: 0 20px 40px -10px rgba(0, 0, 0, 0.12);
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-0: #0d0d0d;
    --bg-1: #1a1a1a;
    --bg-2: #262626;

    --text-0: #e6e6e6;
    --text-1: #a2a2a2;

    --accent-0: #8fbfe0;
    --accent-1: #e06c66;
    --line-soft: rgba(230, 230, 230, 0.16);
  }
}
```

## 5.2 字体

- 标题（Serif）：`"Noto Serif SC", "Source Han Serif SC", serif`
- 正文（Sans）：`"Inter", "PingFang SC", "Hiragino Sans GB", sans-serif`
- 数据（Mono）：`"JetBrains Mono", "SF Mono", monospace`

```css
:root {
  --fz-display: clamp(3rem, 6vw, 5.5rem);
  --fz-h1: clamp(2rem, 3.8vw, 3.2rem);
  --fz-h2: clamp(1.5rem, 2.8vw, 2.2rem);
  --fz-body: clamp(1rem, 1.2vw, 1.125rem);
  --fz-caption: clamp(0.75rem, 0.8vw, 0.875rem);

  --lh-tight: 1.2;
  --lh-normal: 1.5;
  --lh-loose: 1.7;
}
```

## 5.3 空间与质感

```css
:root {
  --sp-1: 4px;
  --sp-2: 8px;
  --sp-3: 12px;
  --sp-4: 16px;
  --sp-6: 24px;
  --sp-8: 32px;
  --sp-12: 48px;
  --sp-16: 64px;

  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 18px;

  --blur-glass: blur(14px) saturate(130%);
  --blur-bg-max: 52px;
}
```

---

## 6. 动效语法（Motion Grammar）

## 6.1 动效原语

```css
:root {
  --dur-fast: 180ms;
  --dur-base: 360ms;
  --dur-slow: 640ms;
  --dur-cinematic: 1100ms;

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-smooth: cubic-bezier(0.33, 1, 0.68, 1);
  --ease-linear: linear;

  --stagger-1: 60ms;
  --stagger-2: 100ms;
}
```

规则：

- 主动效优先使用 `transform` 和 `opacity`
- 避免动画 `width/height/top/left/margin`
- 高代价效果（`filter/backdrop-filter`）只用于少数层

## 6.2 reduced-motion 降级

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
    scroll-behavior: auto !important;
  }
}
```

JS 侧约束：

- 禁用连续漂移动画
- 卡片发牌改为淡入
- 探照灯效果自动降级为静态双语切换

---

## 7. 页面级开发规范

## 7.1 Page 1：标题页

目标：极简开场，只保留 `认识AI。`。

实现要点：

- 文本绝对居中
- 入场为轻微上浮 + 淡入
- 背景使用低频动态高斯流

示例：

```tsx
export function Page1() {
  return (
    <section className="page page-1" aria-label="第1页 认识AI">
      <h1 className="hero-title">认识AI。</h1>
    </section>
  );
}
```

## 7.2 Page 2：时间线页

目标：按顺序展示时间信息。

强制编排顺序：

1. 时间线从左到右绘制
2. 时间节点下文案逐个出现
3. 时间范围描述逐个出现

实现建议：

- 使用 timeline labels：`line -> nodes -> ranges`
- 时间节点为实心圆
- 时间节点文字字号小于上方范围描述

## 7.3 Page 3：商用领域卡片页

目标：四张卡片发牌落位，点击翻转显示内容。

实现要点：

- 发牌：从底部按顺序上场（stagger）
- 初始显示卡背
- 点击或 `Enter/Space` 触发翻转
- 卡片圆角且尺寸适配文案

3D 卡片关键样式：

```css
.deck {
  perspective: 1000px;
}

.card {
  position: relative;
  transform-style: preserve-3d;
  transition: transform var(--dur-slow) var(--ease-smooth);
}

.card-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
}

.card-back {
  transform: rotateY(180deg);
}

.card.is-flipped {
  transform: rotateY(180deg);
}
```

## 7.4 Page 5：图库堆叠页

目标：大图切换 + 后台堆叠 + 高斯遮罩 + 文本同步切换。

硬性规则：

- 渲染窗口仅保留 `active + next3`
- 非激活图有模糊遮罩
- 当前图退场（左移+淡出），下一张进中位
- 标题与描述与图片时间轴同步
- 文本容器始终居中，长度变化不抖动

数据结构建议：

```ts
type GalleryItem = {
  id: string;
  imageSrc: string;
  bgSrc?: string;
  title: string;
  description: string;
};
```

窗口函数示例：

```ts
function getVisibleStack(items: GalleryItem[], activeIndex: number) {
  return [
    items[activeIndex],
    items[activeIndex + 1],
    items[activeIndex + 2],
    items[activeIndex + 3],
  ].filter(Boolean);
}
```

## 7.5 Page 6：视频页

目标：16:9 大画面，右键切换下一个视频，边框具备彩虹辉光流动。

实现要点：

- `aspect-ratio: 16 / 9`
- 辉光放在伪元素，避免直接对视频本体做重滤镜
- 仅 active 视频播放，其他视频暂停并释放引用

示例：

```css
.video-frame {
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.video-frame::after {
  content: "";
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  background: conic-gradient(
    from 0deg,
    #ff3b30,
    #ff9500,
    #ffcc00,
    #34c759,
    #007aff,
    #5856d6,
    #af52de,
    #ff3b30
  );
  filter: blur(10px);
  opacity: 0.72;
  z-index: -1;
  animation: hue-spin 4s linear infinite;
}

@keyframes hue-spin {
  to {
    transform: rotate(360deg);
  }
}
```

## 7.6 Page 7：模型对比表格页

目标：极简、居中、圆角表格。

实现要点：

- 标题：`2026年2月主流AI编程模型。`
- 表格居中，简洁边线
- 行内容可按顺序淡入

表格字段：

- 模型名
- 性格/能力描述

## 7.7 Page 8：艺术文本页

目标：黑色高斯背景 + 文本切换 + 双语探照灯显隐。

实现要点：

- 顶部小字：`审美·好奇·迷失·浮躁`
- 左右切换主艺术文本
- 中层白字原文
- 底层红字中文翻译
- 鼠标接近时以 radial mask 形成“探照灯”切换
- 底部来源文案随文本变化
- 任意文本长度均保持居中

探照灯核心示例：

```css
.flashlight {
  --mx: 50%;
  --my: 50%;
  --r: 120px;
  mask-image: radial-gradient(circle var(--r) at var(--mx) var(--my), transparent 0%, black 70%);
}
```

---

## 8. 导航状态机与键盘策略

## 8.1 状态定义

```ts
type NavState = {
  pageIndex: number;
  laneIndexByPage: Record<number, number>;
  isTransitioning: boolean;
};
```

## 8.2 事件定义

```ts
type NavEvent =
  | { type: "PAGE_PREV" }
  | { type: "PAGE_NEXT" }
  | { type: "LANE_PREV" }
  | { type: "LANE_NEXT" }
  | { type: "TRANSITION_START" }
  | { type: "TRANSITION_END" };
```

## 8.3 键盘处理模板

```ts
function onKeyDown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName;
  const inEditable =
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    (e.target as HTMLElement)?.isContentEditable;

  if (inEditable) return;

  if (e.key === "ArrowUp") {
    e.preventDefault();
    dispatch({ type: "PAGE_PREV" });
  }
  if (e.key === "ArrowDown") {
    e.preventDefault();
    dispatch({ type: "PAGE_NEXT" });
  }
  if (e.key === "ArrowLeft") {
    e.preventDefault();
    dispatch({ type: "LANE_PREV" });
  }
  if (e.key === "ArrowRight") {
    e.preventDefault();
    dispatch({ type: "LANE_NEXT" });
  }
}
```

约束：

- 不拦截 `Tab/Shift+Tab`
- 页面切换后将焦点落到新页面 landmark
- 避免键盘陷阱

---

## 9. 无障碍规范

必做项：

- 交互元素有可见焦点样式
- 图像有 `alt`
- 图标按钮有 `aria-label`
- 页面容器有 `role="region"` + `aria-label`
- 颜色对比度正文至少 4.5:1
- 提供“减少动态”与“关闭快捷键”开关

---

## 10. 性能护栏

## 10.1 动画与渲染

- 同时重动画元素建议 <= 10
- 模糊半径移动端建议 <= 20px
- 不在大面积元素上高频动画 `filter`
- 使用 `will-change` 时只在动画前后短时开启/移除

## 10.2 媒体加载

- 图片默认 `loading="lazy"`
- 进入预加载窗口前不解码
- 视频默认 `preload="metadata"`
- 非活动视频 `pause` 并释放资源引用

## 10.3 页面挂载窗口

- 强制仅挂载 `active + prev + next`
- 图库强制仅渲染 `active + next3`

---

## 11. 开发阶段计划

## 阶段 A：框架与基础设施

- 创建 AppShell、状态机、键盘路由
- 完成 design tokens 与全局样式
- 建立页面模块协议和占位页

## 阶段 B：核心页面实现

- 完成 Page 1 / 2 / 3 的结构与动效
- 完成 Page 5 图库窗口化
- 完成 Page 6 视频页与辉光边框

## 阶段 C：高级视觉与收尾

- 完成 Page 7 表格页
- 完成 Page 8 探照灯双语页
- 完成 reduced-motion / a11y / 性能调优

---

## 12. 验收清单（Definition of Done）

- [ ] 上下/左右键导航行为符合设计稿
- [ ] 每页独立模块可单独修改与替换
- [ ] 右下角页码始终正确
- [ ] Page 2 时间线动效顺序正确
- [ ] Page 3 发牌与翻转可键盘触发
- [ ] Page 5 仅渲染 active + next3 且文本同步
- [ ] Page 6 16:9 视频 + 彩虹辉光边框生效
- [ ] Page 8 探照灯效果与双语切换可用
- [ ] reduced-motion 生效且无视觉故障
- [ ] 无键盘陷阱，焦点路径正确
- [ ] 移动端无横向滚动，文本可读

---

## 13. 外部参考（用于实现校验）

- Reveal.js 配置与导航：`https://revealjs.com/config/`
- Reveal.js 文档：`https://revealjs.com/`
- WAI-ARIA Keyboard Interface：`https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/`
- WAI-ARIA Carousel Pattern：`https://www.w3.org/WAI/ARIA/apg/patterns/carousel/`
- MDN keydown：`https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event`
- MDN preventDefault：`https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault`
- MDN clamp：`https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/clamp`
- MDN CSS transforms：`https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_transforms`
- MDN backdrop-filter：`https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter`
- MDN masking：`https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Masking/Introduction`
- MDN animation performance：`https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Animation_performance_and_frame_rate`
- web.dev 高性能动画：`https://web.dev/articles/animations-guide`

---

## 14. 备注

本文档定义的是可直接编码执行的“开发规范层”，不是视觉稿替代品。后续当具体图片/视频资产确定后，只需按 `AssetManifest` 接口接入，不需要改动整体架构。
