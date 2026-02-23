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
    <div className="glass-panel border border-border rounded-lg px-3 py-2 text-xs font-mono">
      <div className="text-text-muted mb-1">{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { walletAddress } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    metrics: null,
    revenueData: [],
    agentPerf: [],
    activityFeed: []
  })

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!walletAddress) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const response = await analyticsAPI.getDashboard(walletAddress)
        setData(response.data)
      } catch (error) {
        console.error("Failed to fetch dashboard", error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [walletAddress])

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <LoadingPulse rows={6} />
      </div>
    )
  }

  if (!walletAddress) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Zap size={48} className="text-electric-blue mb-4 opacity-50 animate-pulse" />
        <h2 className="text-2xl font-display font-bold text-text-primary mb-2">Connect Wallet</h2>
        <p className="text-text-secondary">Please connect your wallet to view your dashboard analytics.</p>
      </div>
    )
  }

  const metrics = data.metrics || {}
  const revenueData = data.revenueData || []
  const agentPerf = data.agentPerf || []
  const activityFeed = data.activityFeed || []

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 size={20} className="text-cyber-green" />
          <span className="font-mono text-xs text-cyber-green tracking-widest">ANALYTICS DASHBOARD</span>
        </div>
        <h1 className="font-display font-bold text-4xl text-text-primary">
          <span className="gradient-text-cyber">REVENUE</span> CONTROL
        </h1>
      </motion.div>

      {/* Metrics row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'TOTAL REVENUE', value: `${metrics.totalRevenue || 0} ETH`, color: 'green', icon: DollarSign, sublabel: '+32% this week' },
          { label: 'TOTAL CALLS', value: (metrics.totalCalls || 0).toLocaleString(), color: 'blue', icon: Activity, sublabel: '+18% this week' },
          { label: 'MY AGENTS', value: metrics.agentsCount || 0, color: 'purple', icon: Zap, sublabel: `${metrics.activeAgentsCount || 0} active` },
          { label: 'SUCCESS RATE', value: `${metrics.successRate || 0}%`, color: 'yellow', icon: TrendingUp, sublabel: 'All agents' },
        ].map(m => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <MetricBadge {...m} />
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Revenue chart */}
        <GlassCard className="lg:col-span-2 p-5" hover={false}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-bold text-text-primary">Revenue (7 days)</h3>
            <div className="flex items-center gap-1 text-cyber-green text-sm font-mono">
              <ArrowUpRight size={14} />
              <span>+32%</span>
            </div>
          </div>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="ethGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00a8ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00a8ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,32,64,0.8)" />
                <XAxis dataKey="day" stroke="#3a5a7a" tick={{ fontSize: 11, fontFamily: 'Share Tech Mono' }} />
                <YAxis stroke="#3a5a7a" tick={{ fontSize: 11, fontFamily: 'Share Tech Mono' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="eth" stroke="#00a8ff" strokeWidth={2} fill="url(#ethGrad)" name="ETH" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-text-muted font-mono text-sm">
              No revenue data available
            </div>
          )}
        </GlassCard>

        {/* Activity feed */}
        <GlassCard className="p-5" hover={false}>
          <h3 className="font-display font-bold text-text-primary mb-4">Activity Feed</h3>
          <div className="space-y-3 overflow-y-auto max-h-52">
            {activityFeed.length > 0 ? activityFeed.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-2 pb-3 border-b border-border last:border-0"
              >
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${item.color?.replace('text-', 'bg-') || 'bg-electric-blue'}`} />
                <div>
                  <div className={`text-xs ${item.color || 'text-electric-blue'}`}>{item.text}</div>
                  <div className="text-text-muted text-[10px] font-mono mt-0.5">{item.time}</div>
                </div>
              </motion.div>
            )) : (
              <div className="text-text-muted text-sm font-mono text-center py-4">No recent activity</div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Agent performance */}
      <GlassCard className="p-5" hover={false}>
        <h3 className="font-display font-bold text-text-primary mb-5">Agent Performance</h3>
        {agentPerf.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={agentPerf} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,32,64,0.8)" vertical={false} />
              <XAxis dataKey="name" stroke="#3a5a7a" tick={{ fontSize: 11, fontFamily: 'Share Tech Mono' }} />
              <YAxis stroke="#3a5a7a" tick={{ fontSize: 11, fontFamily: 'Share Tech Mono' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="calls" fill="rgba(0,168,255,0.5)" stroke="#00a8ff" strokeWidth={1} radius={[4, 4, 0, 0]} name="Calls" />
              <Bar dataKey="revenue" fill="rgba(0,255,136,0.4)" stroke="#00ff88" strokeWidth={1} radius={[4, 4, 0, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[200px] text-text-muted font-mono text-sm">
            No performance data available
          </div>
        )}
      </GlassCard>
    </div>
  )
}