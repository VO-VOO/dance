type VideoFrameProps = {
  src: string
  poster?: string
}

export function VideoFrame({ src, poster }: VideoFrameProps) {
  return (
    <section className="video-frame" aria-label="视频展示区域">
      <video className="video-element" src={src} poster={poster} controls preload="metadata">
        <track kind="captions" src="/captions/placeholder.vtt" srcLang="zh" label="中文字幕" />
      </video>
    </section>
  )
}
