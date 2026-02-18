export type TimelineController = {
  play: () => void
  seek: (progress: number) => void
  reverse: () => void
  kill: () => void
}

export function createNoopTimeline(): TimelineController {
  return {
    play: () => undefined,
    seek: () => undefined,
    reverse: () => undefined,
    kill: () => undefined,
  }
}
