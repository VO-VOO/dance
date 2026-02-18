export type LaneAssets = {
  images: string[]
  videos: string[]
}

export type AssetManifest = {
  pageId: number
  lanes: Record<number, LaneAssets>
}
