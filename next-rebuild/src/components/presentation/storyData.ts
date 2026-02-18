export type TimelinePoint = {
  time: string
  phase: string
  x: string
  node: 'none' | 'solid' | 'ring'
}

export type CardContent = {
  id: string
  title: string
  model: string
  date: string
  detail: string
  backdrop: string
}

export type GalleryItem = {
  id: string
  title: string
  description: string
  src: string
  ratio: number
}

export type VideoItem = {
  id: string
  title: string
  note: string
  src: string
}

export type ArtItem = {
  id: string
  original: string
  translation: string
  source: string
}

export const timelinePoints: TimelinePoint[] = [
  { time: '2025年2月', phase: '赞扬AI', x: '18%', node: 'ring' },
  { time: '2025年6月', phase: '惧怕AI', x: '40%', node: 'ring' },
  { time: '2025年10月', phase: '怀疑AI', x: '70%', node: 'ring' },
  { time: '2026年2月', phase: '接纳AI', x: '90%', node: 'ring' },
]

export const cardItems: CardContent[] = [
  {
    id: 'card-programming',
    title: 'AI编程',
    model: 'Claude opus 4.5',
    date: '2025年11月24日',
    detail: 'SWE首次突破80分，agent调用以及意图理解取得突破。',
    backdrop: '/media/cards/programming.png',
  },
  {
    id: 'card-music',
    title: 'AI音乐',
    model: 'Suno v5',
    date: '2025年9月23日',
    detail: '支持乐器音色克隆，人声分离，AI音乐首次登上热搜。',
    backdrop: '/media/cards/music.png',
  },
  {
    id: 'card-image',
    title: 'AI绘图',
    model: 'Nano banana pro',
    date: '2025年11月20日',
    detail:
      '具备真实世界理解能力的全能绘图模型，面向广告设计。支持4K以多种比例。',
    backdrop: '/media/cards/painting.png',
  },
  {
    id: 'card-video',
    title: 'AI视频',
    model: 'Seedance 2',
    date: '2026年2月12日',
    detail: '视频，音频，图像三位一体理解能力。首个具备智能分镜的视频模型。',
    backdrop: '/media/cards/video.png',
  },
]

export const galleryItems: GalleryItem[] = [
  {
    id: 'gallery-1',
    title: '浮世绘',
    description: '荒海巨蛸袭船图',
    src: '/media/images/1-荒海巨蛸袭船图.png',
    ratio: 2752 / 1536,
  },
  {
    id: 'gallery-2',
    title: '专辑封面',
    description: '喀秋莎',
    src: '/media/images/2-喀秋莎.png',
    ratio: 1,
  },
  {
    id: 'gallery-3',
    title: '超现实主义',
    description: '逃脱',
    src: '/media/images/3-逃脱.png',
    ratio: 2752 / 1536,
  },
  {
    id: 'gallery-4',
    title: '地图',
    description: '巴巴罗萨',
    src: '/media/images/4-巴巴罗萨.png',
    ratio: 2752 / 1536,
  },
  {
    id: 'gallery-5',
    title: '写实主义',
    description: '民国',
    src: '/media/images/5-民国女人.png',
    ratio: 2752 / 1536,
  },
  {
    id: 'gallery-6',
    title: '卡牌',
    description: '水之呼吸',
    src: '/media/images/6-水之呼吸.png',
    ratio: 1536 / 2752,
  },
]

export const videoItems: VideoItem[] = [
  {
    id: 'video-1',
    title: '片段一',
    note: '视觉叙事与动作预演',
    src: '/media/videos/1.mp4#t=0.1',
  },
  {
    id: 'video-2',
    title: '片段二',
    note: '节奏剪辑与音画同步',
    src: '/media/videos/1.mp4#t=10',
  },
  {
    id: 'video-3',
    title: '片段三',
    note: '镜头张力与色彩对比',
    src: '/media/videos/1.mp4#t=20',
  },
]

export const artItems: ArtItem[] = [
  {
    id: 'art-1',
    original:
      'Νῦν γὰρ βλέπομεν δι’ ἐσόπτρου ἐν αἰνίγματι, τότε δὲ πρόσωπον πρὸς πρόσωπον· νῦν γινώσκω ἐκ μέρους, τότε δὲ ἐπιγνώσομαι καθὼς καὶ ἐπεγνώσθην.',
    translation:
      '我们如今仿佛对着镜子观看，模糊不清，到那时就要面对面了。我如今所知道的有限，到那时就全知道，如同主知道我一样。',
    source: '《圣经·新约·哥林多前书》',
  },
  {
    id: 'art-2',
    original: "If you can't tell, does it matter?",
    translation: '如果不能分辨，那有区别吗？',
    source: '《西部世界》第一季',
  },
]

export const tableRows = [
  {
    model: 'GPT-5.3-Codex High',
    trait: '保守、周密思维、安全、服从、高智商',
  },
  {
    model: 'Claude Opus 4.6 Adaptive',
    trait: '中立、自主创造力、自适应推理',
  },
  {
    model: 'Kimi K2.5 Thinking',
    trait: '激进、过度自信、逻辑链不稳定',
  },
  {
    model: 'Gemini 3 Pro Preview',
    trait: '艺术化、发散性思维、低遵从性、高情商',
  },
]
