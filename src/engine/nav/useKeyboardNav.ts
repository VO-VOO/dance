import { useEffect } from 'react'

type KeyboardNavHandlers = {
  enabled: boolean
  onPagePrev: () => void
  onPageNext: () => void
  onLanePrev: () => void
  onLaneNext: () => void
}

function isEditableTarget(target: EventTarget | null) {
  const element = target as HTMLElement | null
  if (!element) return false

  const tag = element.tagName
  return (
    element.isContentEditable ||
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    tag === 'OPTION'
  )
}

export function useKeyboardNav({
  enabled,
  onPagePrev,
  onPageNext,
  onLanePrev,
  onLaneNext,
}: KeyboardNavHandlers) {
  useEffect(() => {
    if (!enabled) return undefined

    function onKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event.target)) return

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault()
          onPagePrev()
          break
        case 'ArrowDown':
          event.preventDefault()
          onPageNext()
          break
        case 'ArrowLeft':
          event.preventDefault()
          onLanePrev()
          break
        case 'ArrowRight':
          event.preventDefault()
          onLaneNext()
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled, onLaneNext, onLanePrev, onPageNext, onPagePrev])
}
