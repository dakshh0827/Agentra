import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

export default function NeonButton({
  children,
  variant = 'blue',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  className = '',
  icon: Icon,
  ...props
}) {
  const variants = {
    blue: 'bg-electric-blue/10 border-electric-blue/40 text-electric-blue hover:bg-electric-blue/20 hover:border-electric-blue hover:shadow-glow-blue',
    purple: 'bg-neon-purple/10 border-neon-purple/40 text-neon-purple hover:bg-neon-purple/20 hover:border-neon-purple hover:shadow-glow-purple',
    green: 'bg-cyber-green/10 border-cyber-green/40 text-cyber-green hover:bg-cyber-green/20 hover:border-cyber-green hover:shadow-glow-green',
    ghost: 'bg-transparent border-border text-text-secondary hover:border-border-glow hover:text-text-primary',
    solid: 'bg-gradient-to-r from-electric-blue to-neon-purple border-transparent text-white hover:opacity-90',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg',
  }

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center gap-2 rounded-md border font-body font-semibold tracking-wider',
        'transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : 16} />
      ) : null}
      {children}
    </motion.button>
  )
}