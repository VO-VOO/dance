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
  { key: 'singularity', title: '奇点临近', lanes: 2 },
  { key: 'art', title: '艺术文本', lanes: artItems.length },
  { key: 'thanks', title: '结束页', lanes: 1 },
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

type AudioElementRef = { current: HTMLAudioElement | null }
type NumberValueRef = { current: number | null }

const MUSIC_FADE_DURATION_MS = 10_000
const MUSIC_START_VOLUME_RATIO = 0.2
const MUSIC_TARGET_VOLUME = 1

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

const SCRAMBLE_POOL = 'אבגדהוזחטיכלמנסעפצקרשתךםןףץ'

function scrambleText(text: string) {
  return Array.from(text)
    .map((char) => {
      if (/[\s，。、“”‘’：；！？,.!?:;·—\-]/.test(char)) return char
      return SCRAMBLE_POOL[Math.floor(Math.random() * SCRAMBLE_POOL.length)] ?? char
    })
    .join('')
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
    tag === 'OPTION'
  )
}

type RenderPageProps = {
  laneIndex: number
  isActive: boolean
  reducedMotion: boolean
  onLaneNext: () => void
  onCardsBackdropChange: (src: string) => void
}

export default function PresentationApp() {
  const [state, dispatch] = useReducer(navReducer, undefined, createInitialState)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [cardsBackdrop, setCardsBackdrop] = useState('')
  const transitionTimerRef = useRef<number | null>(null)
  const shuanghuaAudioRef = useRef<HTMLAudioElement | null>(null)
  const ghostdiveAudioRef = useRef<HTMLAudioElement | null>(null)
  const shuanghuaFadeRafRef = useRef<number | null>(null)
  const ghostdiveFadeRafRef = useRef<number | null>(null)
  const previousShuanghuaActiveRef = useRef(false)
  const previousGhostdiveActiveRef = useRef(false)
  const pendingUnlockRef = useRef({ shuanghua: false, ghostdive: false })

  const activePage = pageDefinitions[state.pageIndex]
  const activeLane = state.laneIndexByPage[state.pageIndex] ?? 0
  const isShuanghuaActive = state.pageIndex >= 2 && state.pageIndex < 4
  const isGhostdiveActive = state.pageIndex >= 5

  const currentGalleryLane = state.laneIndexByPage[3] ?? 0
  const currentGalleryItem = galleryItems[Math.min(currentGalleryLane, Math.max(0, galleryItems.length - 1))]
  const pageBackdrop =
    activePage.key === 'gallery' ? currentGalleryItem?.src ?? '' : activePage.key === 'cards' ? cardsBackdrop : ''
  const pageBackdropOpacity = activePage.key === 'cards' && pageBackdrop ? '0.34' : '0.22'

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

  const clearFadeRaf = useCallback((rafRef: NumberValueRef) => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const fadeInAudio = useCallback(
    (audio: HTMLAudioElement, rafRef: NumberValueRef, durationMs: number) => {
      clearFadeRaf(rafRef)
      const startAt = window.performance.now()
      const fromVolume = MUSIC_TARGET_VOLUME * MUSIC_START_VOLUME_RATIO
      const toVolume = MUSIC_TARGET_VOLUME

      audio.volume = fromVolume
      const tick = (now: number) => {
        const rawProgress = Math.min((now - startAt) / durationMs, 1)
        const easedProgress = 1 - (1 - rawProgress) * (1 - rawProgress)
        audio.volume = fromVolume + (toVolume - fromVolume) * easedProgress
        if (rawProgress < 1) {
          rafRef.current = window.requestAnimationFrame(tick)
        } else {
          rafRef.current = null
          audio.volume = toVolume
        }
      }

      rafRef.current = window.requestAnimationFrame(tick)
    },
    [clearFadeRaf],
  )

  const stopTrack = useCallback(
    (audioRef: AudioElementRef, rafRef: NumberValueRef) => {
      const audio = audioRef.current
      if (!audio) return
      clearFadeRaf(rafRef)
      audio.pause()
      audio.currentTime = 0
      audio.volume = MUSIC_TARGET_VOLUME
    },
    [clearFadeRaf],
  )

  const startTrack = useCallback(
    async (track: 'shuanghua' | 'ghostdive', audioRef: AudioElementRef, rafRef: NumberValueRef) => {
      const audio = audioRef.current
      if (!audio) return

      clearFadeRaf(rafRef)
      audio.loop = true
      audio.muted = false
      audio.currentTime = 0
      audio.volume = MUSIC_TARGET_VOLUME * MUSIC_START_VOLUME_RATIO

      try {
        await audio.play()
        pendingUnlockRef.current[track] = false
        fadeInAudio(audio, rafRef, MUSIC_FADE_DURATION_MS)
      } catch {
        pendingUnlockRef.current[track] = true
      }
    },
    [clearFadeRaf, fadeInAudio],
  )

  const onCardsBackdropChange = useCallback(
    (src: string) => {
      setCardsBackdrop(src)
    },
    [],
  )

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
    const wasShuanghuaActive = previousShuanghuaActiveRef.current
    const wasGhostdiveActive = previousGhostdiveActiveRef.current

    if (isShuanghuaActive && !wasShuanghuaActive) {
      void startTrack('shuanghua', shuanghuaAudioRef, shuanghuaFadeRafRef)
    } else if (!isShuanghuaActive && wasShuanghuaActive) {
      stopTrack(shuanghuaAudioRef, shuanghuaFadeRafRef)
      pendingUnlockRef.current.shuanghua = false
    }

    if (isGhostdiveActive && !wasGhostdiveActive) {
      void startTrack('ghostdive', ghostdiveAudioRef, ghostdiveFadeRafRef)
    } else if (!isGhostdiveActive && wasGhostdiveActive) {
      stopTrack(ghostdiveAudioRef, ghostdiveFadeRafRef)
      pendingUnlockRef.current.ghostdive = false
    }

    previousShuanghuaActiveRef.current = isShuanghuaActive
    previousGhostdiveActiveRef.current = isGhostdiveActive
  }, [isGhostdiveActive, isShuanghuaActive, startTrack, stopTrack])

  useEffect(() => {
    function retryPendingPlayback() {
      if (pendingUnlockRef.current.shuanghua && isShuanghuaActive) {
        void startTrack('shuanghua', shuanghuaAudioRef, shuanghuaFadeRafRef)
      }
      if (pendingUnlockRef.current.ghostdive && isGhostdiveActive) {
        void startTrack('ghostdive', ghostdiveAudioRef, ghostdiveFadeRafRef)
      }
    }

    window.addEventListener('pointerdown', retryPendingPlayback, { passive: true })
    window.addEventListener('keydown', retryPendingPlayback)
    return () => {
      window.removeEventListener('pointerdown', retryPendingPlayback)
      window.removeEventListener('keydown', retryPendingPlayback)
    }
  }, [isGhostdiveActive, isShuanghuaActive, startTrack])

  useEffect(
    () => () => {
      stopTrack(shuanghuaAudioRef, shuanghuaFadeRafRef)
      stopTrack(ghostdiveAudioRef, ghostdiveFadeRafRef)
    },
    [stopTrack],
  )

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
    '--page-backdrop': pageBackdrop ? `url('${pageBackdrop}')` : 'none',
    '--page-backdrop-opacity': pageBackdropOpacity,
    '--page-backdrop-blur': `${pageBackdrop ? 64 : 12}px`,
    '--page-backdrop-blur-duration': '800ms',
  } as CSSProperties

  const visibleIndices = useMemo(
    () => [state.pageIndex - 1, state.pageIndex, state.pageIndex + 1].filter((index) => index >= 0 && index < pageDefinitions.length),
    [state.pageIndex],
  )

  return (
    <div
      className={`presentation-root${reducedMotion ? ' reduced-motion' : ''}${activePage.key === 'art' ? ' page-art-active' : ''}${activePage.key === 'cards' && cardsBackdrop ? ' page-cards-backdrop-active' : ''}`}
      style={shellStyle}
    >
      <a className="skip-link" href="#active-page">
        跳转到当前页面内容
      </a>
      <div className="global-backdrop" aria-hidden="true" />

      <main className="page-host" aria-label="I SEE YOU 八页叙事演示">
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
                  onCardsBackdropChange,
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

      <audio ref={shuanghuaAudioRef} src="/media/audio/shuanghua-monologue.mp3" preload="auto" aria-hidden="true" />
      <audio ref={ghostdiveAudioRef} src="/media/audio/ghostdive.mp3" preload="auto" aria-hidden="true" />
    </div>
  )
}

