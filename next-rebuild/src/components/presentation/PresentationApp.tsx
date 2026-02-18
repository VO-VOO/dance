'use client'

import Image from 'next/image'
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type CSSProperties,
} from 'react'

import { artItems, cardItems, galleryItems, tableRows, timelinePoints, videoItems } from './storyData'

type PageDefinition = {
  key: string
  title: string
  lanes: number
}

const pageDefinitions: PageDefinition[] = [
  { key: 'title', title: '标题', lanes: 1 },
  { key: 'timeline', title: '时间轴', lanes: 1 },
  { key: 'cards', title: '卡片', lanes: 1 },
  { key: 'gallery', title: '图片堆叠', lanes: galleryItems.length },
  { key: 'video', title: '视频', lanes: videoItems.length },
  { key: 'table', title: '表格', lanes: 1 },
  { key: 'art', title: '艺术文本', lanes: artItems.length },
]

type NavState = {
  pageIndex: number
  laneIndexByPage: number[]
  isTransitioning: boolean
}

type NavAction =
  | { type: 'PAGE_PREV'; pageCount: number }
  | { type: 'PAGE_NEXT'; pageCount: number }
  | { type: 'LANE_PREV'; pageIndex: number }
  | { type: 'LANE_NEXT'; pageIndex: number; laneCount: number }
  | { type: 'TRANSITION_START' }
  | { type: 'TRANSITION_END' }

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function createInitialState(): NavState {
  return {
    pageIndex: 0,
    laneIndexByPage: pageDefinitions.map(() => 0),
    isTransitioning: false,
  }
}

function navReducer(state: NavState, action: NavAction): NavState {
  const isPageAction = action.type === 'PAGE_PREV' || action.type === 'PAGE_NEXT'
  if (state.isTransitioning && isPageAction) {
    return state
  }

  switch (action.type) {
    case 'PAGE_PREV':
      return {
        ...state,
        pageIndex: clamp(state.pageIndex - 1, 0, action.pageCount - 1),
      }
    case 'PAGE_NEXT':
      return {
        ...state,
        pageIndex: clamp(state.pageIndex + 1, 0, action.pageCount - 1),
      }
    case 'LANE_PREV': {
      const next = state.laneIndexByPage.slice()
      next[action.pageIndex] = Math.max(0, (next[action.pageIndex] ?? 0) - 1)
      return {
        ...state,
        laneIndexByPage: next,
      }
    }
    case 'LANE_NEXT': {
      const next = state.laneIndexByPage.slice()
      next[action.pageIndex] = clamp((next[action.pageIndex] ?? 0) + 1, 0, Math.max(action.laneCount - 1, 0))
      return {
        ...state,
        laneIndexByPage: next,
      }
    }
    case 'TRANSITION_START':
      return {
        ...state,
        isTransitioning: true,
      }
    case 'TRANSITION_END':
      return {
        ...state,
        isTransitioning: false,
      }
    default:
      return state
  }
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
    tag === 'OPTION' ||
    tag === 'BUTTON'
  )
}

type RenderPageProps = {
  laneIndex: number
  isActive: boolean
  reducedMotion: boolean
  onLaneNext: () => void
}

