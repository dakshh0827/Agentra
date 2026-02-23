import React, { useEffect, useRef } from 'react'

export default function StarField() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let animId
    let stars = []
    const STAR_COUNT = 250

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initStars()
    }

    const initStars = () => {
      stars = Array.from({ length: STAR_COUNT }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.3 + 0.15,
        baseAlpha: Math.random() * 0.75 + 0.1,
        alpha: 0,
        twinkleSpeed: Math.random() * 0.007 + 0.002,
        twinkleOffset: Math.random() * Math.PI * 2,
        color: Math.random() > 0.92
          ? `rgba(168,85,247,`   // rare purple stars
          : Math.random() > 0.78
          ? `rgba(147,197,253,`  // occasional blue stars
          : `rgba(248,248,255,`, // mostly white stars
      }))
    }

    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      t += 0.016

      stars.forEach(s => {
        s.alpha = s.baseAlpha * (0.4 + 0.6 * Math.sin(t * s.twinkleSpeed * 60 + s.twinkleOffset))
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `${s.color}${s.alpha})`
        ctx.fill()
      })

      animId = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}