function renderStoryPage(pageKey: string, props: RenderPageProps) {
  switch (pageKey) {
    case 'title':
      return <TitlePage />
    case 'timeline':
      return <TimelinePage reducedMotion={props.reducedMotion} isActive={props.isActive} />
    case 'cards':
      return <CardsPage reducedMotion={props.reducedMotion} onBackdropChange={props.onCardsBackdropChange} />
    case 'gallery':
      return <GalleryPage laneIndex={props.laneIndex} onLaneNext={props.onLaneNext} />
    case 'video':
      return <VideoPage laneIndex={props.laneIndex} isActive={props.isActive} />
    case 'table':
      return <TablePage />
    case 'singularity':
      return <SingularityPage laneIndex={props.laneIndex} reducedMotion={props.reducedMotion} />
    case 'art':
      return <ArtPage laneIndex={props.laneIndex} isActive={props.isActive} reducedMotion={props.reducedMotion} />
    case 'thanks':
      return <ThanksPage />
    default:
      return null
  }
}

function TitlePage() {
  return (
    <section className="story-page page-title" aria-label="第1页 标题页">
      <div className="title-lockup">
        <h1>与AI共舞</h1>
        <p className="title-subtitle" aria-hidden="true">DANCE WITH AI</p>
      </div>
    </section>
  )
}

