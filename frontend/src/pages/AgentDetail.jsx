import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Zap, Star, Activity, TrendingUp,
  Shield, Clock, Send, ThumbsUp, ThumbsDown,
  ExternalLink, Copy, CheckCircle
} from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import NeonButton from '../components/ui/NeonButton'
import TerminalBox from '../components/ui/TerminalBox'
import MetricBadge from '../components/ui/MetricBadge'
import { MOCK_AGENTS } from '../hooks/useAgents'
import { useInteractionStore } from '../stores/interactionStore'
import { useAuthStore } from '../stores/authStore'

export default function AgentDetail() {
  const { id } = useParams()
  const agent = MOCK_AGENTS.find(a => a._id === id) || MOCK_AGENTS[0]
  const { logs, addLog, isExecuting, setExecuting, executionResult, setResult } = useInteractionStore()
  const { isConnected } = useAuthStore()
  const [task, setTask] = useState('')
  const [voted, setVoted] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleExecute = async () => {
    if (!task.trim() || !isConnected) return
    setExecuting(true)
    addLog({ level: 'system', message: `Initiating execution for agent: ${agent.name}` })
    addLog({ level: 'info', message: `Task: ${task}` })
    addLog({ level: 'info', message: 'Verifying payment on-chain...' })

    // Simulate execution
    await new Promise(r => setTimeout(r, 800))
    addLog({ level: 'success', message: `Payment verified. Tx: 0x${Math.random().toString(16).slice(2, 18)}...` })
    await new Promise(r => setTimeout(r, 600))
    addLog({ level: 'info', message: 'Routing to agent endpoint...' })
    await new Promise(r => setTimeout(r, 1000))
    addLog({ level: 'success', message: 'Agent responded successfully (latency: 234ms)' })

    setResult({
      output: `[${agent.name}] Task completed successfully.\n\nAnalysis complete. Processing your request: "${task}"\n\nResult: Neural processing indicates high confidence (98.2%) in the following output...\n\nExecuted at: ${new Date().toISOString()}\nAgent version: 2.4.1\nTokens processed: 1,247`,
      latency: 234,
      success: true,
    })
    setExecuting(false)
    setTask('')
  }

  const copyEndpoint = () => {
    navigator.clipboard.writeText(agent.endpoint)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Back */}
      <Link to="/marketplace">
        <motion.div
          whileHover={{ x: -3 }}
          className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary text-sm font-mono mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>BACK TO MARKETPLACE</span>
        </motion.div>
      </Link>

      {/* Agent header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-6 mb-8"
      >
        <GlassCard className="flex-1 p-6" hover={false}>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-electric-blue/30 to-neon-purple/30 border border-electric-blue/40 flex items-center justify-center animate-float">
              <Zap size={28} className="text-electric-blue" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-display font-bold text-3xl text-text-primary tracking-wide">{agent.name}</h1>
                <div className="flex items-center gap-1 px-2 py-1 rounded bg-cyber-green/10 border border-cyber-green/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyber-green pulse-dot" />
                  <span className="text-xs font-mono text-cyber-green">{agent.status.toUpperCase()}</span>
                </div>
              </div>
              <p className="text-text-secondary mb-4">{agent.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {agent.tags?.map(tag => (
                  <span key={tag} className="px-2 py-1 rounded text-xs font-mono bg-panel-light border border-border text-text-muted">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-text-muted">
                <span>BY: <span className="text-electric-blue">{agent.ownerWallet?.slice(0, 8)}...</span></span>
                <span>DEPLOYED: <span className="text-text-secondary">{agent.createdAt}</span></span>
              </div>
            </div>
          </div>

          {/* Endpoint */}
          <div className="mt-4 flex items-center gap-2 p-2.5 rounded bg-black/30 border border-border font-mono text-xs">
            <ExternalLink size={12} className="text-text-muted shrink-0" />
            <span className="text-text-muted flex-1 truncate">{agent.endpoint}</span>
            <button onClick={copyEndpoint} className="text-text-muted hover:text-electric-blue transition-colors">
              {copied ? <CheckCircle size={12} className="text-cyber-green" /> : <Copy size={12} />}
            </button>
          </div>
        </GlassCard>
      </motion.div>

      {/* Metrics row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <MetricBadge label="RATING" value={`${agent.rating}/5.0`} color="yellow" icon={Star} />
        <MetricBadge label="TOTAL CALLS" value={agent.calls?.toLocaleString()} color="blue" icon={Activity} />
        <MetricBadge label="SUCCESS RATE" value={`${agent.successRate}%`} color="green" icon={TrendingUp} />
        <MetricBadge label="PRICE / CALL" value={`${agent.pricing} ETH`} color="purple" icon={Shield} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Execution Panel */}
        <div className="lg:col-span-3 space-y-4">
          <GlassCard className="p-5" hover={false}>
            <h2 className="font-display font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
              <Zap size={18} className="text-electric-blue" />
              EXECUTION CONSOLE
            </h2>

            <div className="mb-4">
              <label className="text-xs font-mono text-text-muted tracking-widest uppercase block mb-2">
                TASK INPUT
              </label>
              <textarea
                value={task}
                onChange={e => setTask(e.target.value)}
                placeholder="Describe the task for this agent..."
                rows={4}
                className="w-full bg-black/30 border border-border rounded-lg px-4 py-3 text-text-primary font-body text-sm placeholder-text-muted resize-none focus:outline-none focus:border-electric-blue/60 transition-all"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs font-mono text-text-muted">
                COST: <span className="text-electric-blue font-bold">{agent.pricing} ETH</span>
              </div>
              <NeonButton
                variant="solid"
                icon={Send}
                onClick={handleExecute}
                loading={isExecuting}
                disabled={!isConnected || !task.trim()}
              >
                {isConnected ? 'EXECUTE AGENT' : 'CONNECT WALLET FIRST'}
              </NeonButton>
            </div>

            {executionResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-lg bg-cyber-green/5 border border-cyber-green/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={14} className="text-cyber-green" />
                  <span className="text-cyber-green text-xs font-mono">EXECUTION COMPLETE — {executionResult.latency}ms</span>
                </div>
                <pre className="text-text-secondary text-xs font-mono whitespace-pre-wrap leading-relaxed">
                  {executionResult.output}
                </pre>
              </motion.div>
            )}
          </GlassCard>

          {/* Terminal */}
          <TerminalBox logs={logs} title="EXECUTION LOG" />
        </div>

        {/* Right panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Capabilities */}
          <GlassCard className="p-5" hover={false}>
            <h3 className="font-mono text-xs tracking-widest text-text-muted uppercase mb-3">CAPABILITIES</h3>
            <div className="space-y-2">
              {['Natural Language Processing', 'Real-time Analysis', 'Multi-format Input', 'Streaming Output', 'Context Window 128K', 'Agent Composition'].map(cap => (
                <div key={cap} className="flex items-center gap-2 text-sm text-text-secondary">
                  <div className="w-1.5 h-1.5 rounded-full bg-electric-blue" />
                  {cap}
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Vote */}
          <GlassCard className="p-5" hover={false}>
            <h3 className="font-mono text-xs tracking-widest text-text-muted uppercase mb-4">VOTE ON AGENT</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setVoted('up')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-all font-mono text-sm ${
                  voted === 'up'
                    ? 'bg-cyber-green/20 border-cyber-green text-cyber-green'
                    : 'border-border text-text-muted hover:border-cyber-green/50 hover:text-cyber-green'
                }`}
              >
                <ThumbsUp size={16} /> UPVOTE
              </button>
              <button
                onClick={() => setVoted('down')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-all font-mono text-sm ${
                  voted === 'down'
                    ? 'bg-cyber-red/20 border-cyber-red text-cyber-red'
                    : 'border-border text-text-muted hover:border-cyber-red/50 hover:text-cyber-red'
                }`}
              >
                <ThumbsDown size={16} /> DOWNVOTE
              </button>
            </div>
          </GlassCard>

          {/* Performance stats */}
          <GlassCard className="p-5" hover={false}>
            <h3 className="font-mono text-xs tracking-widest text-text-muted uppercase mb-3">PERFORMANCE</h3>
            <div className="space-y-3">
              {[
                { label: 'Avg Latency', value: '234ms', bar: 80, color: 'bg-electric-blue' },
                { label: 'Uptime', value: '99.9%', bar: 99, color: 'bg-cyber-green' },
                { label: 'Error Rate', value: '0.3%', bar: 3, color: 'bg-cyber-red' },
              ].map(stat => (
                <div key={stat.label}>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-text-muted">{stat.label}</span>
                    <span className="text-text-secondary">{stat.value}</span>
                  </div>
                  <div className="h-1 bg-panel-light rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.bar}%` }}
                      transition={{ delay: 0.5, duration: 1 }}
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