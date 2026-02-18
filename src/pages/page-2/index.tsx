import type { PageRenderProps } from '../registry'

const TIMELINE = [
  { range: '1950s - 1980s', point: '符号主义与规则系统' },
  { range: '1990s - 2010s', point: '统计学习与数据驱动' },
  { range: '2020s - 2026', point: '生成式 AI 与多模态融合' },
]

export function Page2({ reducedMotion }: PageRenderProps) {
  return (
    <section className="page page-2" aria-label="第2页 时间线">
      <div className={`timeline ${reducedMotion ? 'is-reduced' : ''}`}>
        <div className="timeline-line" />
        <ul>
          {TIMELINE.map((item, index) => (
            <li key={item.range} style={{ animationDelay: `${index * 120}ms` }}>
              <span className="timeline-node" />
              <p className="timeline-point">{item.point}</p>
              <p className="timeline-range">{item.range}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
