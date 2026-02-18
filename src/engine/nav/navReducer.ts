import type { NavAction, NavState } from './navTypes'

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function navReducer(state: NavState, action: NavAction): NavState {
  if (state.isTransitioning && action.type !== 'TRANSITION_END') {
    return state
  }

  switch (action.type) {
    case 'PAGE_PREV': {
      return {
        ...state,
        pageIndex: clamp(state.pageIndex - 1, 0, action.pageCount - 1),
      }
    }
    case 'PAGE_NEXT': {
      return {
        ...state,
        pageIndex: clamp(state.pageIndex + 1, 0, action.pageCount - 1),
      }
    }
    case 'SET_PAGE': {
      return {
        ...state,
        pageIndex: clamp(action.index, 0, action.pageCount - 1),
      }
    }
    case 'LANE_PREV': {
      const current = state.laneIndexByPage[action.pageId] ?? 0
      return {
        ...state,
        laneIndexByPage: {
          ...state.laneIndexByPage,
          [action.pageId]: Math.max(0, current - 1),
        },
      }
    }
    case 'LANE_NEXT': {
      const current = state.laneIndexByPage[action.pageId] ?? 0
      return {
        ...state,
        laneIndexByPage: {
          ...state.laneIndexByPage,
          [action.pageId]: clamp(current + 1, 0, Math.max(0, action.laneCount - 1)),
        },
      }
    }
    case 'SET_LANE': {
      return {
        ...state,
        laneIndexByPage: {
          ...state.laneIndexByPage,
          [action.pageId]: clamp(action.laneIndex, 0, Math.max(0, action.laneCount - 1)),
        },
      }
    }
    case 'TRANSITION_START': {
      return {
        ...state,
        isTransitioning: true,
      }
    }
    case 'TRANSITION_END': {
      return {
        ...state,
        isTransitioning: false,
      }
    }
    default:
      return state
  }
}