function ThanksPage() {
  return (
    <section className="story-page page-thanks" aria-label="第9页 感谢页">
      <div className="title-lockup">
        <h1>谢 谢</h1>
        <p className="title-subtitle" aria-hidden="true">THANK YOU</p>
      </div>
    </section>
  )
}

function TimelinePage({ reducedMotion, isActive }: { reducedMotion: boolean; isActive: boolean }) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [activeWeather, setActiveWeather] = useState<'sunny' | 'rainy' | 'snowy' | 'sakura' | null>(null)

  const callWeatherApi = useCallback((
    action: 'startAndSetWeather' | 'setWeather' | 'setPlaying',
    ...args: Array<string | boolean>
  ) => {
    const frame = iframeRef.current
    if (!frame) return
    const api = (frame.contentWindow as typeof window & { weatherHostApi?: Record<string, (...params: Array<string | boolean>) => unknown> })
      ?.weatherHostApi
    const fn = api?.[action]
    if (typeof fn === 'function') {
      fn(...args)
    } else {
      frame.contentWindow?.postMessage({ type: action, args }, '*')
    }
  }, [])

  useEffect(() => {
    callWeatherApi('setPlaying', isActive)
  }, [callWeatherApi, isActive])

  return (
    <section className={`story-page page-timeline ${reducedMotion ? 'is-reduced' : ''}`} aria-label="第2页 时间轴">
      <div
        className={`timeline-weather-backdrop ${isActive ? 'is-visible' : ''} ${activeWeather ? 'is-engaged' : ''}`}
        aria-hidden="true"
      >
        <iframe
          ref={iframeRef}
          src="/weather.html?embed=1"
          title="Weather Animation Backdrop"
          loading="eager"
          tabIndex={-1}
          onLoad={() => {
            callWeatherApi('setPlaying', isActive)
            if (activeWeather) {
              callWeatherApi('startAndSetWeather', activeWeather)
            }
          }}
        />
      </div>
      <h2 className="timeline-title">认识AI的心路历程</h2>
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
            const isActiveWeather = activeWeather === point.weather
            return (
              <li key={`phase-${point.phase}`} className="timeline-phase-item" style={style}>
                <div className="timeline-phase-mask">
                  <button
                    type="button"
                    className={`timeline-phase-button ${isActiveWeather ? 'is-active' : ''}`}
                    onClick={() => {
                      setActiveWeather(point.weather)
                      callWeatherApi('startAndSetWeather', point.weather)
                    }}
                  >
                    {point.phase}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

function useSpringTilt(ref: React.RefObject<HTMLElement | null>, options: { stiffness: number; damping: number; mass: number }) {
  const targetRef = useRef({ rx: 0, ry: 0, mx: 0.5, my: 0.5 })
  const currentRef = useRef({ rx: 0, ry: 0, mx: 0.5, my: 0.5 })
  const velocityRef = useRef({ rx: 0, ry: 0, mx: 0, my: 0 })
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    let lastTime = performance.now()

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.064)
      lastTime = time

      const target = targetRef.current
      const current = currentRef.current
      const vel = velocityRef.current

      const spring = (t: number, c: number, v: number) => {
        const force = -options.stiffness * (c - t) - options.damping * v
        const newV = v + (force / options.mass) * dt
        const newC = c + newV * dt
        if (Math.abs(newV) < 0.01 && Math.abs(t - newC) < 0.01) {
          return { c: t, v: 0, updated: t !== c }
        }
        return { c: newC, v: newV, updated: true }
      }

      const rx = spring(target.rx, current.rx, vel.rx)
      const ry = spring(target.ry, current.ry, vel.ry)
      const mx = spring(target.mx, current.mx, vel.mx)
      const my = spring(target.my, current.my, vel.my)

      current.rx = rx.c; vel.rx = rx.v
      current.ry = ry.c; vel.ry = ry.v
      current.mx = mx.c; vel.mx = mx.v
      current.my = my.c; vel.my = my.v

      const needsUpdate = rx.updated || ry.updated || mx.updated || my.updated

      if (needsUpdate && ref.current) {
        ref.current.style.transform = `perspective(1200px) rotateX(${current.rx}deg) rotateY(${current.ry}deg) translateZ(0)`
        ref.current.style.setProperty('--mouse-x', `${current.mx * 100}%`)
        ref.current.style.setProperty('--mouse-y', `${current.my * 100}%`)
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [options.stiffness, options.damping, options.mass, ref])

  return targetRef
}

function DealCardItem({
  item,
  isFlipped,
  motion,
  onFlip,
  onHoverEnter,
  onHoverLeave,
}: {
  item: typeof cardItems[0]
  isFlipped: boolean
  motion: { entryX: string; centerX: string; centerY: string; centerR: string; dealDelay: string }
  onFlip: () => void
  onHoverEnter: () => void
  onHoverLeave: () => void
}) {
  const tiltRef = useRef<HTMLDivElement>(null)
  const targetRef = useSpringTilt(tiltRef, { stiffness: 120, damping: 14, mass: 1 })

  return (
    <li
      className="deal-slot"
      style={{
        '--entry-x': motion.entryX,
        '--center-x': motion.centerX,
        '--center-y': motion.centerY,
        '--center-r': motion.centerR,
        '--deal-delay': motion.dealDelay,
      } as CSSProperties}
    >
      <div
        ref={tiltRef}
        className="card-tilt-shell"
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect()
          const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
          const y = ((event.clientY - rect.top) / rect.height) * 2 - 1
          targetRef.current.rx = -y * 12
          targetRef.current.ry = x * 12
          targetRef.current.mx = (event.clientX - rect.left) / rect.width
          targetRef.current.my = (event.clientY - rect.top) / rect.height
        }}
        onPointerLeave={() => {
          targetRef.current.rx = 0
          targetRef.current.ry = 0
          targetRef.current.mx = 0.5
          targetRef.current.my = 0.5
          onHoverLeave()
        }}
      >
        <button
          type="button"
          className={`flip-card ${isFlipped ? 'is-flipped' : ''}`}
          onClick={onFlip}
          onMouseEnter={onHoverEnter}
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
      </div>
    </li>
  )
}

