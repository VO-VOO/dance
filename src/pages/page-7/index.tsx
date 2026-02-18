import type { CSSProperties } from 'react'

import type { PageRenderProps } from '../registry'

const MODELS = [
  ['GPT-5.3-Codex High', '保守、周密思维、安全、服从、高智商'],
  ['Claude Opus 4.6 Adaptive', '中立、自主创造力、自适应推理'],
  ['Kimi K2.5 Thinking', '激进、过度自信、逻辑链不稳定'],
  ['Gemini 3 Pro Preview', '艺术化、发散性思维、低遵从性、高情商'],
]

export function Page7({ reducedMotion }: PageRenderProps) {
  return (
    <section className={`page page-7 ${reducedMotion ? 'is-reduced' : ''}`} aria-label="第7页 模型对比表">
      <h2>2026年2月主流AI编程模型。</h2>
      <table>
        <thead>
          <tr>
            <th>模型</th>
            <th>特征</th>
          </tr>
        </thead>
        <tbody>
          {MODELS.map(([name, trait], index) => (
            <tr
              key={name}
              style={
                {
                  '--row-delay': `${index * 140}ms`,
                } as CSSProperties
              }
            >
              <td>{name}</td>
              <td>{trait}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
