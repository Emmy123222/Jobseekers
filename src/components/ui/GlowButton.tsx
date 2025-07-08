import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface GlowButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
}

const variants = {
  primary: 'bg-cyan-500 hover:bg-cyan-400 text-black border-cyan-300 shadow-cyan-500/50',
  secondary: 'bg-purple-500 hover:bg-purple-400 text-white border-purple-300 shadow-purple-500/50',
  success: 'bg-green-500 hover:bg-green-400 text-black border-green-300 shadow-green-500/50',
  warning: 'bg-yellow-500 hover:bg-yellow-400 text-black border-yellow-300 shadow-yellow-500/50'
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg'
}

export const GlowButton: React.FC<GlowButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className
}) => {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative font-semibold rounded-lg border-2 transition-all duration-300 shadow-lg',
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'hover:shadow-xl',
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300" />
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}