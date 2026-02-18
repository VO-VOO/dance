function toBaseName(value: string) {
  const normalized = value.replace(/\\/g, '/')
  const lastSlash = normalized.lastIndexOf('/')
  return lastSlash === -1 ? normalized : normalized.slice(lastSlash + 1)
}

const videoModules = import.meta.glob('../../../video/*.mp4', {
  eager: true,
  import: 'default',
}) as Record<string, string>

export const videoSources = Object.entries(videoModules)
  .sort(([leftPath], [rightPath]) =>
    toBaseName(leftPath).localeCompare(toBaseName(rightPath), undefined, {
      numeric: true,
      sensitivity: 'base',
    }),
  )
  .map(([, url]) => url)

export const videoLaneCount = Math.max(videoSources.length, 1)
