import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import { BarChart3, TrendingUp, Zap, DollarSign, Activity, ArrowUpRight } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import MetricBadge from '../components/ui/MetricBadge'
import LoadingPulse from '../components/ui/LoadingPulse'
import { analyticsAPI } from '../api/analytics'
import { useAuthStore } from '../stores/authStore'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-panel border border-[var(--color-border-bright)] rounded-lg px-3 py-2 text-xs font-mono">
      <div className="text-[var(--color-text-dim)] mb-1">{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { walletAddress } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({ metrics: null, revenueData: [], agentPerf: [], activityFeed: [] })

  useEffect(() => {
    if (!walletAddress) { setLoading(false); return }
    analyticsAPI.getDashboard(walletAddress)
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [walletAddress])

  if (!walletAddress) return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <Zap size={40} className="text-[var(--color-purple-bright)] mb-4 opacity-40" />
      <h2 className="text-xl font-display font-bold text-[var(--color-text-primary)] mb-2">Connect Wallet</h2>
      <p className="text-[var(--color-text-muted)] text-sm">Connect your wallet to view analytics.</p>
    </div>
  )

  if (loading) return <div className="p-6 max-w-7xl mx-auto"><LoadingPulse rows={6} /></div>

  const metrics = data.metrics || {}
  const revenueData = data.revenueData || []
  const agentPerf = data.agentPerf || []
  const activityFeed = data.activityFeed || []

  return (
    <div className="p-5 lg:p-7 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-7">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 size={14} className="text-[var(--color-success)]" />
          <span className="font-mono text-[10px] text-[var(--color-success)] tracking-[0.3em]">ANALYTICS DASHBOARD</span>
        </div>
        <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-[var(--color-text-primary)] leading-tight">
          REVENUE CONTROL
        </h1>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'TOTAL REVENUE', value: `${metrics.totalRevenue || 0} ETH`, color: 'green', icon: DollarSign, sublabel: '+32% this week' },
          { label: 'TOTAL CALLS', value: (metrics.totalCalls || 0).toLocaleString(), color: 'blue', icon: Activity, sublabel: '+18% this week' },
          { label: 'MY AGENTS', value: metrics.agentsCount || 0, color: 'purple', icon: Zap, sublabel: `${metrics.activeAgentsCount || 0} active` },
          { label: 'SUCCESS RATE', value: `${metrics.successRate || 0}%`, color: 'yellow', icon: TrendingUp, sublabel: 'All agents' },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <MetricBadge {...m} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <GlassCard className="lg:col-span-2 p-5" hover={false}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-bold text-[var(--color-text-primary)] text-sm">Revenue (7 days)</h3>
            <div className="flex items-center gap-1 text-[var(--color-success)] text-xs font-mono">
              <ArrowUpRight size={13} />
              <span>+32%</span>
            </div>
          </div>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,21,64,0.8)" />
                <XAxis dataKey="day" stroke="#3d2b6b" tick={{ fontSize: 10, fontFamily: 'Space Mono' }} />
                <YAxis stroke="#3d2b6b" tick={{ fontSize: 10, fontFamily: 'Space Mono' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="eth" stroke="#a855f7" strokeWidth={1.5} fill="url(#revGrad)" name="ETH" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[180px] text-[var(--color-text-dim)] font-mono text-xs">
              NO REVENUE DATA
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-5" hover={false}>
          <h3 className="font-display font-bold text-[var(--color-text-primary)] text-sm mb-4">Activity Feed</h3>
          <div className="space-y-2.5 overflow-y-auto max-h-52">
            {activityFeed.length > 0 ? activityFeed.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-start gap-2 pb-2.5 border-b border-[var(--color-border)] last:border-0"
              >
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-[var(--color-purple-bright)]" />
                <div>
                  <div className="text-xs text-[var(--color-text-secondary)]">{item.text}</div>
                  <div className="text-[var(--color-text-dim)] text-[9px] font-mono mt-0.5">{item.time}</div>
                </div>
              </motion.div>
            )) : (
              <div className="text-[var(--color-text-dim)] text-xs font-mono text-center py-4 tracking-widest">NO RECENT ACTIVITY</div>
            )}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-5" hover={false}>
        <h3 className="font-display font-bold text-[var(--color-text-primary)] text-sm mb-5">Agent Performance</h3>
        {agentPerf.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={agentPerf} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,21,64,0.8)" vertical={false} />
              <XAxis dataKey="name" stroke="#3d2b6b" tick={{ fontSize: 10, fontFamily: 'Space Mono' }} />
              <YAxis stroke="#3d2b6b" tick={{ fontSize: 10, fontFamily: 'Space Mono' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="calls" fill="rgba(124,58,237,0.4)" stroke="#7c3aed" strokeWidth={1} radius={[3, 3, 0, 0]} name="Calls" />
              <Bar dataKey="revenue" fill="rgba(52,211,153,0.3)" stroke="#34d399" strokeWidth={1} radius={[3, 3, 0, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[180px] text-[var(--color-text-dim)] font-mono text-xs">
            NO PERFORMANCE DATA
          </div>
        )}
      </GlassCard>
    </div>
  )
}