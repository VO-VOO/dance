export type NavState = {
  pageIndex: number
  laneIndexByPage: Record<number, number>
  isTransitioning: boolean
}

export type NavAction =
  | { type: 'PAGE_PREV'; pageCount: number }
  | { type: 'PAGE_NEXT'; pageCount: number }
  | { type: 'LANE_PREV'; pageId: number }
  | { type: 'LANE_NEXT'; pageId: number; laneCount: number }
  | { type: 'SET_PAGE'; index: number; pageCount: number }
  | { type: 'SET_LANE'; pageId: number; laneIndex: number; laneCount: number }
  | { type: 'TRANSITION_START' }
  | { type: 'TRANSITION_END' }

export function createInitialNavState(pageIds: number[]): NavState {
  const laneIndexByPage: Record<number, number> = {}
  for (const id of pageIds) laneIndexByPage[id] = 0

  return {
    pageIndex: 0,
    laneIndexByPage,
    isTransitioning: false,
  }
}
