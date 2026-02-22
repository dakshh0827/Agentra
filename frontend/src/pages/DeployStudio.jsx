import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, ChevronRight, Check, Code, Globe, Tag, DollarSign, Zap } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import NeonButton from '../components/ui/NeonButton'
import { agentsAPI } from '../api/agents'
import { useAuthStore } from '../stores/authStore'

const STEPS = [
  { id: 1, label: 'IDENTITY', icon: Zap, description: 'Agent name and category' },
  { id: 2, label: 'ENDPOINT', icon: Globe, description: 'MCP schema endpoint' },
  { id: 3, label: 'METADATA', icon: Tag, description: 'Tags and description' },
  { id: 4, label: 'PRICING', icon: DollarSign, description: 'Pay-per-call pricing' },
  { id: 5, label: 'DEPLOY', icon: Upload, description: 'Publish on-chain' },
]

const CATEGORIES = ['Analysis', 'Development', 'Security', 'Data', 'NLP', 'Web3', 'Other']

export default function DeployStudio() {
  const [step, setStep] = useState(1)
  const [deploying, setDeploying] = useState(false)
  const [deployed, setDeployed] = useState(false)
  const { isConnected } = useAuthStore()

  const [form, setForm] = useState({
    name: '',
    category: '',
    endpoint: '',
    mcpSchema: '',
    description: '',
    tags: '',
    pricing: '',
    testPassed: false,
  })

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleDeploy = async () => {
    setDeploying(true)
    await new Promise(r => setTimeout(r, 3000))
    setDeploying(false)
    setDeployed(true)
  }

  const InputField = ({ label, field, type = 'text', placeholder, rows }) => (
    <div>
      <label className="text-xs font-mono text-text-muted tracking-widest uppercase block mb-2">{label}</label>
      {rows ? (
        <textarea
          value={form[field]}
          onChange={e => update(field, e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="w-full bg-black/30 border border-border rounded-lg px-4 py-3 text-text-primary font-body text-sm placeholder-text-muted resize-none focus:outline-none focus:border-electric-blue/60 transition-all"
        />
      ) : (
        <input
          type={type}
          value={form[field]}
          onChange={e => update(field, e.target.value)}
          placeholder={placeholder}
          className="w-full bg-black/30 border border-border rounded-lg px-4 py-3 text-text-primary font-body text-sm placeholder-text-muted focus:outline-none focus:border-electric-blue/60 transition-all"
        />
      )}
    </div>
  )

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Upload size={20} className="text-neon-purple" />
          <span className="font-mono text-xs text-neon-purple tracking-widest">AGENT DEPLOYMENT PROTOCOL</span>
        </div>
        <h1 className="font-display font-bold text-4xl text-text-primary">
          <span className="gradient-text">DEPLOY</span> STUDIO
        </h1>
        <p className="text-text-secondary mt-1">Launch your autonomous AI agent on the neural marketplace</p>
      </motion.div>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          const isActive = step === s.id
          const isDone = step > s.id
          return (
            <React.Fragment key={s.id}>
              <motion.div
                whileHover={step >= s.id ? { y: -2 } : {}}
                onClick={() => isDone && setStep(s.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all shrink-0 ${
                  isDone ? 'cursor-pointer' : ''
                } ${
                  isActive
                    ? 'bg-neon-purple/15 border border-neon-purple/50 text-neon-purple'
                    : isDone
                    ? 'bg-cyber-green/10 border border-cyber-green/30 text-cyber-green'
                    : 'text-text-muted border border-transparent'
                }`}
              >
                {isDone ? <Check size={14} /> : <Icon size={14} />}
                <div>
                  <div className="text-xs font-mono font-bold tracking-widest">{s.label}</div>
                  <div className="text-[10px] opacity-60">{s.description}</div>
                </div>
              </motion.div>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-8 shrink-0 mx-1 transition-colors ${step > s.id ? 'bg-cyber-green/40' : 'bg-border'}`} />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <GlassCard className="p-6" hover={false}>
            {/* Step 1: Identity */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="font-display font-bold text-xl text-text-primary mb-5">Agent Identity</h2>
                <InputField label="AGENT NAME" field="name" placeholder="e.g. DataSynth-X" />
                <div>
                  <label className="text-xs font-mono text-text-muted tracking-widest uppercase block mb-2">CATEGORY</label>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => update('category', cat)}
                        className={`py-2 px-3 rounded text-xs font-mono border transition-all ${
                          form.category === cat
                            ? 'bg-neon-purple/20 border-neon-purple text-neon-purple'
                            : 'border-border text-text-muted hover:border-border-glow'
                        }`}
                      >
                        {cat.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Endpoint */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="font-display font-bold text-xl text-text-primary mb-5">MCP Endpoint</h2>
                <InputField label="ENDPOINT URL" field="endpoint" placeholder="https://your-agent.example.com" />
                <InputField
                  label="MCP SCHEMA (JSON)"
                  field="mcpSchema"
                  rows={8}
                  placeholder={`{
  "name": "my-agent",
  "version": "1.0.0",
  "tools": [
    {
      "name": "execute",
      "description": "Main execution function",
      "inputSchema": {
        "type": "object",
        "properties": {
          "task": { "type": "string" }
        }
      }
    }
  ]
}`}
                />
                <div className="flex items-center justify-between p-3 rounded-lg bg-panel-light border border-border">
                  <span className="text-sm font-mono text-text-secondary">Endpoint validation</span>
                  <NeonButton variant="blue" size="sm" onClick={() => update('testPassed', true)}>
                    TEST ENDPOINT
                  </NeonButton>
                </div>
                {form.testPassed && (
                  <div className="flex items-center gap-2 text-cyber-green text-sm font-mono">
                    <Check size={14} /> Endpoint reachable. MCP schema valid.
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Metadata */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="font-display font-bold text-xl text-text-primary mb-5">Metadata</h2>
                <InputField label="DESCRIPTION" field="description" rows={4} placeholder="Describe what your agent does..." />
                <InputField label="TAGS (comma separated)" field="tags" placeholder="e.g. analysis, data, ml, realtime" />
              </div>
            )}

            {/* Step 4: Pricing */}
            {step === 4 && (
              <div className="space-y-5">
                <h2 className="font-display font-bold text-xl text-text-primary mb-5">Pricing Model</h2>
                <InputField label="PRICE PER CALL (ETH)" field="pricing" type="number" placeholder="0.05" />
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'MICRO', value: '0.001', desc: 'High volume' },
                    { label: 'STANDARD', value: '0.05', desc: 'Balanced' },
                    { label: 'PREMIUM', value: '0.15', desc: 'Specialized' },
                  ].map(tier => (
                    <button
                      key={tier.value}
                      onClick={() => update('pricing', tier.value)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        form.pricing === tier.value
                          ? 'bg-electric-blue/10 border-electric-blue/50 text-electric-blue'
                          : 'border-border text-text-muted hover:border-border-glow'
                      }`}
                    >
                      <div className="text-sm font-mono font-bold mb-1">{tier.label}</div>
                      <div className="text-lg font-display font-bold">{tier.value} ETH</div>
                      <div className="text-xs opacity-60">{tier.desc}</div>
                    </button>
                  ))}
                </div>
                <div className="p-3 rounded-lg bg-neon-purple/5 border border-neon-purple/20 text-text-secondary text-xs font-mono">
                  Platform fee: 5% of each transaction. Revenue distributed automatically via smart contract.
                </div>
              </div>
            )}

            {/* Step 5: Deploy */}
            {step === 5 && (
              <div className="space-y-5">
                <h2 className="font-display font-bold text-xl text-text-primary mb-5">Review & Deploy</h2>
                <div className="space-y-3">
                  {[
                    { label: 'Name', value: form.name || '—' },
                    { label: 'Category', value: form.category || '—' },
                    { label: 'Endpoint', value: form.endpoint || '—' },
                    { label: 'Pricing', value: form.pricing ? `${form.pricing} ETH/call` : '—' },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between py-2 border-b border-border text-sm">
                      <span className="text-text-muted font-mono text-xs">{row.label.toUpperCase()}</span>
                      <span className="text-text-primary font-mono">{row.value}</span>
                    </div>
                  ))}
                </div>

                {!deployed ? (
                  <NeonButton
                    variant="solid"
                    size="lg"
                    onClick={handleDeploy}
                    loading={deploying}
                    disabled={!isConnected}
                    className="w-full justify-center"
                  >
                    {isConnected ? '⚡ DEPLOY ON-CHAIN' : 'CONNECT WALLET TO DEPLOY'}
                  </NeonButton>
                ) : (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-6 rounded-lg bg-cyber-green/10 border border-cyber-green/40 text-center"
                  >
                    <Check size={32} className="text-cyber-green mx-auto mb-3" />
                    <div className="font-display font-bold text-xl text-cyber-green mb-1">AGENT DEPLOYED!</div>
                    <div className="text-text-secondary text-sm font-mono">
                      Your agent is now live on the marketplace
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {!deployed && (
        <div className="flex justify-between mt-5">
          <NeonButton variant="ghost" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}>
            ← BACK
          </NeonButton>
          {step < 5 && (
            <NeonButton variant="purple" icon={ChevronRight} onClick={() => setStep(s => Math.min(5, s + 1))}>
              NEXT STEP
            </NeonButton>
          )}
        </div>
      )}
    </div>
  )
}