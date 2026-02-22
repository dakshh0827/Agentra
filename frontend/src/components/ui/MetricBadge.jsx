import React from 'react'
import clsx from 'clsx'

const colorMap = {
  blue: 'text-electric-blue bg-electric-blue/10 border-electric-blue/20',
  green: 'text-cyber-green bg-cyber-green/10 border-cyber-green/20',
  purple: 'text-neon-purple bg-neon-purple/10 border-neon-purple/20',
  yellow: 'text-cyber-yellow bg-cyber-yellow/10 border-cyber-yellow/20',
  red: 'text-cyber-red bg-cyber-red/10 border-cyber-red/20',
}

export default function MetricBadge({ label, value, color = 'blue', icon: Icon, sublabel }) {
  return (
    <div className={clsx(
      'glass-panel rounded-lg p-4 border',
      colorMap[color]
    )}>
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon size={14} />}
        <span className="text-xs font-mono uppercase tracking-widest opacity-70">{label}</span>
      </div>
      <div className="text-2xl font-display font-bold tracking-wide">{value}</div>
      {sublabel && <div className="text-xs opacity-60 mt-0.5">{sublabel}</div>}
    </div>
  )
}