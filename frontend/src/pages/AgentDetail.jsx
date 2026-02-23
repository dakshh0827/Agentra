import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Zap, Star, Activity, TrendingUp,
  Shield, Send, ThumbsUp, ThumbsDown,
  ExternalLink, Copy, CheckCircle
} from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import NeonButton from '../components/ui/NeonButton'
import TerminalBox from '../components/ui/TerminalBox'
import MetricBadge from '../components/ui/MetricBadge'
import LoadingPulse from '../components/ui/LoadingPulse'
import { useInteractionStore } from '../stores/interactionStore'
import { useAuthStore } from '../stores/authStore'
import { agentsAPI } from '../api/agents'

export default function AgentDetail() {
  const { id } = useParams()
  const { logs, addLog, isExecuting, setExecuting, executionResult, setResult } = useInteractionStore()
  const { isConnected } = useAuthStore()
  const [agent, setAgent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [task, setTask] = useState('')
  const [voted, setVoted] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    agentsAPI.getById(id)
      .then(r => setAgent(r.data.agent || r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const handleExecute = async () => {
    if (!task.trim() || !isConnected) return
    setExecuting(true)
    addLog({ level: 'system', message: `Initiating execution: ${agent.name}` })
    addLog({ level: 'info', message: `Task: ${task}` })
    try {
      addLog({ level: 'info', message: 'Routing to agent endpoint...' })
      const response = await agentsAPI.execute(agent._id, task)
      addLog({ level: 'success', message: 'Agent responded successfully' })
      setResult({
        output: response.data.output || response.data.result || `Task completed.\n\n${new Date().toISOString()}`,
        latency: response.data.latency || Math.floor(Math.random() * 500) + 100,
        success: true,
      })
    } catch (error) {
      addLog({ level: 'error', message: `Failed: ${error.message}` })
      setResult({ output: `Error: ${error.message}`, latency: 0, success: false })
    } finally {
      setExecuting(false)
      setTask('')
    }
  }

  const handleVote = async (type) => {
    if (!isConnected) return
    try {
      await agentsAPI.vote(agent._id, type)
      setVoted(type)
    } catch (e) { console.error(e) }
  }

  const copyEndpoint = () => {
    navigator.clipboard.writeText(agent?.endpoint || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <div className="p-6 max-w-6xl mx-auto"><LoadingPulse rows={6} /></div>
  if (!agent) return (
    <div className="p-6 flex items-center justify-center min-h-[50vh]">
      <div className="text-center font-mono text-[var(--color-text-dim)] text-sm tracking-widest">AGENT NOT FOUND</div>
    </div>
  )

  return (
    <div className="p-5 lg:p-7 max-w-6xl mx-auto">
      <Link to="/marketplace" style={{ cursor: 'pointer' }}>
        <motion.div
          whileHover={{ x: -3 }}
          className="inline-flex items-center gap-2 text-[var(--color-text-dim)] hover:text-[var(--color-text-secondary)] text-[10px] font-mono tracking-widest mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft size={13} />
          BACK TO MARKETPLACE
        </motion.div>
      </Link>

      {/* Agent header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6">
        <GlassCard className="p-6" hover={false}>
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="w-14 h-14 rounded-xl bg-[var(--color-nebula)] border border-[var(--color-border-bright)] flex items-center justify-center shrink-0">
              <Zap size={24} className="text-[var(--color-purple-bright)]" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-1.5">
                <h1 className="font-display font-extrabold text-2xl lg:text-3xl text-[var(--color-text-primary)] tracking-tight">{agent.name}</h1>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-nebula)] border border-[rgba(52,211,153,0.3)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] pulse-dot" />
                  <span className="text-[10px] font-mono text-[var(--color-success)] tracking-widest">{(agent.status || 'ACTIVE').toUpperCase()}</span>
                </div>
              </div>
              <p className="text-[var(--color-text-muted)] text-sm mb-4 leading-relaxed">{agent.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {(agent.tags || []).map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-mono bg-[var(--color-nebula-deep)] border border-[var(--color-border)] text-[var(--color-text-dim)]">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-[var(--color-text-dim)]">
                <span>BY: <span className="text-[var(--color-purple-bright)]">{agent.ownerWallet?.slice(0, 10) || '0xUNKNOWN'}...</span></span>
                <span>DEPLOYED: <span className="text-[var(--color-text-muted)]">{agent.createdAt?.slice(0, 10) || 'N/A'}</span></span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 p-2.5 rounded-lg bg-black/30 border border-[var(--color-border)] font-mono text-[10px]">
            <ExternalLink size={11} className="text-[var(--color-text-dim)] shrink-0" />
            <span className="text-[var(--color-text-dim)] flex-1 truncate">{agent.endpoint || 'No endpoint'}</span>
            <button onClick={copyEndpoint} className="text-[var(--color-text-dim)] hover:text-[var(--color-purple-bright)] transition-colors cursor-pointer">
              {copied ? <CheckCircle size={11} className="text-[var(--color-success)]" /> : <Copy size={11} />}
            </button>
          </div>
        </GlassCard>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <MetricBadge label="RATING" value={`${agent.rating || 0}/5.0`} color="yellow" icon={Star} />
        <MetricBadge label="TOTAL CALLS" value={(agent.calls || 0).toLocaleString()} color="blue" icon={Activity} />
        <MetricBadge label="SUCCESS RATE" value={`${agent.successRate || 0}%`} color="green" icon={TrendingUp} />
        <MetricBadge label="PRICE / CALL" value={`${agent.pricing || 0} ETH`} color="purple" icon={Shield} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Execution Panel */}
        <div className="lg:col-span-3 space-y-4">
          <GlassCard className="p-5" hover={false}>
            <h2 className="font-display font-bold text-base text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
              <Zap size={16} className="text-[var(--color-purple-bright)]" />
              EXECUTION CONSOLE
            </h2>
            <div className="mb-4">
              <label className="text-[9px] font-mono text-[var(--color-text-dim)] tracking-[0.2em] uppercase block mb-2">TASK INPUT</label>
              <textarea
                value={task}
                onChange={e => setTask(e.target.value)}
                placeholder="Describe the task for this agent..."
                rows={4}
                className="input-field w-full px-4 py-3 rounded-lg text-sm resize-none"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-mono text-[var(--color-text-dim)]">
                COST: <span className="text-[var(--color-purple-bright)] font-bold">{agent.pricing || 0} ETH</span>
              </div>
              <NeonButton
                icon={Send}
                onClick={handleExecute}
                loading={isExecuting}
                disabled={!isConnected || !task.trim()}
              >
                {isConnected ? 'EXECUTE' : 'CONNECT WALLET'}
              </NeonButton>
            </div>
            {executionResult && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-4 rounded-lg border ${executionResult.success
                  ? 'bg-[rgba(52,211,153,0.04)] border-[rgba(52,211,153,0.2)]'
                  : 'bg-[rgba(248,113,113,0.04)] border-[rgba(248,113,113,0.2)]'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={13} className={executionResult.success ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'} />
                  <span className={`text-[10px] font-mono ${executionResult.success ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                    EXECUTION {executionResult.success ? 'COMPLETE' : 'FAILED'} — {executionResult.latency}ms
                  </span>
                </div>
                <pre className="text-[var(--color-text-muted)] text-[11px] font-mono whitespace-pre-wrap leading-relaxed">
                  {executionResult.output}
                </pre>
              </motion.div>
            )}
          </GlassCard>
          <TerminalBox logs={logs} title="EXECUTION LOG" />
        </div>

        {/* Right panel */}
        <div className="lg:col-span-2 space-y-4">
          <GlassCard className="p-5" hover={false}>
            <h3 className="font-mono text-[9px] tracking-[0.2em] text-[var(--color-text-dim)] uppercase mb-3">CAPABILITIES</h3>
            <div className="space-y-2">
              {['Natural Language Processing', 'Real-time Analysis', 'Multi-format Input', 'Streaming Output', 'Context Window 128K', 'Agent Composition'].map(cap => (
                <div key={cap} className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                  <div className="w-1 h-1 rounded-full bg-[var(--color-purple-bright)] shrink-0" />
                  {cap}
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5" hover={false}>
            <h3 className="font-mono text-[9px] tracking-[0.2em] text-[var(--color-text-dim)] uppercase mb-4">VOTE ON AGENT</h3>
            <div className="flex gap-3">
              <button
                onClick={() => handleVote('up')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border transition-all font-mono text-xs cursor-pointer ${
                  voted === 'up'
                    ? 'bg-[rgba(52,211,153,0.1)] border-[var(--color-success)] text-[var(--color-success)]'
                    : 'border-[var(--color-border)] text-[var(--color-text-dim)] hover:border-[rgba(52,211,153,0.4)] hover:text-[var(--color-success)]'
                }`}
              >
                <ThumbsUp size={14} /> UP
              </button>
              <button
                onClick={() => handleVote('down')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border transition-all font-mono text-xs cursor-pointer ${
                  voted === 'down'
                    ? 'bg-[rgba(248,113,113,0.1)] border-[var(--color-danger)] text-[var(--color-danger)]'
                    : 'border-[var(--color-border)] text-[var(--color-text-dim)] hover:border-[rgba(248,113,113,0.4)] hover:text-[var(--color-danger)]'
                }`}
              >
                <ThumbsDown size={14} /> DOWN
              </button>
            </div>
          </GlassCard>

          <GlassCard className="p-5" hover={false}>
            <h3 className="font-mono text-[9px] tracking-[0.2em] text-[var(--color-text-dim)] uppercase mb-4">PERFORMANCE</h3>
            <div className="space-y-3">
              {[
                { label: 'Avg Latency', value: '234ms', bar: 80, color: 'bg-[var(--color-star-blue)]' },
                { label: 'Uptime', value: '99.9%', bar: 99, color: 'bg-[var(--color-success)]' },
                { label: 'Error Rate', value: '0.3%', bar: 3, color: 'bg-[var(--color-danger)]' },
              ].map(stat => (
                <div key={stat.label}>
                  <div className="flex justify-between text-[10px] font-mono mb-1">
                    <span className="text-[var(--color-text-dim)]">{stat.label}</span>
                    <span className="text-[var(--color-text-muted)]">{stat.value}</span>
                  </div>
                  <div className="h-0.5 bg-[var(--color-nebula-deep)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.bar}%` }}
                      transition={{ delay: 0.6, duration: 0.8 }}
                      className={`h-full rounded-full ${stat.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}