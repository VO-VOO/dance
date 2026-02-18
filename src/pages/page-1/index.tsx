import type { PageRenderProps } from '../registry'

export function Page1({ settings, reducedMotion }: PageRenderProps) {
  return (
    <section className="page page-1" aria-label="第1页 标题页">
      <h1
        className={`hero-title ${reducedMotion ? 'is-reduced' : 'is-entering'}`}
        style={{ color: settings.textColor }}
      >
        认识AI。
      </h1>
    </section>
  )
}
