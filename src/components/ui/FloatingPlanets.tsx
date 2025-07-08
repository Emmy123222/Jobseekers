import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface Planet {
  id: string
  x: number
  y: number
  size: number
  color: string
  speed: number
  direction: number
}

const PLANET_COLORS = ['#00bfff', '#6a0dad', '#00ffcc', '#ff6b6b', '#ffd93d']

export const FloatingPlanets: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const planetsRef = useRef<Planet[]>([])

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const { width, height } = container.getBoundingClientRect()

    // Initialize planets
    planetsRef.current = Array.from({ length: 15 }, (_, i) => ({
      id: `planet-${i}`,
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 80 + 20,
      color: PLANET_COLORS[Math.floor(Math.random() * PLANET_COLORS.length)],
      speed: Math.random() * 0.5 + 0.1,
      direction: Math.random() * Math.PI * 2
    }))

    let animationId: number
    const animate = () => {
      planetsRef.current.forEach(planet => {
        planet.x += Math.cos(planet.direction) * planet.speed
        planet.y += Math.sin(planet.direction) * planet.speed

        // Wrap around screen
        if (planet.x > width + planet.size) planet.x = -planet.size
        if (planet.x < -planet.size) planet.x = width + planet.size
        if (planet.y > height + planet.size) planet.y = -planet.size
        if (planet.y < -planet.size) planet.y = height + planet.size
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Animated Stars */}
      {Array.from({ length: 200 }).map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute w-1 h-1 bg-white rounded-full opacity-60"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Floating Planets */}
      {planetsRef.current.map((planet, index) => (
        <motion.div
          key={planet.id}
          className="absolute rounded-full opacity-20 blur-sm"
          style={{
            width: planet.size,
            height: planet.size,
            background: `radial-gradient(circle at 30% 30%, ${planet.color}80, ${planet.color}20)`,
            left: planet.x,
            top: planet.y,
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 20 + index * 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Nebula Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-blue-900/10" />
      <div className="absolute inset-0 bg-gradient-to-tl from-teal-900/5 via-transparent to-purple-900/5" />
    </div>
  )
}