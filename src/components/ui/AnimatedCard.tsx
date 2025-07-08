import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  hoverScale?: number
  delay?: number
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className,
  hoverScale = 1.02,
  delay = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: hoverScale }}
      className={cn(
        'bg-gray-900/50 border border-cyan-500/20 rounded-xl p-6 backdrop-blur-sm hover:border-cyan-500/40 transition-all duration-300',
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 rounded-xl" />
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}