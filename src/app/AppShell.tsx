import { useEffect, useMemo, useReducer, useState, type CSSProperties } from 'react'

import { focusPageLandmark } from '../engine/nav/focusPolicy'
import { createInitialNavState, type NavState } from '../engine/nav/navTypes'
import { navReducer } from '../engine/nav/navReducer'
import { useKeyboardNav } from '../engine/nav/useKeyboardNav'
import { useReducedMotion } from '../engine/motion/useReducedMotion'
import { BlurBackdrop } from '../ui/backdrop/BlurBackdrop'
import pages from '../pages/registry'
import { PageHost } from './PageHost'
import { PageIndicator } from './PageIndicator'
import { SettingsPanel } from './SettingsPanel'
import type { TextSettings } from './types'

const DEFAULT_SETTINGS: TextSettings = {
  textScale: 1,
  textColor: 'var(--text-0)',
}

export function AppShell() {
  const initialState = useMemo<NavState>(
    () => createInitialNavState(pages.map((page) => page.id)),
    [],
  )

  const [state, dispatch] = useReducer(navReducer, initialState)
  const [settings, setSettings] = useState<TextSettings>(DEFAULT_SETTINGS)
  const [shortcutsEnabled, setShortcutsEnabled] = useState(true)

  const {
    reducedMotion,
    source: reducedMotionSource,
    setPreference: setReducedMotionPreference,
  } = useReducedMotion()

  const activePage = pages[state.pageIndex]

  useKeyboardNav({
    enabled: shortcutsEnabled,
    onPagePrev: () => dispatch({ type: 'PAGE_PREV', pageCount: pages.length }),
    onPageNext: () => dispatch({ type: 'PAGE_NEXT', pageCount: pages.length }),
    onLanePrev: () =>
      dispatch({
        type: 'LANE_PREV',
        pageId: activePage.id,
      }),
    onLaneNext: () =>
      dispatch({
        type: 'LANE_NEXT',
        pageId: activePage.id,
        laneCount: activePage.lanes,
      }),
  })

  useEffect(() => {
    focusPageLandmark(state.pageIndex)
  }, [state.pageIndex])

  const shellStyle = {
    '--user-text-scale': String(settings.textScale),
    '--user-text-color': settings.textColor,
  } as CSSProperties

  return (
    <div className="app-shell" style={shellStyle}>
      <BlurBackdrop pageId={activePage.id} reducedMotion={reducedMotion} />
      <SettingsPanel
        settings={settings}
        onSettingsChange={setSettings}
        shortcutsEnabled={shortcutsEnabled}
        onShortcutsToggle={() => setShortcutsEnabled((prev) => !prev)}
        reducedMotion={reducedMotion}
        reducedMotionSource={reducedMotionSource}
        onReducedMotionChange={setReducedMotionPreference}
      />
      <PageHost
        pages={pages}
        state={state}
        settings={settings}
        reducedMotion={reducedMotion}
      />
      <PageIndicator current={state.pageIndex + 1} total={pages.length} />
    </div>
  )
}
