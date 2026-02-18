import { useEffect, useMemo, useState } from 'react'

export function useReducedMotion() {
  const [systemReducedMotion, setSystemReducedMotion] = useState(false)
  const [manualPreference, setManualPreference] = useState<boolean | null>(null)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setSystemReducedMotion(media.matches)

    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  const reducedMotion = useMemo(
    () => (manualPreference === null ? systemReducedMotion : manualPreference),
    [manualPreference, systemReducedMotion],
  )

  return {
    reducedMotion,
    source: manualPreference === null ? ('system' as const) : ('manual' as const),
    setPreference: setManualPreference,
  }
}
