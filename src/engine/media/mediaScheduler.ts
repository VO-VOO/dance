import type { AssetManifest } from './assetManifest'

export class MediaScheduler {
  private readonly manifests: AssetManifest[]

  constructor(manifests: AssetManifest[]) {
    this.manifests = manifests
  }

  getPreloadPlan(pageId: number, laneIndex: number) {
    const manifest = this.manifests.find((item) => item.pageId === pageId)
    if (!manifest) return [] as string[]

    const current = manifest.lanes[laneIndex]
    const next = manifest.lanes[laneIndex + 1]
    const plan = [
      ...(current?.images ?? []),
      ...(current?.videos ?? []),
      ...(next?.images ?? []),
      ...(next?.videos ?? []),
    ]

    return Array.from(new Set(plan))
  }
}
