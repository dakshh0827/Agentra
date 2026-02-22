import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

export default function GlassCard({
  children,
  className = '',
  glow = false,
  glowColor = 'blue',
  hover = true,
  noBorder = false,
  onClick,
  ...props
}) {
  const glowClasses = {
    blue: 'hover:shadow-glow-blue hover:border-electric-blue/30',
    purple: 'hover:shadow-glow-purple hover:border-neon-purple/30',
    green: 'hover:shadow-glow-green hover:border-cyber-green/30',
  }

  return (
    <motion.div
      whileHover={hover ? { y: -2, scale: 1.005 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={clsx(
        'glass-panel rounded-lg transition-all duration-300',
        !noBorder && 'border border-border',
        hover && glowClasses[glowColor],
        onClick && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}