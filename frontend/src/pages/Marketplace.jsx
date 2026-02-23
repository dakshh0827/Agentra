import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, Zap, Globe, RefreshCw } from 'lucide-react'
import AgentCard from '../components/ui/AgentCard'
import GlassCard from '../components/ui/GlassCard'
import NeonButton from '../components/ui/NeonButton'
import LoadingPulse from '../components/ui/LoadingPulse'
import { useAgents } from '../hooks/useAgents'
import { useMarketplaceStore } from '../stores/marketplaceStore'
import { analyticsAPI } from '../api/analytics'

const CATEGORIES = ['all', 'Analysis', 'Development', 'Security', 'Data', 'NLP', 'Web3']
const SORT_OPTIONS = [
  { value: 'rating', label: 'RATING' },
  { value: 'calls', label: 'CALLS' },
  { value: 'price-low', label: 'PRICE ↑' },
  { value: 'price-high', label: 'PRICE ↓' },
  { value: 'newest', label: 'NEWEST' },
]

export default function Marketplace() {
  const { agents, isLoading } = useAgents()
  const { filters, search, setFilter, setSearch } = useMarketplaceStore()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    analyticsAPI.getGlobalStats()
      .then(r => setStats(r.data))
      .catch(() => {})
  }, [])

  const displayAgents = Array.isArray(agents) ? agents : []

  const filteredAgents = displayAgents.filter(a => {
    const matchSearch = !search ||
      a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.description?.toLowerCase().includes(search.toLowerCase()) ||
      (a.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()))
    const matchCat = filters.category === 'all' || a.category === filters.category
    return matchSearch && matchCat
  }).sort((a, b) => {
    if (filters.sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
    if (filters.sortBy === 'calls') return (b.calls || 0) - (a.calls || 0)
    if (filters.sortBy === 'price-low') return (a.pricing || 0) - (b.pricing || 0)
    if (filters.sortBy === 'price-high') return (b.pricing || 0) - (a.pricing || 0)
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  })

  return (
    <div className="p-5 lg:p-7 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-7"
      >
        <div className="flex items-center gap-2 mb-2">
          <Globe size={14} className="text-[var(--color-purple-bright)]" />
          <span className="font-mono text-[10px] text-[var(--color-purple-bright)] tracking-[0.3em]">AGENT PROTOCOL v2.4</span>
        </div>
        <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-[var(--color-text-primary)] leading-tight">
          AGENT MARKETPLACE
        </h1>
        <p className="text-[var(--color-text-muted)] text-sm font-body mt-1.5">
          Discover, execute, and compose autonomous AI agents on-chain.
        </p>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
      >
        {[
          { label: 'TOTAL AGENTS', value: stats?.totalAgents || displayAgents.length, color: 'text-[var(--color-purple-bright)]' },
          { label: 'ACTIVE NOW', value: stats?.activeAgents || '—', color: 'text-[var(--color-success)]' },
          { label: 'TOTAL CALLS', value: stats?.totalCalls ? `${(stats.totalCalls/1000).toFixed(1)}k` : '—', color: 'text-[var(--color-star-blue)]' },
          { label: 'VOLUME ETH', value: stats?.totalRevenue ? `${parseFloat(stats.totalRevenue).toFixed(2)}` : '—', color: 'text-[var(--color-warning)]' },
        ].map(stat => (
          <GlassCard key={stat.label} className="p-3.5 text-center" hover={false}>
            <div className={`font-mono font-bold text-xl ${stat.color}`}>{stat.value}</div>
            <div className="text-[var(--color-text-dim)] text-[9px] font-mono tracking-[0.2em] mt-0.5">{stat.label}</div>
          </GlassCard>
        ))}
      </motion.div>

      {/* Search + Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="mb-6 space-y-3"
      >
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]" />
            <input
              type="text"
              placeholder="Search agents, capabilities, tags..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field w-full pl-10 pr-4 py-2.5 rounded-lg text-sm"
            />
          </div>
          <NeonButton variant="ghost" icon={RefreshCw} size="sm" onClick={() => window.location.reload()}>
            REFRESH
          </NeonButton>
        </div>

        {/* Category pills + sort */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter('category', cat)}
                className={`px-3 py-1.5 rounded-lg font-mono text-[10px] tracking-[0.15em] border transition-all cursor-pointer ${
                  filters?.category === cat
                    ? 'bg-[var(--color-nebula)] border-[var(--color-purple-core)] text-[var(--color-purple-bright)]'
                    : 'bg-transparent border-[var(--color-border)] text-[var(--color-text-dim)] hover:border-[var(--color-border-bright)] hover:text-[var(--color-text-secondary)]'
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[var(--color-text-dim)] text-[10px] font-mono">SORT:</span>
            <select
              value={filters?.sortBy || 'rating'}
              onChange={e => setFilter('sortBy', e.target.value)}
              className="input-field px-2.5 py-1.5 rounded-lg text-[10px] font-mono cursor-pointer"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Agent grid */}
      {isLoading ? (
        <LoadingPulse rows={6} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAgents.map((agent, i) => (
            <AgentCard key={agent._id || agent.id || i} agent={agent} index={i} />
          ))}
          {filteredAgents.length === 0 && (
            <div className="col-span-3 text-center py-20 text-[var(--color-text-dim)] font-mono">
              <Zap size={28} className="mx-auto mb-3 opacity-20" />
              <div className="text-xs tracking-widest">NO AGENTS MATCH YOUR QUERY</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}