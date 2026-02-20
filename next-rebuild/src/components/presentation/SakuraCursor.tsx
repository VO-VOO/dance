'use client'

import { useEffect, useRef } from 'react'

/**
 * 樱花粒子数据结构
 * 每个粒子模拟一片飘落的花瓣
 */
interface Petal {
    x: number
    y: number
    vx: number
    vy: number
    size: number
    opacity: number
    rotation: number
    rotationSpeed: number
    life: number
    maxLife: number
}

// NOTE: 樱花花瓣的颜色取自 Catppuccin 的粉色系
const PETAL_COLORS = [
    'rgb(234, 118, 203)',  // pink
    'rgb(245, 194, 231)',  // flamingo
    'rgb(242, 205, 205)',  // rosewater
    'rgb(255, 183, 197)',  // light pink
    'rgb(220, 138, 120)',  // peach
]

/**
 * 绘制单片樱花花瓣
 * 使用贝塞尔曲线模拟花瓣的有机轮廓
 */
function drawPetal(ctx: CanvasRenderingContext2D, petal: Petal) {
    ctx.save()
    ctx.translate(petal.x, petal.y)
    ctx.rotate(petal.rotation)
    ctx.globalAlpha = petal.opacity

    const s = petal.size
    const color = PETAL_COLORS[Math.floor(petal.life * 100) % PETAL_COLORS.length]

    ctx.fillStyle = color
    ctx.beginPath()
    // NOTE: 使用双贝塞尔曲线生成水滴形花瓣
    ctx.moveTo(0, -s)
    ctx.bezierCurveTo(s * 0.8, -s * 0.6, s * 0.6, s * 0.3, 0, s * 0.8)
    ctx.bezierCurveTo(-s * 0.6, s * 0.3, -s * 0.8, -s * 0.6, 0, -s)
    ctx.fill()

    ctx.restore()
}

/**
 * 樱花光标与粒子拖尾组件
 * 在鼠标位置渲染 🌸 光标，移动时散落花瓣粒子
 */
export default function SakuraCursor() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const petalsRef = useRef<Petal[]>([])
    const mouseRef = useRef({ x: 0, y: 0 })
    const prevMouseRef = useRef({ x: 0, y: 0 })
    const rafRef = useRef<number>(0)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        resize()
        window.addEventListener('resize', resize)

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current.x = e.clientX
            mouseRef.current.y = e.clientY

            // NOTE: 根据鼠标移动速度决定粒子生成数量，慢移少、快移多
            const dx = e.clientX - prevMouseRef.current.x
            const dy = e.clientY - prevMouseRef.current.y
            const speed = Math.sqrt(dx * dx + dy * dy)

            const count = Math.min(Math.floor(speed / 8), 4)
            for (let i = 0; i < count; i++) {
                petalsRef.current.push({
                    x: e.clientX + (Math.random() - 0.5) * 12,
                    y: e.clientY + (Math.random() - 0.5) * 12,
                    vx: (Math.random() - 0.5) * 2 + dx * 0.05,
                    vy: Math.random() * 1.5 + 0.5,
                    size: Math.random() * 6 + 4,
                    opacity: Math.random() * 0.4 + 0.6,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.08,
                    life: 0,
                    maxLife: Math.random() * 60 + 40,
                })
            }

            prevMouseRef.current.x = e.clientX
            prevMouseRef.current.y = e.clientY
        }

        window.addEventListener('mousemove', handleMouseMove)

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            const petals = petalsRef.current

            for (let i = petals.length - 1; i >= 0; i--) {
                const p = petals[i]
                p.life += 1
                p.x += p.vx
                // NOTE: 花瓣受重力影响缓慢下落，带有轻微水平摇摆
                p.y += p.vy
                p.vx += Math.sin(p.life * 0.05) * 0.1
                p.rotation += p.rotationSpeed

                const progress = p.life / p.maxLife
                // NOTE: 后半段生命周期开始淡出
                p.opacity = progress > 0.5 ? (1 - progress) * 2 * 0.8 : 0.8
                p.size *= 0.998

                if (p.life >= p.maxLife) {
                    petals.splice(i, 1)
                    continue
                }

                drawPetal(ctx, p)
            }

            // NOTE: 在鼠标位置绘制 🌸 光标（emoji）
            ctx.save()
            ctx.font = '24px serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('🌸', mouseRef.current.x, mouseRef.current.y)
            ctx.restore()

            rafRef.current = requestAnimationFrame(animate)
        }

        rafRef.current = requestAnimationFrame(animate)

        return () => {
            window.removeEventListener('resize', resize)
            window.removeEventListener('mousemove', handleMouseMove)
            cancelAnimationFrame(rafRef.current)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                pointerEvents: 'none',
            }}
        />
    )
}
