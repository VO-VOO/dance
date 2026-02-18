import { FlashlightText } from '../../ui/text/FlashlightText'
import type { PageRenderProps } from '../registry'

const ART_TEXTS = [
  {
    origin: 'Aesthetic curiosity drifts between wonder and noise.',
    translation: '审美与好奇在惊奇与噪声之间漂移。',
    source: 'Source: Narrative Fragment 01',
  },
  {
    origin: 'We build mirrors, then mistake reflections for truth.',
    translation: '我们制造镜子，却常把倒影误认为真相。',
    source: 'Source: Narrative Fragment 02',
  },
  {
    origin: 'Speed magnifies desire before meaning catches up.',
    translation: '速度先放大欲望，而意义总是迟到。',
    source: 'Source: Narrative Fragment 03',
  },
]

export function Page8({ laneIndex, reducedMotion }: PageRenderProps) {
  const item = ART_TEXTS[Math.min(laneIndex, ART_TEXTS.length - 1)]

  return (
    <section className="page page-8" aria-label="第8页 艺术文本">
      <p className="art-kicker">审美·好奇·迷失·浮躁</p>
      <FlashlightText
        origin={item.origin}
        translation={item.translation}
        source={item.source}
        reducedMotion={reducedMotion}
      />
    </section>
  )
}
