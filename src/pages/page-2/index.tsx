import type { CSSProperties } from 'react'

import type { PageRenderProps } from '../registry'

const TIMELINE = [
  { range: '1950s - 1980s', point: '符号主义与规则系统' },
  { range: '1990s - 2010s', point: '统计学习与数据驱动' },
  { range: '2020s - 2026', point: '生成式 AI 与多模态融合' },
]

export function Page2({ reducedMotion }: PageRenderProps) {
  const lineLeadMs = 320

  return (
    <section className="page page-2" aria-label="第2页 时间线">
      <div className={`timeline ${reducedMotion ? 'is-reduced' : ''}`}>
        <div className="timeline-line" />
        <ul>
          {TIMELINE.map((item, index) => {
            const nodeDelay = lineLeadMs + index * 120
            const rangeDelay = nodeDelay + 220

            return (
              <li
                key={item.range}
                style={
                  {
                    '--node-delay': `${nodeDelay}ms`,
                    '--range-delay': `${rangeDelay}ms`,
                  } as CSSProperties
                }
              >
                <div className="timeline-node-group">
                  <span className="timeline-node" />
                  <p className="timeline-point">{item.point}</p>
                </div>
              <p className="timeline-range">{item.range}</p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
