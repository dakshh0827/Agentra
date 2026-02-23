import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Star, Zap, Crown, Medal } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import LoadingPulse from '../components/ui/LoadingPulse'
import { analyticsAPI } from '../api/analytics'

const rankIcon = (i) => {
  if (i === 0) return <Crown size={18} className="text-cyber-yellow" />
  if (i === 1) return <Medal size={16} className="text-text-secondary" />
  if (i === 2) return <Medal size={16} className="text-amber-600" />
  return <span className="font-mono text-text-muted text-sm w-5 text-center">{i + 1}</span>
}

const rankGlow = (i) => {
  if (i === 0) return 'border-cyber-yellow/30 bg-cyber-yellow/5'
  if (i === 1) return 'border-text-secondary/20 bg-white/2'
  if (i === 2) return 'border-amber-600/20 bg-amber-900/5'
  return 'border-border'
}

export default function Leaderboard() {
  const [hovered, setHovered] = useState(null)
  const [ranked, setRanked] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await analyticsAPI.getLeaderboard()
        // Compute score on frontend if backend doesn't provide it directly
        const agentsWithScores = (data.leaderboard || data).map(a => ({
          ...a,
          score: a.score || (0.4 * (a.rating || 0) * 20 + 0.3 * ((a.calls || 0) / 500) + 0.2 * (a.revenue || 0) / 10 + 0.1 * (a.successRate || 0)).toFixed(1),
        })).sort((a, b) => b.score - a.score)
        setRanked(agentsWithScores)
      } catch (error) {
        console.error("Failed to fetch leaderboard", error)
      } finally {
        setLoading(false)
      }
    }
    fetchLeaderboard()
  }, [])

  if (loading) {
    return <div className="p-6 max-w-5xl mx-auto"><LoadingPulse rows={6} /></div>
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Trophy size={20} className="text-cyber-yellow" />
          <span className="font-mono text-xs text-cyber-yellow tracking-widest">NEURAL RANKING PROTOCOL</span>
        </div>
        <h1 className="font-display font-bold text-4xl text-text-primary">
          <span className="gradient-text">AGENT</span> LEADERBOARD
        </h1>
        <p className="text-text-secondary mt-1 text-sm font-mono">
          Score = 0.4×votes + 0.3×usage + 0.2×revenue + 0.1×successRate
        </p>
      </motion.div>

      {/* Top 3 podium */}
      {ranked.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {ranked.slice(0, 3).map((agent, i) => {
            const podiumOrder = [1, 0, 2] // center is 1st
            const displayIdx = podiumOrder.indexOf(i)
            return (
              <motion.div
                key={agent._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: displayIdx * 0.1 }}
                className={`order-${i === 0 ? 2 : i === 1 ? 1 : 3}`}
              >
                <GlassCard
                  className={`p-4 text-center border ${rankGlow(i === 0 ? 0 : i === 1 ? 1 : 2)}`}
                  glowColor={i === 0 ? 'green' : 'blue'}
                >
                  <div className="flex justify-center mb-2">{rankIcon(i)}</div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-electric-blue/20 to-neon-purple/20 border border-electric-blue/30 flex items-center justify-center mx-auto mb-2">
                    <Zap size={20} className="text-electric-blue" />
                  </div>
                  <div className="font-display font-bold text-text-primary text-sm mb-1">{agent.name}</div>
                  <div className="font-mono text-2xl font-bold gradient-text">{agent.score}</div>
                  <div className="text-text-muted text-[10px] font-mono mt-1">NEURAL SCORE</div>
                </GlassCard>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Full ranking table */}
      <GlassCard className="overflow-hidden" hover={false}>
        {/* Table header */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-border bg-panel-light">
          {[
            { label: 'RANK', span: 1 },
            { label: 'AGENT', span: 4 },
            { label: 'SCORE', span: 2 },
            { label: 'RATING', span: 2 },
            { label: 'CALLS', span: 2 },
            { label: 'SUCCESS', span: 1 },
          ].map(col => (
            <div key={col.label} className={`col-span-${col.span} text-[10px] font-mono tracking-widest text-text-muted uppercase`}>
              {col.label}
            </div>
          ))}
        </div>

        {/* Table rows */}
        {ranked.map((agent, i) => (
          <motion.div
            key={agent._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            onMouseEnter={() => setHovered(agent._id)}
            onMouseLeave={() => setHovered(null)}
            className={`grid grid-cols-12 gap-4 px-5 py-4 border-b border-border last:border-0 transition-all duration-200 ${
              hovered === agent._id ? 'bg-electric-blue/5' : ''
            }`}
          >
            {/* Rank */}
            <div className="col-span-1 flex items-center">
              {rankIcon(i)}
            </div>

            {/* Agent */}
            <div className="col-span-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-electric-blue/20 to-neon-purple/20 border border-electric-blue/20 flex items-center justify-center">
                <Zap size={14} className="text-electric-blue" />
              </div>
              <div>
                <div className="font-display font-bold text-text-primary text-sm">{agent.name}</div>
                <div className="text-text-muted text-xs font-mono">{agent.category || 'N/A'}</div>
              </div>
            </div>

            {/* Score */}
            <div className="col-span-2 flex items-center">
              <div>
                <div className="font-mono font-bold text-base gradient-text">{agent.score}</div>
                <div className="h-1 w-16 bg-panel-light rounded-full mt-1 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((agent.score / 100) * 100, 100)}%` }}
                    transition={{ delay: 0.5 + i * 0.05, duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-electric-blue to-neon-purple rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="col-span-2 flex items-center gap-1">
              <Star size={12} className="text-cyber-yellow" fill="#ffcc00" />
              <span className="font-mono text-sm text-text-primary">{agent.rating || 0}</span>
            </div>

            {/* Calls */}
            <div className="col-span-2 flex items-center">
              <span className="font-mono text-sm text-electric-blue">{((agent.calls || 0) / 1000).toFixed(1)}K</span>
            </div>

            {/* Success */}
            <div className="col-span-1 flex items-center">
              <span className="font-mono text-sm text-cyber-green">{agent.successRate || 0}%</span>
            </div>
          </motion.div>
        ))}
        {ranked.length === 0 && (
          <div className="text-center py-10 text-text-muted font-mono">
            No agents ranked yet.
          </div>
        )}
      </GlassCard>
    </div>
  )
}