export default function PresentationApp() {
  const [state, dispatch] = useReducer(navReducer, undefined, createInitialState)
  const [reducedMotion, setReducedMotion] = useState(false)
  const transitionTimerRef = useRef<number | null>(null)

  const activePage = pageDefinitions[state.pageIndex]
  const activeLane = state.laneIndexByPage[state.pageIndex] ?? 0

  const currentGalleryLane = state.laneIndexByPage[3] ?? 0
  const currentGalleryItem = galleryItems[Math.min(currentGalleryLane, Math.max(0, galleryItems.length - 1))]
  const galleryBackdrop = activePage.key === 'gallery' ? currentGalleryItem?.src ?? '' : ''

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReducedMotion(mediaQuery.matches)

    onChange()
    mediaQuery.addEventListener('change', onChange)
    return () => mediaQuery.removeEventListener('change', onChange)
  }, [])

  const clearTransitionTimer = useCallback(() => {
    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current)
      transitionTimerRef.current = null
    }
  }, [])

  const startTransitionLock = useCallback(() => {
    dispatch({ type: 'TRANSITION_START' })
    clearTransitionTimer()
    transitionTimerRef.current = window.setTimeout(() => {
      dispatch({ type: 'TRANSITION_END' })
      transitionTimerRef.current = null
    }, reducedMotion ? 80 : 620)
  }, [clearTransitionTimer, reducedMotion])

  const onPagePrev = useCallback(() => {
    if (state.pageIndex <= 0 || state.isTransitioning) return
    dispatch({ type: 'PAGE_PREV', pageCount: pageDefinitions.length })
    startTransitionLock()
  }, [startTransitionLock, state.isTransitioning, state.pageIndex])

  const onPageNext = useCallback(() => {
    if (state.pageIndex >= pageDefinitions.length - 1 || state.isTransitioning) return
    dispatch({ type: 'PAGE_NEXT', pageCount: pageDefinitions.length })
    startTransitionLock()
  }, [startTransitionLock, state.isTransitioning, state.pageIndex])

  const onLanePrev = useCallback(() => {
    dispatch({ type: 'LANE_PREV', pageIndex: state.pageIndex })
  }, [state.pageIndex])

  const onLaneNext = useCallback(() => {
    dispatch({ type: 'LANE_NEXT', pageIndex: state.pageIndex, laneCount: activePage.lanes })
  }, [activePage.lanes, state.pageIndex])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event.target)) return
      if (event.repeat && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) return

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
  }, [onLaneNext, onLanePrev, onPageNext, onPagePrev])

  useEffect(() => {
    return () => clearTransitionTimer()
  }, [clearTransitionTimer])

  useEffect(() => {
    const host = document.querySelector<HTMLElement>('.page-host')
    const active = document.querySelector<HTMLElement>(`[data-page-slot='${state.pageIndex}']`)

    if (host) {
      host.scrollTop = 0
    }

    if (active) {
      try {
        active.focus({ preventScroll: true })
      } catch {
        active.focus()
      }
    }
  }, [state.pageIndex])

  const shellStyle = {
    '--gallery-backdrop': galleryBackdrop ? `url('${galleryBackdrop}')` : 'none',
  } as CSSProperties

  const visibleIndices = useMemo(
    () => [state.pageIndex - 1, state.pageIndex, state.pageIndex + 1].filter((index) => index >= 0 && index < pageDefinitions.length),
    [state.pageIndex],
  )

  return (
    <div className={`presentation-root${reducedMotion ? ' reduced-motion' : ''}`} style={shellStyle}>
      <a className="skip-link" href="#active-page">
        跳转到当前页面内容
      </a>
      <div className="global-backdrop" aria-hidden="true" />

      <main className="page-host" aria-label="I SEE YOU 七页叙事演示">
        {visibleIndices.map((index) => {
          const page = pageDefinitions[index]
          const laneIndex = state.laneIndexByPage[index] ?? 0
          const offset = index - state.pageIndex
          const isActive = offset === 0

          return (
            <section
              key={page.key}
              id={isActive ? 'active-page' : undefined}
              className={`page-slot ${isActive ? 'is-active' : 'is-adjacent'}`}
              data-page-slot={index}
              data-page-key={page.key}
              style={{ transform: `translateY(${offset * 100}%)` }}
              tabIndex={-1}
              aria-hidden={!isActive}
            >
              <div className="page-surface">
                {renderStoryPage(page.key, {
                  laneIndex,
                  isActive,
                  reducedMotion,
                  onLaneNext: () =>
                    dispatch({
                      type: 'LANE_NEXT',
                      pageIndex: index,
                      laneCount: page.lanes,
                    }),
                })}
              </div>
            </section>
          )
        })}
      </main>

      <div className="page-indicator" aria-live="polite" aria-atomic="true">
        <span>{String(state.pageIndex + 1).padStart(2, '0')}</span>
        <span>/</span>
        <span>{String(pageDefinitions.length).padStart(2, '0')}</span>
        <small className="lane-indicator">
          页内 {Math.min(activeLane + 1, activePage.lanes)} / {activePage.lanes}
        </small>
      </div>
    </div>
  )
}

function renderStoryPage(pageKey: string, props: RenderPageProps) {
  switch (pageKey) {
    case 'title':
      return <TitlePage />
    case 'timeline':
      return <TimelinePage reducedMotion={props.reducedMotion} />
    case 'cards':
      return <CardsPage reducedMotion={props.reducedMotion} />
    case 'gallery':
      return (
        <GalleryPage
          laneIndex={props.laneIndex}
          reducedMotion={props.reducedMotion}
          onLaneNext={props.onLaneNext}
        />
      )
    case 'video':
      return <VideoPage laneIndex={props.laneIndex} isActive={props.isActive} onLaneNext={props.onLaneNext} />
    case 'table':
      return <TablePage />
    case 'art':
      return <ArtPage laneIndex={props.laneIndex} isActive={props.isActive} reducedMotion={props.reducedMotion} />
    default:
      return null
  }
}

