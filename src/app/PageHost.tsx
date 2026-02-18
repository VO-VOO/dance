import type { NavState } from '../engine/nav/navTypes'
import type { PageDefinition } from '../pages/registry'
import type { TextSettings } from './types'

type PageHostProps = {
  pages: PageDefinition[]
  state: NavState
  settings: TextSettings
  reducedMotion: boolean
  onLaneNextForPage: (pageId: number, laneCount: number) => void
}

export function PageHost({
  pages,
  state,
  settings,
  reducedMotion,
  onLaneNextForPage,
}: PageHostProps) {
  const visibleIndices = [state.pageIndex - 1, state.pageIndex, state.pageIndex + 1].filter(
    (index) => index >= 0 && index < pages.length,
  )

  return (
    <main className="page-host" aria-label="I SEE YOU narrative pages">
      {visibleIndices.map((index) => {
        const page = pages[index]
        const laneIndex = state.laneIndexByPage[page.id] ?? 0
        const offset = index - state.pageIndex
        const isActive = offset === 0

        return (
          <section
            key={page.id}
            className={`page-slot ${isActive ? 'is-active' : 'is-adjacent'}`}
            data-page-index={index}
            tabIndex={-1}
            aria-hidden={!isActive}
            style={{ transform: `translateY(${offset * 100}%)` }}
          >
            <div className="page-surface">
              <page.Component
                laneIndex={laneIndex}
                settings={settings}
                reducedMotion={reducedMotion}
                isActivePage={isActive}
                onLaneNext={() => onLaneNextForPage(page.id, page.lanes)}
              />
            </div>
          </section>
        )
      })}
    </main>
  )
}
