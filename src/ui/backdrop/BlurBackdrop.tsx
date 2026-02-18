import type { CSSProperties } from 'react'

type BlurBackdropProps = {
  pageId: number
  reducedMotion: boolean
}

export function BlurBackdrop({ pageId, reducedMotion }: BlurBackdropProps) {
  const style = {
    '--page-hue': String(pageId * 22),
    '--bg-play-state': reducedMotion ? 'paused' : 'running',
  } as CSSProperties

  return <div className="blur-backdrop" aria-hidden="true" style={style} />
}
