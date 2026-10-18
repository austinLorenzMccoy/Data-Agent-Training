'use client'

import { useEffect, useRef } from 'react'

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  r: number
}

// Drifting node graph drawn on a canvas. Static frame under reduced motion.
export function Constellation({
  className = '',
  density = 0.00009,
  linkDistance = 150,
  nodeColor = 'rgba(240, 214, 150, 0.75)',
  lineRgb = '224, 184, 79',
}: {
  className?: string
  density?: number
  linkDistance?: number
  nodeColor?: string
  lineRgb?: string
}) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let nodes: Node[] = []
    let w = 0
    let h = 0
    let raf = 0
    let visible = true

    function seed() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas!.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas!.width = w * dpr
      canvas!.height = h * dpr
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.max(14, Math.min(90, Math.round(w * h * density)))
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.4 + 0.6,
      }))
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const d = Math.hypot(dx, dy)
          if (d < linkDistance) {
            ctx!.strokeStyle = `rgba(${lineRgb}, ${(1 - d / linkDistance) * 0.32})`
            ctx!.lineWidth = 0.7
            ctx!.beginPath()
            ctx!.moveTo(nodes[i].x, nodes[i].y)
            ctx!.lineTo(nodes[j].x, nodes[j].y)
            ctx!.stroke()
          }
        }
      }
      ctx!.fillStyle = nodeColor
      for (const n of nodes) {
        ctx!.beginPath()
        ctx!.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx!.fill()
      }
    }

    function step() {
      for (const n of nodes) {
        n.x += n.vx
        n.y += n.vy
        if (n.x < 0 || n.x > w) n.vx *= -1
        if (n.y < 0 || n.y > h) n.vy *= -1
      }
      draw()
      if (visible) raf = requestAnimationFrame(step)
    }

    seed()
    if (reduced) draw()
    else raf = requestAnimationFrame(step)

    const ro = new ResizeObserver(() => {
      seed()
      if (reduced) draw()
    })
    ro.observe(canvas)

    const io = new IntersectionObserver(([entry]) => {
      const was = visible
      visible = entry.isIntersecting
      if (visible && !was && !reduced) raf = requestAnimationFrame(step)
    })
    io.observe(canvas)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
    }
  }, [density, linkDistance, nodeColor, lineRgb])

  return <canvas ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />
}
