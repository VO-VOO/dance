import { useEffect, useRef } from 'react'

type VideoFrameProps = {
  src?: string
  poster?: string
  isActive: boolean
}

export function VideoFrame({ src, poster, isActive }: VideoFrameProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (!isActive || !src) {
      video.pause()
      video.removeAttribute('src')
      video.load()
      return
    }

    video.load()
    const playPromise = video.play()
    if (playPromise !== undefined) {
      void playPromise.catch(() => undefined)
    }
  }, [isActive, src])

  return (
    <section className="video-frame" aria-label="视频展示区域">
      <video
        ref={videoRef}
        className="video-element"
        src={isActive ? src : undefined}
        poster={poster}
        controls
        playsInline
        muted
        loop
        autoPlay={isActive}
        preload={isActive ? 'metadata' : 'none'}
      >
        <track kind="captions" src="/captions/placeholder.vtt" srcLang="zh" label="中文字幕" />
      </video>
    </section>
  )
}