function CardsPage({
  reducedMotion,
  onBackdropChange,
}: {
  reducedMotion: boolean
  onBackdropChange: (src: string) => void
}) {
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({})
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null)
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

  const activeBackdrop = useMemo(() => {
    if (!hoveredCardId) return ''
    return cardItems.find((item) => item.id === hoveredCardId)?.backdrop ?? ''
  }, [hoveredCardId])

  useEffect(() => {
    onBackdropChange(activeBackdrop)
  }, [activeBackdrop, onBackdropChange])

  useEffect(
    () => () => {
      onBackdropChange('')
    },
    [onBackdropChange],
  )

  return (
    <section className={`story-page page-cards ${reducedMotion ? 'is-reduced' : ''}`} aria-label="第3页 商用领域卡片">
      <h2>AI达到初步商用阶段的领域</h2>
      <ul className="card-grid">
        {cardItems.map((item, index) => {
          const isFlipped = Boolean(flippedCards[item.id])
          const motion = cardMotionTokens[index] ?? cardMotionTokens[0]
          return (
            <DealCardItem
              key={item.id}
              item={item}
              isFlipped={isFlipped}
              motion={motion}
              onFlip={() => setFlippedCards((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
              onHoverEnter={() => setHoveredCardId(item.id)}
              onHoverLeave={() => {
                if (hoveredCardId === item.id) setHoveredCardId(null)
              }}
            />
          )
        })}
      </ul>
    </section>
  )
}

function GalleryPage({
  laneIndex,
  onLaneNext,
}: {
  laneIndex: number
  onLaneNext: () => void
}) {
  const activeIndex = Math.min(laneIndex, Math.max(galleryItems.length - 1, 0))
  const canAdvance = activeIndex < galleryItems.length - 1

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
        style={
          {
            '--gallery-ratio': activeItem.ratio,
          } as CSSProperties
        }
        onClick={() => {
          if (canAdvance) onLaneNext()
        }}
        aria-label={canAdvance ? '切换下一张图片' : '已是最后一张图片'}
      >
        {visibleStack.map((item, depth) => (
          <figure key={item.id} className={`gallery-layer depth-${depth}`}>
            <Image src={item.src} alt={item.title} fill priority={depth === 0} sizes="(max-width: 1024px) 90vw, 60vw" />
          </figure>
        ))}
      </button>

      <div className="gallery-caption" key={activeItem.id}>
        <h3>{activeItem.title}</h3>
        <p>{activeItem.description}</p>
      </div>
    </section>
  )
}

function VideoPage({
  laneIndex,
  isActive,
}: {
  laneIndex: number
  isActive: boolean
}) {
  const activeIndex = Math.min(laneIndex, Math.max(videoItems.length - 1, 0))
  const activeVideo = videoItems[activeIndex]
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (isActive) return
    videoRef.current?.pause()
  }, [isActive, activeVideo.id])

  useEffect(() => {
    if (!isActive) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.code !== 'Space' || isEditableTarget(event.target)) return
      event.preventDefault()

      const video = videoRef.current
      if (!video) return

      if (video.paused) {
        void video.play().catch(() => { })
      } else {
        video.pause()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isActive, activeVideo.id])

  return (
    <section className="story-page page-video" aria-label="第5页 视频页">
      <div className="video-shell">
        <video
          ref={videoRef}
          key={activeVideo.id}
          className="video-player"
          src={activeVideo.src}
          controls
          playsInline
          preload="metadata"
          onPlay={() => {
            if (!videoRef.current) return
            if (videoRef.current.muted) videoRef.current.muted = false
            if (videoRef.current.volume === 0) videoRef.current.volume = 1
          }}
        />
      </div>
      <p className="video-caption">
        {activeVideo.note ? `${activeVideo.title} · ${activeVideo.note}` : activeVideo.title}
      </p>
    </section>
  )
}

