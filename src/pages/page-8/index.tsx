import { FlashlightText } from '../../ui/text/FlashlightText'
import type { PageRenderProps } from '../registry'

import { page8TextPairs } from './textData'

export function Page8({ laneIndex, reducedMotion }: PageRenderProps) {
  if (page8TextPairs.length === 0) {
    return (
      <section className="page page-8" aria-label="第8页 艺术文本">
        <p>未检测到可用文案，请检查 page-8.yaml。</p>
      </section>
    )
  }

  const activeIndex = Math.min(laneIndex, page8TextPairs.length - 1)
  const item = page8TextPairs[activeIndex]
  const kicker = `片段 ${activeIndex + 1} / ${page8TextPairs.length}`

  return (
    <section className="page page-8" aria-label="第8页 艺术文本">
      <p className="art-kicker">{kicker}</p>
      <FlashlightText
        origin={item.origin}
        translation={item.translation}
        source={item.source}
        reducedMotion={reducedMotion}
      />
    </section>
  )
}
