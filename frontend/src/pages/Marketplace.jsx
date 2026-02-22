import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, SlidersHorizontal, Zap, Globe, RefreshCw } from 'lucide-react'
import AgentCard from '../components/ui/AgentCard'
import GlassCard from '../components/ui/GlassCard'
import NeonButton from '../components/ui/NeonButton'
import LoadingPulse from '../components/ui/LoadingPulse'
import { useAgents, MOCK_AGENTS } from '../hooks/useAgents'
import { useMarketplaceStore } from '../stores/marketplaceStore'

const CATEGORIES = ['all', 'Analysis', 'Development', 'Security', 'Data', 'NLP', 'Web3']
const SORT_OPTIONS = ['rating', 'calls', 'price-low', 'price-high', 'newest']

export default function Marketplace() {
  const { agents, isLoading } = useAgents()
  const { filters, search, setFilter, setSearch } = useMarketplaceStore()
  const [showFilters, setShowFilters] = useState(false)

  // 1. Safely handle the agents array to prevent undefined errors
  const safeAgents = Array.isArray(agents) ? agents : []
  const safeMockAgents = Array.isArray(MOCK_AGENTS) ? MOCK_AGENTS : []
  
  // Use mock data as fallback if the fetched agents array is empty
  const displayAgents = safeAgents.length > 0 ? safeAgents : safeMockAgents

  // 2. Safely filter and sort the display array
  const filteredAgents = displayAgents.filter(a => {
    // Fallback to empty strings/arrays in case agent data is malformed
    const agentName = a?.name || ''
    const agentDesc = a?.description || ''
    const agentTags = Array.isArray(a?.tags) ? a.tags : []
    
    const matchSearch = !search || 
      agentName.toLowerCase().includes(search.toLowerCase()) ||
      agentDesc.toLowerCase().includes(search.toLowerCase()) ||
      agentTags.some(t => t.toLowerCase().includes(search.toLowerCase()))
      
    const matchCat = filters?.category === 'all' || a?.category === filters?.category
    
    return matchSearch && matchCat
  }).sort((a, b) => {
    if (filters?.sortBy === 'rating') return (b?.rating || 0) - (a?.rating || 0)
    if (filters?.sortBy === 'calls') return (b?.calls || 0) - (a?.calls || 0)
    if (filters?.sortBy === 'price-low') return (a?.pricing || 0) - (b?.pricing || 0)
    if (filters?.sortBy === 'price-high') return (b?.pricing || 0) - (a?.pricing || 0)
    return 0
  })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <Globe size={20} className="text-electric-blue" />
          <span className="font-mono text-xs text-electric-blue tracking-widest">AGENT PROTOCOL v2.4</span>
        </div>
        <h1 className="font-display font-bold text-4xl text-text-primary mb-2">
          <span className="gradient-text">AGENT</span> MARKETPLACE
        </h1>
        <p className="text-text-secondary font-body">
          Discover, execute, and compose autonomous AI agents on-chain. {displayAgents.length} agents deployed.
        </p>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
      >
        {[
          { label: 'TOTAL AGENTS', value: '247', color: 'text-electric-blue' },
          { label: 'ACTIVE NOW', value: '183', color: 'text-cyber-green' },
          { label: 'CALLS TODAY', value: '84.2K', color: 'text-neon-purple' },
          { label: 'VOLUME ETH', value: '1,284', color: 'text-cyber-yellow' },
        ].map(stat => (
          <GlassCard key={stat.label} className="p-3 text-center" hover={false}>
            <div className={`font-mono font-bold text-xl ${stat.color}`}>{stat.value}</div>
            <div className="text-text-muted text-xs font-mono tracking-wider mt-0.5">{stat.label}</div>
          </GlassCard>
        ))}
      </motion.div>

      {/* Search + Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="mb-6 space-y-3"
      >
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search agents, capabilities, tags..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-panel border border-border rounded-lg text-text-primary font-body text-sm placeholder-text-muted focus:outline-none focus:border-electric-blue/60 focus:shadow-glow-blue transition-all"
            />
          </div>
          <NeonButton
            variant="ghost"
            icon={SlidersHorizontal}
            onClick={() => setShowFilters(!showFilters)}
          >
            FILTERS
          </NeonButton>
          <NeonButton variant="ghost" icon={RefreshCw}>
          </NeonButton>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter('category', cat)}
              className={`px-3 py-1.5 rounded font-mono text-xs tracking-wider border transition-all ${
                filters?.category === cat
                  ? 'bg-electric-blue/20 border-electric-blue text-electric-blue'
                  : 'bg-panel border-border text-text-muted hover:border-border-glow hover:text-text-secondary'
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-text-muted text-xs font-mono">SORT:</span>
            <select
              value={filters?.sortBy || 'newest'}
              onChange={e => setFilter('sortBy', e.target.value)}
              className="bg-panel border border-border rounded px-2 py-1.5 text-xs font-mono text-text-secondary focus:outline-none focus:border-electric-blue/60"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o} value={o}>{o.toUpperCase().replace('-', ' ')}</option>
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
            <AgentCard key={agent._id || i} agent={agent} index={i} />
          ))}
          {filteredAgents.length === 0 && (
            <div className="col-span-3 text-center py-20 text-text-muted font-mono">
              <Zap size={32} className="mx-auto mb-3 opacity-30" />
              No agents match your query.
            </div>
          )}
        </div>
      )}
    </div>
  )
}