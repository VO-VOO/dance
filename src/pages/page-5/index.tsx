import { ImageStack, type ImageStackItem } from '../../ui/gallery/ImageStack'
import type { PageRenderProps } from '../registry'

const GALLERY: ImageStackItem[] = [
  {
    id: 'g1',
    title: '图像叙事样本 01',
    description: '主图退场与次图进场使用统一时间线同步文本。',
    imageSrc: '/images/sample-1.jpg',
  },
  {
    id: 'g2',
    title: '图像叙事样本 02',
    description: '非激活层保留模糊遮罩与堆叠深度。',
    imageSrc: '/images/sample-2.jpg',
  },
  {
    id: 'g3',
    title: '图像叙事样本 03',
    description: '文本容器居中，内容长度变化不抖动。',
    imageSrc: '/images/sample-3.jpg',
  },
  {
    id: 'g4',
    title: '图像叙事样本 04',
    description: 'active + next3 渲染窗口策略保证稳定帧率。',
    imageSrc: '/images/sample-4.jpg',
  },
  {
    id: 'g5',
    title: '图像叙事样本 05',
    description: '可继续扩展本地素材，不改变组件接口。',
    imageSrc: '/images/sample-5.jpg',
  },
]

export function Page5({ laneIndex }: PageRenderProps) {
  const activeIndex = Math.min(laneIndex, GALLERY.length - 1)

  return (
    <section className="page page-5" aria-label="第5页 图库堆叠">
      <ImageStack items={GALLERY} activeIndex={activeIndex} />
    </section>
  )
}
