import type { MouseEvent } from 'react'

import { VideoFrame } from '../../ui/video/VideoFrame'
import type { PageRenderProps } from '../registry'

import { videoSources } from './videoData'

export function Page6({ laneIndex, onLaneNext, isActivePage }: PageRenderProps) {
  if (videoSources.length === 0) {
    return (
      <section className="page page-6" aria-label="第6页 视频展示">
        <p>未检测到可用视频，请检查 video/ 目录中的 mp4 文件。</p>
      </section>
    )
  }

  const activeIndex = Math.min(laneIndex, videoSources.length - 1)
  const active = videoSources[activeIndex]

  const handleContextMenu = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault()
    onLaneNext?.()
  }

  return (
    <section className="page page-6" aria-label="第6页 视频展示" onContextMenu={handleContextMenu}>
      <VideoFrame src={active} poster="/images/video-poster.jpg" isActive={isActivePage} />
      {videoSources.length > 1 ? <p className="video-hint">右键切换下一个视频</p> : null}
    </section>
  )
}