function TitlePage() {
  return (
    <section className="story-page page-title" aria-label="第1页 标题页">
      <h1>认识AI。</h1>
    </section>
  )
}

function TimelinePage({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <section className={`story-page page-timeline ${reducedMotion ? 'is-reduced' : ''}`} aria-label="第2页 时间轴">
      <div className="timeline-stage">
        <div className="timeline-line" />
        <ul className="timeline-times" aria-hidden="true">
          {timelinePoints.map((point, index) => {
            const style = {
              '--x': point.x,
              '--delay': `${360 + index * 220}ms`,
            } as CSSProperties

            return (
              <li key={`time-${point.time}`} className="timeline-time-item" style={style}>
                <span className={`timeline-node timeline-node-${point.node}`} />
                <span className="timeline-time-text">{point.time}</span>
              </li>
            )
          })}
        </ul>

        <ul className="timeline-phases" aria-label="阶段词">
          {timelinePoints.map((point, index) => {
            const style = {
              '--x': point.x,
              '--delay': `${520 + index * 220}ms`,
            } as CSSProperties
            return (
              <li key={`phase-${point.phase}`} className="timeline-phase-item" style={style}>
                {point.phase}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

function CardsPage({ reducedMotion }: { reducedMotion: boolean }) {
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({})
  const cardMotionTokens = [
    {
      entryX: 'clamp(-520px, -40vw, -220px)',
      centerX: 'clamp(280px, 20vw, 360px)',
      centerY: 'clamp(90px, 10vh, 150px)',
      centerR: '-12deg',
      dealDelay: '1050ms',
    },
    {
      entryX: 'clamp(-300px, -22vw, -140px)',
      centerX: 'clamp(90px, 8vw, 150px)',
      centerY: 'clamp(72px, 8vh, 124px)',
      centerR: '-6deg',
      dealDelay: '1550ms',
    },
    {
      entryX: 'clamp(300px, 22vw, 140px)',
      centerX: 'clamp(-90px, -8vw, -150px)',
      centerY: 'clamp(72px, 8vh, 124px)',
      centerR: '6deg',
      dealDelay: '2050ms',
    },
    {
      entryX: 'clamp(520px, 40vw, 220px)',
      centerX: 'clamp(-280px, -20vw, -360px)',
      centerY: 'clamp(90px, 10vh, 150px)',
      centerR: '12deg',
      dealDelay: '2550ms',
    },
  ] as const

  return (
    <section className={`story-page page-cards ${reducedMotion ? 'is-reduced' : ''}`} aria-label="第3页 商用领域卡片">
      <h2>AI达到初步商用阶段的领域</h2>
      <ul className="card-grid">
        {cardItems.map((item, index) => {
          const isFlipped = Boolean(flippedCards[item.id])
          const motion = cardMotionTokens[index] ?? cardMotionTokens[0]
          return (
            <li
              key={item.id}
              className="deal-slot"
              style={
                {
                  '--entry-x': motion.entryX,
                  '--center-x': motion.centerX,
                  '--center-y': motion.centerY,
                  '--center-r': motion.centerR,
                  '--deal-delay': motion.dealDelay,
                } as CSSProperties
              }
            >
              <button
                type="button"
                className={`flip-card ${isFlipped ? 'is-flipped' : ''}`}
                onClick={() => setFlippedCards((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                aria-pressed={isFlipped}
              >
                <span className="card-face card-back">
                  <strong>{item.title}</strong>
                </span>
                <span className="card-face card-front">
                  <strong>{item.title}</strong>
                  <p>{item.model}</p>
                  <p>{item.date}</p>
                  <p>{item.detail}</p>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function GalleryPage({
  laneIndex,
  reducedMotion,
  onLaneNext,
}: {
  laneIndex: number
  reducedMotion: boolean
  onLaneNext: () => void
}) {
  const activeIndex = Math.min(laneIndex, Math.max(galleryItems.length - 1, 0))
  const canAdvance = activeIndex < galleryItems.length - 1

  const previousIndexRef = useRef(activeIndex)
  const [leavingIndex, setLeavingIndex] = useState<number | null>(null)

  useEffect(() => {
    if (previousIndexRef.current === activeIndex) return

    setLeavingIndex(previousIndexRef.current)
    previousIndexRef.current = activeIndex

    const timer = window.setTimeout(() => {
      setLeavingIndex(null)
    }, reducedMotion ? 20 : 360)

    return () => window.clearTimeout(timer)
  }, [activeIndex, reducedMotion])

  const activeItem = galleryItems[activeIndex]
  const visibleStack = [
    galleryItems[activeIndex],
    galleryItems[activeIndex + 1],
    galleryItems[activeIndex + 2],
    galleryItems[activeIndex + 3],
  ].filter(Boolean)

  return (
    <section className="story-page page-gallery" aria-label="第4页 图片堆叠页">
      <button
        type="button"
        className="gallery-stage"
        onClick={() => {
          if (canAdvance) onLaneNext()
        }}
        aria-label={canAdvance ? '切换下一张图片' : '已是最后一张图片'}
      >
        {leavingIndex !== null && leavingIndex !== activeIndex && galleryItems[leavingIndex] && (
          <figure className="gallery-layer leaving">
            <Image
              src={galleryItems[leavingIndex].src}
              alt={galleryItems[leavingIndex].title}
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 60vw"
            />
          </figure>
        )}

        {visibleStack.map((item, depth) => (
          <figure key={item.id} className={`gallery-layer depth-${depth}`}>
            <Image src={item.src} alt={item.title} fill priority={depth === 0} sizes="(max-width: 1024px) 90vw, 60vw" />
          </figure>
        ))}
      </button>

      <div className="gallery-caption" key={activeItem.id}>
        <h3>{activeItem.title}</h3>
        <p>{activeItem.description}</p>
        <small>{canAdvance ? '按 → 或点击图片切换下一张' : '已到最后一张，可按 ← 返回上一张'}</small>
      </div>
    </section>
  )
}

function VideoPage({
  laneIndex,
  isActive,
  onLaneNext,
}: {
  laneIndex: number
  isActive: boolean
  onLaneNext: () => void
}) {
  const activeIndex = Math.min(laneIndex, Math.max(videoItems.length - 1, 0))
  const activeVideo = videoItems[activeIndex]
  const canAdvance = activeIndex < videoItems.length - 1

  return (
    <section className="story-page page-video" aria-label="第5页 视频页">
      <div className="video-shell">
        <video
          key={activeVideo.id}
          className="video-player"
          src={activeVideo.src}
          autoPlay={isActive}
          muted
          controls
          loop
          playsInline
          preload="metadata"
        />
      </div>
      <p className="video-caption">
        {activeVideo.title} · {activeVideo.note}
      </p>
      <button type="button" className="video-next" onClick={onLaneNext} disabled={!canAdvance}>
        下一段
      </button>
    </section>
  )
}

function TablePage() {
  return (
    <section className="story-page page-table" aria-label="第6页 模型对比表">
      <h2>2026年2月主流AI编程模型。</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>模型</th>
              <th>特质</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row) => (
              <tr key={row.model}>
                <td>{row.model}</td>
                <td>{row.trait}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function ArtPage({
  laneIndex,
  isActive,
  reducedMotion,
}: {
  laneIndex: number
  isActive: boolean
  reducedMotion: boolean
}) {
  const activeIndex = Math.min(laneIndex, Math.max(artItems.length - 1, 0))
  const activeArt = artItems[activeIndex]
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50, active: false })

  const spotlightStyle = {
    '--mx': `${spotlight.x}%`,
    '--my': `${spotlight.y}%`,
    '--r': spotlight.active ? (reducedMotion ? '90px' : '130px') : '0px',
  } as CSSProperties

  return (
    <section className="story-page page-art" aria-label="第7页 艺术文本页">
      <p className="art-kicker">审美·好奇·迷失·浮躁</p>
      <div
        className="art-stage"
        style={spotlightStyle}
        onPointerMove={(event) => {
          if (!isActive) return
          const rect = event.currentTarget.getBoundingClientRect()
          const x = ((event.clientX - rect.left) / rect.width) * 100
          const y = ((event.clientY - rect.top) / rect.height) * 100
          setSpotlight({ x, y, active: true })
        }}
        onPointerEnter={() => setSpotlight((prev) => ({ ...prev, active: true }))}
        onPointerLeave={() => setSpotlight((prev) => ({ ...prev, active: false }))}
      >
        <p className="art-text translation">{activeArt.translation}</p>
        <p className="art-text original">{activeArt.original}</p>
      </div>
      <small className="art-source">{activeArt.source}</small>
    </section>
  )
}
