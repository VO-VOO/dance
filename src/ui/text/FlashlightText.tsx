import type { CSSProperties } from 'react'

type FlashlightTextProps = {
  origin: string
  translation: string
  source: string
  reducedMotion: boolean
}

export function FlashlightText({ origin, translation, source, reducedMotion }: FlashlightTextProps) {
  const style = {
    '--mx': '50%',
    '--my': '50%',
  } as CSSProperties

  return (
    <section
      className={`flashlight-text ${reducedMotion ? 'is-reduced' : ''}`}
      style={style}
    >
      <p className="origin-layer">{origin}</p>
      <p className="translation-layer">{translation}</p>
      <small className="text-source">{source}</small>
    </section>
  )
}
