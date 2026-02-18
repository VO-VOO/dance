import { useCallback, useRef } from 'react'
import type { PointerEvent } from 'react'

type FlashlightTextProps = {
  origin: string
  translation: string
  source: string
  reducedMotion: boolean
}

export function FlashlightText({ origin, translation, source, reducedMotion }: FlashlightTextProps) {
  const containerRef = useRef<HTMLElement>(null)

  const setMaskPosition = useCallback((xPercent: number, yPercent: number) => {
    const target = containerRef.current
    if (!target) {
      return
    }

    const clampedX = Math.min(100, Math.max(0, xPercent))
    const clampedY = Math.min(100, Math.max(0, yPercent))

    target.style.setProperty('--mx', `${clampedX}%`)
    target.style.setProperty('--my', `${clampedY}%`)
  }, [])

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (reducedMotion) {
        return
      }

      const rect = event.currentTarget.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) {
        return
      }

      const x = ((event.clientX - rect.left) / rect.width) * 100
      const y = ((event.clientY - rect.top) / rect.height) * 100
      setMaskPosition(x, y)
    },
    [reducedMotion, setMaskPosition],
  )

  const handlePointerLeave = useCallback(() => {
    setMaskPosition(50, 50)
  }, [setMaskPosition])

  return (
    <section
      ref={containerRef}
      className={`flashlight-text ${reducedMotion ? 'is-reduced' : ''}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <p className="origin-layer">{origin}</p>
      <p className="translation-layer">{translation}</p>
      <small className="text-source">{source}</small>
    </section>
  )
}