function TablePage() {
  const [revealedTraits, setRevealedTraits] = useState<Record<string, boolean>>({})
  const [scrambleTick, setScrambleTick] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setScrambleTick((value) => value + 1)
    }, 90)
    return () => window.clearInterval(timer)
  }, [])

  const scrambledTraitsByModel = useMemo(() => {
    void scrambleTick
    return tableRows.reduce<Record<string, string>>((acc, row) => {
      acc[row.model] = revealedTraits[row.model] ? row.trait : scrambleText(row.trait)
      return acc
    }, {})
  }, [revealedTraits, scrambleTick])

  return (
    <section className="story-page page-table" aria-label="第6页 模型对比表">
      <h2>AI的性格</h2>
      <div
        className="table-tilt-shell"
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect()
          const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
          const y = ((event.clientY - rect.top) / rect.height) * 2 - 1
          const rx = -y * 12
          const ry = x * 12
          event.currentTarget.style.transform = `perspective(1300px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`
        }}
        onPointerLeave={(event) => {
          event.currentTarget.style.transform = 'perspective(1300px) rotateX(0deg) rotateY(0deg) translateZ(0)'
        }}
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>模型</th>
                <th>特质</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, index) => (
                <tr key={row.model} style={{ '--row-index': index } as React.CSSProperties}>
                  <td>{row.model}</td>
                  <td className="trait-cell">
                    {revealedTraits[row.model] ? (
                      row.trait
                    ) : (
                      <button
                        type="button"
                        className="trait-scramble-btn"
                        onClick={() => {
                          setRevealedTraits((prev) => ({ ...prev, [row.model]: true }))
                        }}
                        aria-label={`点击显示 ${row.model} 的原始特质文本`}
                      >
                        {scrambledTraitsByModel[row.model] || '••••••'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function SingularityPage({
  laneIndex,
  reducedMotion,
}: {
  laneIndex: number
  reducedMotion: boolean
}) {
  const years = Array.from({ length: 10 }, (_, index) => 2026 + index)
  const xStart = 130
  const xEnd = 900
  const xStep = (xEnd - xStart) / (years.length - 1)
  const isExponential = laneIndex > 0

  const linearPath = 'M130 392 L900 148'
  const exponentialPath = 'M130 396 C286 390 430 376 560 344 C640 322 710 276 772 198 C830 122 874 58 900 24'

  return (
    <section className={`story-page page-singularity ${reducedMotion ? 'is-reduced' : ''}`} aria-label="第7页 奇点临近">
      <h2>奇点临近</h2>
      <div className={`singularity-chart-shell ${isExponential ? 'is-exponential' : 'is-linear'}`} key={isExponential ? 'exp' : 'line'}>
        <svg className="singularity-chart" viewBox="0 0 1020 520" role="img" aria-label={isExponential ? '指数增长曲线' : '线性增长曲线'}>
          <defs>
            <linearGradient id="singularity-area-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(203, 166, 247, 0.42)" />
              <stop offset="100%" stopColor="rgba(203, 166, 247, 0.02)" />
            </linearGradient>
          </defs>

          <line className="singularity-axis" x1="130" y1="34" x2="130" y2="430" />
          <line className="singularity-axis" x1="130" y1="430" x2="920" y2="430" />

          <g aria-hidden="true">
            {years.map((year, index) => {
              const x = xStart + xStep * index
              return (
                <g key={year} transform={`translate(${x} 0)`}>
                  <line className="singularity-x-tick" x1="0" y1="430" x2="0" y2="440" />
                  <text className="singularity-x-label" x="0" y="468" textAnchor="middle">
                    {year}
                  </text>
                </g>
              )
            })}
          </g>

          {isExponential ? <line className="singularity-breakpoint" x1="558" y1="64" x2="558" y2="430" /> : null}
          <path className="singularity-curve glow-base" d={isExponential ? exponentialPath : linearPath} />
          <path className="singularity-curve glow-overlay" d={isExponential ? exponentialPath : linearPath} />
          <path className="singularity-area" d={`${isExponential ? exponentialPath : linearPath} L900 430 L130 430 Z`} />
        </svg>
      </div>
    </section>
  )
}

const ART_CANVAS_FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'PingFang SC', 'Hiragino Sans GB', 'Helvetica Neue', Helvetica, Arial, sans-serif"

function wrapCanvasText(text: string, maxWidth: number, ctx: CanvasRenderingContext2D) {
  const lines: string[] = []
  const paragraphs = text.split('\n')

  for (const paragraph of paragraphs) {
    if (!paragraph) {
      lines.push('')
      continue
    }

    const hasSpaces = paragraph.includes(' ')
    const tokens = hasSpaces ? paragraph.split(' ') : Array.from(paragraph)
    let current = ''

    for (const token of tokens) {
      const candidate = hasSpaces ? `${current}${current ? ' ' : ''}${token}` : `${current}${token}`
      if (ctx.measureText(candidate).width <= maxWidth || !current) {
        current = candidate
      } else {
        lines.push(current)
        current = token
      }
    }

    if (current) lines.push(current)
  }

  return lines
}

function drawCanvasTextLayer(
  canvas: HTMLCanvasElement,
  text: string,
  color: string,
  spotlight: { x: number; y: number; active: boolean },
  spotlightRadius: number,
  eraseInSpotlight: boolean,
) {
  const width = canvas.clientWidth
  const height = canvas.clientHeight
  if (!width || !height) return

  const dpr = window.devicePixelRatio || 1
  canvas.width = Math.floor(width * dpr)
  canvas.height = Math.floor(height * dpr)

  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, width, height)

  const fontSize = Math.min(Math.max(width * 0.066, 42), 88)
  const lineHeight = fontSize * 1.23
  ctx.font = `700 ${fontSize}px ${ART_CANVAS_FONT_STACK}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = color

  const lines = wrapCanvasText(text, width * 0.84, ctx)
  const totalHeight = (lines.length - 1) * lineHeight
  const startY = height / 2 - totalHeight / 2
  for (let i = 0; i < lines.length; i += 1) {
    ctx.fillText(lines[i] ?? '', width / 2, startY + i * lineHeight)
  }

  if (eraseInSpotlight && spotlight.active) {
    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc((spotlight.x / 100) * width, (spotlight.y / 100) * height, spotlightRadius, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
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
  const [revealedById, setRevealedById] = useState<Record<string, boolean>>({})
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50, active: false })
  const topCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const bottomCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const isRevealed = Boolean(revealedById[activeArt.id])
  const displaySource = isRevealed ? activeArt.clickedSource : activeArt.source
  const clickedColor = activeArt.clickedColor ?? 'rgb(203, 166, 247)'

  const spotlightStyle = {
    '--mx': `${spotlight.x}%`,
    '--my': `${spotlight.y}%`,
    '--r': spotlight.active ? (reducedMotion ? '90px' : '130px') : '0px',
  } as CSSProperties

  const renderArtCanvases = useCallback(() => {
    if (isRevealed) return
    const topCanvas = topCanvasRef.current
    const bottomCanvas = bottomCanvasRef.current
    const stage = stageRef.current
    if (!topCanvas || !bottomCanvas || !stage) return

    const spotlightRadius = reducedMotion ? 90 : 130
    drawCanvasTextLayer(bottomCanvas, activeArt.translation, 'rgba(255, 86, 86, 0.9)', spotlight, spotlightRadius, false)
    drawCanvasTextLayer(topCanvas, activeArt.original, 'rgba(248, 248, 245, 0.95)', spotlight, spotlightRadius, true)
  }, [activeArt.original, activeArt.translation, isRevealed, reducedMotion, spotlight])

  useEffect(() => {
    renderArtCanvases()
  }, [renderArtCanvases])

  useEffect(() => {
    if (isRevealed) return
    const stage = stageRef.current
    if (!stage) return
    const onResize = () => renderArtCanvases()
    const observer = new ResizeObserver(onResize)
    observer.observe(stage)
    window.addEventListener('resize', onResize)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [isRevealed, renderArtCanvases])

  return (
    <section className="story-page page-art" aria-label="第8页 艺术文本页">
      <p className="art-kicker">审美·好奇·迷失·浮躁</p>
      <div
        ref={stageRef}
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
        <button
          type="button"
          className="art-toggle-layer"
          onClick={() => {
            setRevealedById((prev) => ({ ...prev, [activeArt.id]: true }))
          }}
        >
          {isRevealed ? (
            <span className="art-text clicked" style={{ color: clickedColor }}>
              {activeArt.clickedOriginal}
            </span>
          ) : (
            <span className="art-canvas-stack" aria-hidden="true">
              <canvas ref={bottomCanvasRef} className="art-canvas art-canvas-bottom" />
              <canvas ref={topCanvasRef} className="art-canvas art-canvas-top" />
            </span>
          )}
        </button>
      </div>
      <small className="art-source">{displaySource}</small>
    </section>
  )
}
