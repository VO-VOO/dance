import { CardDeck, type CardItem } from '../../ui/cards/CardDeck'
import type { PageRenderProps } from '../registry'

const CARDS: CardItem[] = [
  {
    id: 'coding',
    title: 'AI编程 · Claude Opus 4.5',
    date: '2025年11月24日',
    description: 'SWE 首次突破 80 分，agent 调用与意图理解取得关键进展。',
  },
  {
    id: 'music',
    title: 'AI音乐 · Suno v5',
    date: '2025年9月23日',
    description: '支持乐器音色克隆与人声分离，AI 音乐首次登上热搜。',
  },
  {
    id: 'drawing',
    title: 'AI绘图 · Nano banana pro',
    date: '2025年11月20日',
    description: '面向广告设计的全能绘图模型，支持 4K 多比例输出。',
  },
  {
    id: 'video',
    title: 'AI视频 · Seedance 2',
    date: '2026年2月12日',
    description: '首个具备智能分镜能力的视频模型，融合视频、音频与图像理解。',
  },
]

export function Page3(_props: PageRenderProps) {
  return (
    <section className="page page-3" aria-label="第3页 AI商用领域卡片">
      <h2>AI达到初步商用阶段的领域</h2>
      <CardDeck cards={CARDS} />
    </section>
  )
}
