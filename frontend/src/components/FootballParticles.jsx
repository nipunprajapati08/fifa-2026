import { useEffect, useRef } from 'react'

const BALLS = 18

export default function FootballParticles() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let animFrame
    let balls = []

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    const randomBall = (canvas, forceBottom = false) => ({
      x: Math.random() * canvas.width,
      y: forceBottom ? canvas.height + Math.random() * 60 : Math.random() * canvas.height,
      size: 10 + Math.random() * 22,
      speedY: -(0.18 + Math.random() * 0.42),
      speedX: (Math.random() - 0.5) * 0.3,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.015,
      opacity: 0.04 + Math.random() * 0.10,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.008 + Math.random() * 0.012,
    })

    resize()
    window.addEventListener('resize', () => { resize(); balls = balls.map(b => ({ ...b })) })

    balls = Array.from({ length: BALLS }, () => randomBall(canvas))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      balls.forEach(b => {
        b.wobble += b.wobbleSpeed
        b.x += b.speedX + Math.sin(b.wobble) * 0.25
        b.y += b.speedY
        b.rotation += b.rotSpeed

        // reset when fully off-screen top
        if (b.y + b.size < 0) {
          Object.assign(b, randomBall(canvas, true))
        }

        ctx.save()
        ctx.globalAlpha = b.opacity
        ctx.translate(b.x, b.y)
        ctx.rotate(b.rotation)
        ctx.font = `${b.size}px serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('⚽', 0, 0)
        ctx.restore()
      })

      animFrame = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animFrame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}
