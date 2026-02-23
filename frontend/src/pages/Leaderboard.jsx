import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Star, Zap, Crown, Medal } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import LoadingPulse from '../components/ui/LoadingPulse'
import { analyticsAPI } from '../api/analytics'

const rankIcon = (i) => {
  if (i === 0) return <Crown size={16} className="text-[var(--color-warning)]" />
  if (i === 1) return <Medal size={15} className="text-[rgba(192,192,192,0.9)]" />
  if (i === 2) return <Medal size={15} className="text-[rgba(180,120,60,0.9)]" />
  return <span className="font-mono text-[var(--color-text-dim)] text-sm w-5 text-center">{i + 1}</span>
}

const podiumBorder = (i) => {
  if (i === 0) return 'border-[rgba(251,191,36,0.3)]'
  if (i === 1) return 'border-[rgba(192,192,192,0.2)]'
  if (i === 2) return 'border-[rgba(180,120,60,0.2)]'
  return 'border-[var(--color-border)]'
}

export default function Leaderboard() {
  const [hovered, setHovered] = useState(null)
  const [ranked, setRanked] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsAPI.getLeaderboard()
      .then(r => {
        const agents = (r.data.leaderboard || r.data)
        const scored = agents.map(a => ({
          ...a,
          score: a.score || parseFloat((
            0.4 * Math.max(0, Math.min(100, (a.rating || 0) * 20)) +
            0.3 * Math.min(100, (a.calls || 0) / 1000) +
            0.2 * Math.min(100, (a.revenue || 0) / 100) +
            0.1 * (a.successRate || 0)
          ).toFixed(1))
        })).sort((a, b) => b.score - a.score)
        setRanked(scored)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-6 max-w-5xl mx-auto"><LoadingPulse rows={6} /></div>

  return (
    <div className="p-5 lg:p-7 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-7">
        <div className="flex items-center gap-2 mb-2">
          <Trophy size={14} className="text-[var(--color-warning)]" />
          <span className="font-mono text-[10px] text-[var(--color-warning)] tracking-[0.3em]">NEURAL RANKING PROTOCOL</span>
        </div>
        <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-[var(--color-text-primary)] leading-tight">
          LEADERBOARD
        </h1>
        <p className="text-[var(--color-text-dim)] text-xs font-mono mt-1.5 tracking-widest">
          SCORE = 0.4×VOTES + 0.3×USAGE + 0.2×REVENUE + 0.1×SUCCESS
        </p>
      </motion.div>

      {/* Top 3 Podium */}
      {ranked.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[ranked[1], ranked[0], ranked[2]].map((agent, visualIdx) => {
            const realIdx = visualIdx === 0 ? 1 : visualIdx === 1 ? 0 : 2
            return (
              <motion.div
                key={agent._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: visualIdx * 0.08, duration: 0.4 }}
                className={visualIdx === 1 ? '-mt-2' : 'mt-4'}
              >
                <GlassCard className={`p-4 text-center border ${podiumBorder(realIdx)}`}>
                  <div className="flex justify-center mb-2">{rankIcon(realIdx)}</div>
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-nebula)] border border-[var(--color-border-bright)] flex items-center justify-center mx-auto mb-2">
                    <Zap size={17} className="text-[var(--color-purple-bright)]" />
                  </div>
                  <div className="font-display font-bold text-[var(--color-text-primary)] text-xs mb-1 truncate px-1">{agent.name}</div>
                  <div className="font-mono text-xl font-bold text-[var(--color-purple-bright)]">{agent.score}</div>
                  <div className="text-[var(--color-text-dim)] text-[9px] font-mono mt-0.5">SCORE</div>
                </GlassCard>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Full ranking table */}
      <GlassCard className="overflow-hidden" hover={false}>
        <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-panel-light)]">
          {[
            { label: 'RANK', span: 1 },
            { label: 'AGENT', span: 4 },
            { label: 'SCORE', span: 2 },
            { label: 'RATING', span: 2 },
            { label: 'CALLS', span: 2 },
            { label: 'SUCCESS', span: 1 },
          ].map(col => (
            <div key={col.label} className={`col-span-${col.span} text-[9px] font-mono tracking-[0.2em] text-[var(--color-text-dim)] uppercase`}>
              {col.label}
            </div>
          ))}
        </div>

        {ranked.map((agent, i) => (
          <motion.div
            key={agent._id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03, duration: 0.3 }}
            onMouseEnter={() => setHovered(agent._id)}
            onMouseLeave={() => setHovered(null)}
            className={`grid grid-cols-12 gap-3 px-5 py-3.5 border-b border-[var(--color-border)] last:border-0 transition-all duration-150 ${
              hovered === agent._id ? 'bg-[rgba(124,58,237,0.05)]' : ''
            }`}
          >
            <div className="col-span-1 flex items-center">{rankIcon(i)}</div>
            <div className="col-span-4 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[var(--color-nebula-deep)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
                <Zap size={12} className="text-[var(--color-purple-bright)]" />
              </div>
              <div className="min-w-0">
                <div className="font-display font-bold text-[var(--color-text-primary)] text-xs truncate">{agent.name}</div>
                <div className="text-[var(--color-text-dim)] text-[9px] font-mono">{agent.category || 'N/A'}</div>
              </div>
            </div>
            <div className="col-span-2 flex items-center">
              <div>
                <div className="font-mono font-bold text-sm text-[var(--color-purple-bright)]">{agent.score}</div>
                <div className="h-0.5 w-14 bg-[var(--color-nebula-deep)] rounded-full mt-1 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((agent.score / 100) * 100, 100)}%` }}
                    transition={{ delay: 0.4 + i * 0.04, duration: 0.7 }}
                    className="h-full bg-[var(--color-purple-bright)] rounded-full"
                  />
                </div>
              </div>
            </div>
            <div className="col-span-2 flex items-center gap-1">
              <Star size={11} className="text-[var(--color-warning)]" fill="var(--color-warning)" />
              <span className="font-mono text-xs text-[var(--color-text-primary)]">{agent.rating || 0}</span>
            </div>
            <div className="col-span-2 flex items-center">
              <span className="font-mono text-xs text-[var(--color-star-blue)]">{((agent.calls || 0) / 1000).toFixed(1)}K</span>
            </div>
            <div className="col-span-1 flex items-center">
              <span className="font-mono text-xs text-[var(--color-success)]">{agent.successRate || 0}%</span>
            </div>
          </motion.div>
        ))}

        {ranked.length === 0 && (
          <div className="text-center py-12 text-[var(--color-text-dim)] font-mono text-xs tracking-widest">
            NO AGENTS RANKED YET
          </div>
        )}
      </GlassCard>
    </div>
  )
}