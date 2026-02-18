import { ImageStack } from '../../ui/gallery/ImageStack'
import type { PageRenderProps } from '../registry'

import { galleryItems } from './galleryData'

export function Page5({ laneIndex }: PageRenderProps) {
  if (galleryItems.length === 0) {
    return (
      <section className="page page-5" aria-label="第5页 图库堆叠">
        <p>未检测到可用图片，请检查 image/description.yaml 与 image/ 目录。</p>
      </section>
    )
  }

  const activeIndex = Math.min(laneIndex, galleryItems.length - 1)

  return (
    <section className="page page-5" aria-label="第5页 图库堆叠">
      <ImageStack items={galleryItems} activeIndex={activeIndex} />
    </section>
  )
}
