export const motionTokens = {
  duration: {
    fast: 180,
    base: 360,
    slow: 640,
    cinematic: 1100,
  },
  easing: {
    out: 'cubic-bezier(0.16, 1, 0.3, 1)',
    smooth: 'cubic-bezier(0.33, 1, 0.68, 1)',
    linear: 'linear',
  },
  stagger: {
    short: 60,
    medium: 100,
  },
} as const
