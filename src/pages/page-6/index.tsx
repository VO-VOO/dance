import { VideoFrame } from '../../ui/video/VideoFrame'
import type { PageRenderProps } from '../registry'

const VIDEO_SOURCES = ['/videos/demo-1.mp4', '/videos/demo-2.mp4', '/videos/demo-3.mp4']

export function Page6({ laneIndex }: PageRenderProps) {
  const active = VIDEO_SOURCES[Math.min(laneIndex, VIDEO_SOURCES.length - 1)]

  return (
    <section className="page page-6" aria-label="第6页 视频展示">
      <VideoFrame src={active} poster="/images/video-poster.jpg" />
    </section>
  )
}
