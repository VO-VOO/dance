import type { ComponentType } from 'react'

import type { TextSettings } from '../app/types'
import { Page1 } from './page-1'
import { Page2 } from './page-2'
import { Page3 } from './page-3'
import { Page4 } from './page-4'
import { Page5 } from './page-5'
import { galleryLaneCount } from './page-5/galleryData'
import { Page6 } from './page-6'
import { videoLaneCount } from './page-6/videoData'
import { Page7 } from './page-7'
import { Page8 } from './page-8'

export type PageRenderProps = {
  laneIndex: number
  settings: TextSettings
  reducedMotion: boolean
  isActivePage: boolean
  onLaneNext?: () => void
}

export type PageDefinition = {
  id: number
  title: string
  lanes: number
  Component: ComponentType<PageRenderProps>
}

const pages: PageDefinition[] = [
  { id: 1, title: 'Title', lanes: 1, Component: Page1 },
  { id: 2, title: 'Timeline', lanes: 1, Component: Page2 },
  { id: 3, title: 'Cards', lanes: 1, Component: Page3 },
  { id: 4, title: 'Reserved', lanes: 1, Component: Page4 },
  { id: 5, title: 'Gallery', lanes: galleryLaneCount, Component: Page5 },
  { id: 6, title: 'Video', lanes: videoLaneCount, Component: Page6 },
  { id: 7, title: 'Table', lanes: 1, Component: Page7 },
  { id: 8, title: 'Art', lanes: 3, Component: Page8 },
]

export default pages
