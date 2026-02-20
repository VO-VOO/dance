# 当前预设动画与交互基线 (Animation Baseline)

为确保后续引入的高级感动效（如各种弹性动画、环境光泽等）不会破坏现有体系，特将当前仓库 `speech` 中所有主要页面的动画逻辑统一记录如下：

## 全局框架 (Global Transitions)
- **背景游走**: `.global-backdrop` 使用 `radial-gradient` 和 `linear-gradient`，配合 `backdrop-drift` 关键帧实现 16 秒一层的线性往复位移。
- **页面间翻页**: `.page-slot` 利用 JS 计算的 `translateY (offset * 100%)` 进行纵向排列。切换时依赖 CSS 的 `transition: transform 680ms cubic-bezier(0.22, 0.74, 0.24, 1), opacity 340ms ease` 实现纵向滑动与淡入淡出。
- **减弱动态效果 (Reduced Motion)**: 检测到系统的无障碍选项时，使用 `.reduced-motion` 强行将 `animation-duration` 和 `transition-duration` 设为 0ms，或移除复杂特效。

---

## 1. 标题页 & 结束页 (Page 1 & 9: Title & Thanks)
- **背景聚光灯**: `.page-title::before` 从左下角产生一道包含杂色梯度的光芒，通过 `title-spotlight-from-corner` (2400ms) 从一角扫入并最终固定。
- **文字主体**: `title-rise` (缓慢上升淡入) 结合 `title-upright-land` (通过 3D `rotateX` 模拟从前倾拍平到地面的动作)。
- **文字倒影/阴影**: 利用伪元素 `::after` 配合 `title-ground-shadow` 进行 `skew` 和 `scale`，产生类似站在地面的阴影感。

## 2. 时间轴页 (Page 2: Timeline)
- **天气背景**: 内嵌 iframe `weather.html`，切换节点时通过 API 调度场景，iframe 本身通过 CSS 淡入淡出 (`opacity 260ms`)。
- **横贯线**: `timeline-line-in` 以左侧为原点 `transform: scaleX` 展开。
- **时间与节点文字**: `timeline-item-in` 和 `timeline-phase-in` 结合 `blur`（模糊）和 `translate`（纵向位移）依次延时出现 (Staggered Animation)。

## 3. 卡片页 (Page 3: Cards)
- **背景映射**: 根据激活的卡片，将该卡片的背景高斯模糊 (`filter: blur`) 模糊地透射在 `.global-backdrop::after` 层，切换过程有缓动延时 (`340ms ~ 3000ms`)。
- **发牌入场**: 页面激活时，卡片先执行 `card-gather-in` 汇聚到屏幕中央，然后延时触发 `card-deal-out` 飞发到各自的 Grid 槽位中。
- **鼠标 3D 悬浮**: `.card-tilt-shell` 通过 JS 的 `onPointerMove` 实时计算 `rotateX/Y`，结合 CSS `transition: transform 180ms ease-out` 实现平滑归位。
- **卡片翻转**: 当点击时，`.flip-card` 添加 `.is-flipped` 类，通过 CSS 触发 `rotateY(180deg)`，使用 `620ms cubic-bezier`。

## 4. 图片堆叠页 (Page 4: Gallery)
- **层级堆叠**: 只渲染当前和往后 3 张（共 4 层）。依据 `.depth-0` 到 `.depth-3` 类，分别施加不同程度的 `translate3d`（位移）、`scale`（缩小）、`filter: blur`（模糊）和 `opacity`（透明度）。
- **点击切换**: 依靠 React 状态修改 class 触发深度的重新分配，依靠原生 `transition` (440ms cubic-bezier) 实现位移挤出的过渡。
- **底部标题**: `caption-in` 简单的升起淡入 (250ms)。

## 5. 视频页 (Page 5: Video)
- **边框跑马灯**: 外层 `.video-shell::after` 使用彩色 `conic-gradient` 搭配 `filter: blur`，并添加 `hue-rotate` 关键帧实现 5秒/圈 的无限色彩流转。

## 6. 表格页 (Page 6: Table)
- **表格框架入场**: `.table-wrap` 使用 `table-form-in`（从高斯模糊、低饱和度逐渐清晰，并带有 `translateY`）。
- **表格文字入场**: `table` 自身使用 `table-sharpen-in` (从大比例缩放并极其模糊的状态，缩回至原本大小并清晰)。
- **背景微粒特效**: `.table-wrap::after` (使用多重径向渐变伪造的微光点) 执行 `table-particles-collapse` (从大范围且有旋转角度的状态，迅速向中心收缩并消失)。
- **3D 悬浮**: 类似卡片页的跟随鼠标计算 `rotateX/Y`。

## 7. 奇点临近页 (Page 7: Singularity)
- **SVG 曲线渲染**: 曲线使用 `singularity-curve-draw` (基于 `stroke-dashoffset` 的描边动画) 展开。
- **曲线光晕**: 曲线展开后，触发 `singularity-curve-glow` 无限交替呼吸 (drop-shadow)。
- **光带区域**: `.singularity-area` 执行 `singularity-area-rise` 上升并渐显。

## 8. 艺术文本页 (Page 8: Art)
- **深邃黑背景**: 当该页激活时，通过根界面的 `.page-art-active` 切断全局的流光背景，改为绝对纯黑。
- **探照灯双层交互**: 由 Canvas 或 JS 控制的手电筒/探照灯擦除逻辑，使鼠标下方呈现第二层文字（红底译文）。

---

### 设计补充说明
当前所有动画很大程度上依赖原生预设的 CSS 贝塞尔曲线，在响应式和“打断（Interruptible）”容错处理上稍弱。未来的改进方向应重点偏向：
1. **替换固化的 CSS ease-out 为 JS/Spring 模型计算**（尤其是针对跟随鼠标的 3D Tilt）。
2. **分离进入动画与状态动画**，以免高频点击导致的卡顿截断。
