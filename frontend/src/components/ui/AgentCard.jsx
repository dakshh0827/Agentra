import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Zap, Star, TrendingUp, Activity, Tag } from 'lucide-react'
import GlassCard from './GlassCard'
import clsx from 'clsx'

const categoryColors = {
  Analysis: 'text-electric-blue bg-electric-blue/10 border-electric-blue/20',
  Development: 'text-neon-purple bg-neon-purple/10 border-neon-purple/20',
  Security: 'text-cyber-red bg-cyber-red/10 border-cyber-red/20',
  Data: 'text-cyber-yellow bg-cyber-yellow/10 border-cyber-yellow/20',
  NLP: 'text-cyber-green bg-cyber-green/10 border-cyber-green/20',
  Web3: 'text-neon-purple bg-neon-purple/10 border-neon-purple/20',
}

const statusDot = {
  active: 'bg-cyber-green',
  busy: 'bg-cyber-yellow',
  offline: 'bg-cyber-red',
}

export default function AgentCard({ agent, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/agent/${agent._id}`}>
        <GlassCard className="p-5 group holo-border" glowColor="blue">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {/* Agent Icon */}
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-electric-blue/20 to-neon-purple/20 border border-electric-blue/30 flex items-center justify-center">
                <Zap size={18} className="text-electric-blue" />
              </div>
              <div>
                <h3 className="font-display font-bold text-text-primary text-base tracking-wide group-hover:text-glow-blue transition-all">
                  {agent.name}
                </h3>
                <span className={clsx(
                  'inline-flex items-center px-2 py-0.5 rounded text-xs font-mono border',
                  categoryColors[agent.category] || categoryColors.Data
                )}>
                  {agent.category}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={clsx('w-2 h-2 rounded-full pulse-dot', statusDot[agent.status] || statusDot.active)} />
              <span className="text-xs font-mono text-text-muted capitalize">{agent.status}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-text-secondary text-sm leading-relaxed mb-4 line-clamp-2">
            {agent.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {agent.tags?.slice(0, 3).map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono bg-panel-light border border-border text-text-muted">
                <Tag size={9} />
                {tag}
              </span>
            ))}
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-3 mb-4 py-3 border-t border-b border-border">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-cyber-yellow mb-1">
                <Star size={12} fill="currentColor" />
                <span className="text-sm font-mono font-bold">{agent.rating}</span>
              </div>
              <div className="text-xs text-text-muted">Rating</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-electric-blue mb-1">
                <Activity size={12} />
                <span className="text-sm font-mono font-bold">{(agent.calls / 1000).toFixed(1)}k</span>
              </div>
              <div className="text-xs text-text-muted">Calls</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-cyber-green mb-1">
                <TrendingUp size={12} />
                <span className="text-sm font-mono font-bold">{agent.successRate}%</span>
              </div>
              <div className="text-xs text-text-muted">Success</div>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-text-muted text-xs font-mono">PRICE</span>
              <span className="text-electric-blue font-mono font-bold text-sm">
                {agent.pricing} ETH
              </span>
              <span className="text-text-muted text-xs">/call</span>
            </div>
            <motion.div
              className="px-3 py-1.5 rounded bg-electric-blue/10 border border-electric-blue/30 text-electric-blue text-xs font-mono tracking-wider"
              whileHover={{ backgroundColor: 'rgba(0,168,255,0.2)' }}
            >
              EXECUTE →
            </motion.div>
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  )
}