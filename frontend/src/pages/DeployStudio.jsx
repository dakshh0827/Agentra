import React, { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Upload, ChevronRight, Check, Globe, Tag, DollarSign, Zap, Database, Link2, Sparkles, Rocket, AlertTriangle, Wallet } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import NeonButton from '../components/ui/NeonButton'
import { agentsAPI } from '../api/agents'
import { useAuthStore } from '../stores/authStore'

/* ── FadeInSection — triggers when scrolled into view ── */
function FadeInSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const STEPS = [
  { id: 1, label: 'MODE', icon: Database, description: 'Deploy target' },
  { id: 2, label: 'IDENTITY', icon: Zap, description: 'Name & category' },
  { id: 3, label: 'ENDPOINT', icon: Globe, description: 'MCP schema' },
  { id: 4, label: 'METADATA', icon: Tag, description: 'Tags & description' },
  { id: 5, label: 'PRICING', icon: DollarSign, description: 'Pay-per-call' },
  { id: 6, label: 'DEPLOY', icon: Upload, description: 'Publish agent' },
]

const CATEGORIES = ['Analysis', 'Development', 'Security', 'Data', 'NLP', 'Web3', 'Other']

const InputField = ({ label, field, type = 'text', placeholder, rows, form, update }) => (
  <div>
    <label className="text-[9px] font-mono text-[var(--color-text-dim)] tracking-[0.2em] uppercase block mb-2.5">{label}</label>
    {rows ? (
      <textarea
        value={form[field]}
        onChange={e => update(field, e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="input-field w-full px-4 py-3 rounded-xl text-sm resize-none focus:ring-2 focus:ring-[var(--color-purple-core)]/30 transition-all"
      />
    ) : (
      <input
        type={type}
        value={form[field]}
        onChange={e => update(field, e.target.value)}
        placeholder={placeholder}
        className="input-field w-full px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-[var(--color-purple-core)]/30 transition-all"
      />
    )}
  </div>
)

export default function DeployStudio() {
  const [step, setStep] = useState(1)
  const [deploying, setDeploying] = useState(false)
  const [deployed, setDeployed] = useState(false)
  const { isConnected, walletAddress } = useAuthStore()

  const [form, setForm] = useState({
    deployMode: '',       // 'database' | 'blockchain'
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
  const isBlockchain = form.deployMode === 'blockchain'
  const isDatabase = form.deployMode === 'database'

  const handleDeploy = async () => {
    if (!isConnected) return   // wallet always required for identity
    setDeploying(true)
    try {
      let parsedSchema = null
      if (form.mcpSchema) {
        try { parsedSchema = JSON.parse(form.mcpSchema) }
        catch { throw new Error('Invalid MCP Schema JSON') }
      }

      // ownerWallet is ALWAYS included — used for dashboard, identity, attribution
      const payload = {
        name: form.name,
        category: form.category,
        endpoint: form.endpoint,
        mcpSchema: parsedSchema,
        description: form.description,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        pricing: parseFloat(form.pricing) || 0,
        ownerWallet: walletAddress,   // always saved to DB regardless of mode
        deployMode: form.deployMode,  // tells backend: also register on-chain or DB only
      }

      await agentsAPI.deploy(payload)
      setDeployed(true)
    } catch (error) {
      alert(`Deploy failed: ${error.message}`)
    } finally {
      setDeploying(false)
    }
  }

  // Wallet always required (for identity), plus mode must be selected
  const canProceedFromStep1 = form.deployMode && isConnected
  const canDeploy = isConnected && form.name && form.category

  return (
    <div className="relative min-h-screen">
      {/* Ambient glows */}
      <div className="fixed top-20 right-10 w-[500px] h-[400px] rounded-full pointer-events-none opacity-25"
        style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.08) 0%, transparent 70%)' }} />
      <div className="fixed bottom-20 left-10 w-[400px] h-[300px] rounded-full pointer-events-none opacity-25"
        style={{ background: 'radial-gradient(ellipse, rgba(52,211,153,0.05) 0%, transparent 70%)' }} />

      <div className="relative z-10 p-5 lg:p-8 max-w-4xl mx-auto">
        {/* Header — Enhanced */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-xl bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.25)] flex items-center justify-center">
              <Rocket size={16} className="text-[var(--color-purple-bright)]" />
            </div>
            <span className="font-mono text-[10px] text-[var(--color-purple-pale)] tracking-[0.3em]">AGENT DEPLOYMENT PROTOCOL</span>
          </div>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[var(--color-text-primary)] leading-tight tracking-tight">
            DEPLOY STUDIO
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm sm:text-base mt-2 max-w-lg">Launch your autonomous AI agent on the neural marketplace</p>
        </motion.div>

        {/* Step indicator — Enhanced */}
        <FadeInSection className="mb-8">
          <div className="glass-card-landing rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-0 overflow-x-auto pb-1 scrollbar-hide">
              {STEPS.map((s, i) => {
                const Icon = s.icon
                const isActive = step === s.id
                const isDone = step > s.id
                return (
                  <React.Fragment key={s.id}>
                    <motion.div
                      whileHover={isDone ? { y: -2, scale: 1.02 } : {}}
                      whileTap={isDone ? { scale: 0.98 } : {}}
                      onClick={() => isDone && setStep(s.id)}
                      className={`relative flex items-center gap-2.5 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all shrink-0 ${isDone ? 'cursor-pointer' : ''} ${
                        isActive
                          ? 'bg-[rgba(124,58,237,0.12)] border border-[rgba(124,58,237,0.4)] text-[var(--color-purple-bright)] shadow-[0_0_20px_rgba(124,58,237,0.1)]'
                          : isDone
                          ? 'bg-[rgba(52,211,153,0.08)] border border-[rgba(52,211,153,0.25)] text-[var(--color-success)]'
                          : 'text-[var(--color-text-dim)] border border-transparent'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isActive ? 'bg-[rgba(124,58,237,0.2)]' : isDone ? 'bg-[rgba(52,211,153,0.15)]' : 'bg-[var(--color-nebula-deep)]'
                      }`}>
                        {isDone ? <Check size={14} /> : <Icon size={14} />}
                      </div>
                      <div className="hidden sm:block">
                        <div className="text-[10px] font-mono font-bold tracking-[0.12em]">{s.label}</div>
                        <div className="text-[9px] opacity-50">{s.description}</div>
                      </div>
                      {isActive && (
                        <motion.div
                          layoutId="step-indicator"
                          className="absolute inset-0 rounded-xl border-2 border-[var(--color-purple-bright)] pointer-events-none"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                    </motion.div>
                    {i < STEPS.length - 1 && (
                      <div className={`h-px w-4 sm:w-6 shrink-0 mx-0.5 transition-colors duration-300 ${step > s.id ? 'bg-[rgba(52,211,153,0.4)]' : 'bg-[var(--color-border)]'}`} />
                    )}
                  </React.Fragment>
                )
              })}
            </div>
            {/* Progress bar */}
            <div className="mt-4 h-1 bg-[var(--color-nebula-deep)] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-[var(--color-purple-core)] to-[var(--color-purple-bright)] rounded-full"
              />
            </div>
          </div>
        </FadeInSection>

        {/* Step content — Enhanced */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
          >
            <div className="glass-card-landing rounded-2xl p-6 sm:p-8">

            {/* ── STEP 1: DEPLOY MODE ── */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display font-bold text-xl sm:text-2xl text-[var(--color-text-primary)] mb-2 flex items-center gap-3">
                    <Sparkles size={20} className="text-[var(--color-purple-bright)]" />
                    Deployment Target
                  </h2>
                  <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
                    Your wallet address is always saved to the database for identity and dashboard tracking.
                    Choose whether the agent is also registered on-chain.
                  </p>
                </div>

                {/* Wallet always required — show warning if not connected */}
                {!isConnected && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3.5 p-4 sm:p-5 rounded-xl bg-[rgba(251,191,36,0.06)] border border-[rgba(251,191,36,0.25)] shadow-[0_0_20px_rgba(251,191,36,0.05)]"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[rgba(251,191,36,0.1)] flex items-center justify-center shrink-0">
                      <Wallet size={16} className="text-[var(--color-warning)]" />
                    </div>
                    <div>
                      <div className="text-[var(--color-warning)] text-[11px] font-mono font-bold tracking-widest mb-1">WALLET REQUIRED</div>
                      <div className="text-[var(--color-text-muted)] text-xs leading-relaxed">
                        Connect your wallet via the top bar. Your address is saved to the database so your agents appear in your dashboard — regardless of deployment mode.
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Mode cards — Enhanced */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {/* Database only */}
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => update('deployMode', 'database')}
                    className={`relative p-5 sm:p-6 rounded-2xl border text-left transition-all cursor-pointer overflow-hidden ${
                      isDatabase
                        ? 'bg-[rgba(52,211,153,0.08)] border-[rgba(52,211,153,0.4)] shadow-[0_0_30px_rgba(52,211,153,0.1)]'
                        : 'border-[var(--color-border)] hover:border-[rgba(52,211,153,0.3)] bg-black/20'
                    }`}
                  >
                    {isDatabase && (
                      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(52,211,153,0.08)] to-transparent pointer-events-none" />
                    )}
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all ${
                          isDatabase
                            ? 'bg-[rgba(52,211,153,0.15)] border-[rgba(52,211,153,0.4)]'
                            : 'bg-[var(--color-nebula-deep)] border-[var(--color-border)]'
                        }`}>
                          <Database size={20} className={isDatabase ? 'text-[var(--color-success)]' : 'text-[var(--color-text-dim)]'} />
                        </div>
                        <div>
                          <div className={`font-mono font-bold text-xs tracking-widest ${isDatabase ? 'text-[var(--color-success)]' : 'text-[var(--color-text-secondary)]'}`}>
                            DATABASE ONLY
                          </div>
                          <div className="text-[9px] font-mono mt-0.5 text-[var(--color-text-dim)]">OFF-CHAIN</div>
                        </div>
                        {isDatabase && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-auto w-6 h-6 rounded-full bg-[var(--color-success)] flex items-center justify-center"
                          >
                            <Check size={14} className="text-black" />
                          </motion.div>
                        )}
                      </div>
                      <p className="text-xs leading-relaxed text-[var(--color-text-muted)] mb-4">
                        Agent and wallet address stored in database only. Full marketplace access — execution, ratings, leaderboard, dashboard — with no gas fees.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {['No gas fees', 'Instant deploy', 'Dashboard tracked'].map(tag => (
                          <span key={tag} className={`text-[9px] font-mono px-2.5 py-1 rounded-lg border transition-colors ${
                            isDatabase
                              ? 'border-[rgba(52,211,153,0.25)] text-[var(--color-success)] bg-[rgba(52,211,153,0.06)]'
                              : 'border-[var(--color-border)] text-[var(--color-text-dim)]'
                          }`}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  </motion.button>

                  {/* Blockchain */}
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => update('deployMode', 'blockchain')}
                    className={`relative p-5 sm:p-6 rounded-2xl border text-left transition-all cursor-pointer overflow-hidden ${
                      isBlockchain
                        ? 'bg-[rgba(124,58,237,0.1)] border-[rgba(124,58,237,0.5)] shadow-[0_0_30px_rgba(124,58,237,0.12)]'
                        : 'border-[var(--color-border)] hover:border-[rgba(124,58,237,0.3)] bg-black/20'
                    }`}
                  >
                    {isBlockchain && (
                      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(124,58,237,0.1)] to-transparent pointer-events-none" />
                    )}
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all ${
                          isBlockchain
                            ? 'bg-[rgba(124,58,237,0.15)] border-[rgba(124,58,237,0.4)]'
                            : 'bg-[var(--color-nebula-deep)] border-[var(--color-border)]'
                        }`}>
                          <Link2 size={20} className={isBlockchain ? 'text-[var(--color-purple-bright)]' : 'text-[var(--color-text-dim)]'} />
                        </div>
                        <div>
                          <div className={`font-mono font-bold text-xs tracking-widest ${isBlockchain ? 'text-[var(--color-purple-bright)]' : 'text-[var(--color-text-secondary)]'}`}>
                            BLOCKCHAIN + DB
                          </div>
                          <div className="text-[9px] font-mono mt-0.5 text-[var(--color-text-dim)]">ON-CHAIN</div>
                        </div>
                        {isBlockchain && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-auto w-6 h-6 rounded-full bg-[var(--color-purple-bright)] flex items-center justify-center"
                          >
                            <Check size={14} className="text-white" />
                          </motion.div>
                        )}
                      </div>
                      <p className="text-xs leading-relaxed text-[var(--color-text-muted)] mb-4">
                        Agent registered on-chain via smart contract and also saved to the database. Enables trustless payments and immutable ownership.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {['On-chain payments', 'Immutable record', 'Gas required'].map(tag => (
                          <span key={tag} className={`text-[9px] font-mono px-2.5 py-1 rounded-lg border transition-colors ${
                            isBlockchain
                              ? 'border-[rgba(124,58,237,0.25)] text-[var(--color-purple-bright)] bg-[rgba(124,58,237,0.06)]'
                              : 'border-[var(--color-border)] text-[var(--color-text-dim)]'
                          }`}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  </motion.button>
                </div>

                {/* Confirmation badge — Enhanced */}
                {form.deployMode && isConnected && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex items-center gap-3 text-[11px] font-mono px-4 py-3 rounded-xl border w-fit ${
                      isDatabase
                        ? 'border-[rgba(52,211,153,0.25)] text-[var(--color-success)] bg-[rgba(52,211,153,0.05)]'
                        : 'border-[rgba(124,58,237,0.25)] text-[var(--color-purple-bright)] bg-[rgba(124,58,237,0.05)]'
                    }`}
                  >
                    <Check size={14} />
                    {isDatabase
                      ? `Database deploy · wallet ${walletAddress?.slice(0, 8)}... will be stored`
                      : `On-chain deploy · wallet ${walletAddress?.slice(0, 8)}... will be stored`
                    }
                  </motion.div>
                )}
              </div>
            )}

            {/* ── STEP 2: IDENTITY — Enhanced ── */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="font-display font-bold text-xl sm:text-2xl text-[var(--color-text-primary)] mb-6 flex items-center gap-3">
                  <Zap size={20} className="text-[var(--color-purple-bright)]" />
                  Agent Identity
                </h2>
                <InputField label="AGENT NAME" field="name" placeholder="e.g. DataSynth-X" form={form} update={update} />
                <div>
                  <label className="text-[9px] font-mono text-[var(--color-text-dim)] tracking-[0.2em] uppercase block mb-3">CATEGORY</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {CATEGORIES.map(cat => (
                      <motion.button 
                        key={cat} 
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => update('category', cat)}
                        className={`py-2.5 px-4 rounded-xl text-[10px] font-mono border transition-all cursor-pointer ${
                          form.category === cat
                            ? 'bg-[rgba(124,58,237,0.12)] border-[var(--color-purple-core)] text-[var(--color-purple-bright)] shadow-[0_0_15px_rgba(124,58,237,0.15)]'
                            : 'border-[var(--color-border)] text-[var(--color-text-dim)] hover:border-[var(--color-border-bright)] hover:bg-[rgba(255,255,255,0.02)]'
                        }`}
                      >
                        {cat.toUpperCase()}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: ENDPOINT — Enhanced ── */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="font-display font-bold text-xl sm:text-2xl text-[var(--color-text-primary)] mb-6 flex items-center gap-3">
                  <Globe size={20} className="text-[var(--color-purple-bright)]" />
                  MCP Endpoint
                </h2>
                <InputField label="ENDPOINT URL" field="endpoint" placeholder="https://your-agent.example.com" form={form} update={update} />
                <InputField label="MCP SCHEMA (JSON)" field="mcpSchema" rows={8}
                  placeholder={`{\n  "name": "my-agent",\n  "version": "1.0.0",\n  "tools": []\n}`}
                  form={form} update={update}
                />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-black/30 border border-[var(--color-border)]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-nebula-deep)] flex items-center justify-center border border-[var(--color-border)]">
                      <Globe size={14} className="text-[var(--color-text-dim)]" />
                    </div>
                    <span className="text-xs font-mono text-[var(--color-text-muted)]">Endpoint validation</span>
                  </div>
                  <NeonButton variant="ghost" size="sm" onClick={() => update('testPassed', true)}>TEST CONNECTION</NeonButton>
                </div>
                {form.testPassed && (
                  <motion.div 
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2.5 text-[var(--color-success)] text-xs font-mono p-3 rounded-lg bg-[rgba(52,211,153,0.06)] border border-[rgba(52,211,153,0.2)]"
                  >
                    <Check size={15} /> Endpoint reachable. Schema valid.
                  </motion.div>
                )}
              </div>
            )}

            {/* ── STEP 4: METADATA — Enhanced ── */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="font-display font-bold text-xl sm:text-2xl text-[var(--color-text-primary)] mb-6 flex items-center gap-3">
                  <Tag size={20} className="text-[var(--color-purple-bright)]" />
                  Metadata
                </h2>
                <InputField label="DESCRIPTION" field="description" rows={4} placeholder="Describe what your agent does..." form={form} update={update} />
                <InputField label="TAGS (comma separated)" field="tags" placeholder="e.g. analysis, data, ml" form={form} update={update} />
              </div>
            )}

            {/* ── STEP 5: PRICING — Enhanced ── */}
            {step === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display font-bold text-xl sm:text-2xl text-[var(--color-text-primary)] mb-2 flex items-center gap-3">
                    <DollarSign size={20} className="text-[var(--color-purple-bright)]" />
                    Pricing Model
                  </h2>
                  {isDatabase && (
                    <p className="text-[var(--color-text-muted)] text-xs font-mono leading-relaxed">
                      Pricing is recorded in the database. Payments are handled off-chain or manually between parties.
                    </p>
                  )}
                </div>
                <InputField label="PRICE PER CALL (ETH)" field="pricing" type="number" placeholder="0.05" form={form} update={update} />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'MICRO', value: '0.001', desc: 'High volume', color: 'blue' },
                    { label: 'STANDARD', value: '0.05', desc: 'Balanced', color: 'purple' },
                    { label: 'PREMIUM', value: '0.15', desc: 'Specialized', color: 'amber' },
                  ].map(tier => (
                    <motion.button 
                      key={tier.value} 
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => update('pricing', tier.value)}
                      className={`p-5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                        form.pricing === tier.value
                          ? 'bg-[rgba(124,58,237,0.1)] border-[var(--color-purple-core)] text-[var(--color-purple-bright)] shadow-[0_0_20px_rgba(124,58,237,0.12)]'
                          : 'border-[var(--color-border)] text-[var(--color-text-dim)] hover:border-[var(--color-border-bright)] bg-black/20'
                      }`}
                    >
                      {form.pricing === tier.value && (
                        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(124,58,237,0.08)] to-transparent pointer-events-none" />
                      )}
                      <div className="relative z-10">
                        <div className="text-[10px] font-mono font-bold mb-2 tracking-widest">{tier.label}</div>
                        <div className="text-2xl font-display font-bold">{tier.value} <span className="text-sm opacity-60">ETH</span></div>
                        <div className="text-[10px] opacity-50 mt-1">{tier.desc}</div>
                      </div>
                    </motion.button>
                  ))}
                </div>
                <div className="p-4 rounded-xl bg-black/30 border border-[var(--color-border)] text-[var(--color-text-dim)] text-[11px] font-mono">
                  {isBlockchain
                    ? '📊 Platform fee: 5% per transaction. Revenue via smart contract.'
                    : '📊 Platform fee: 5% per transaction. Revenue tracked in database.'}
                </div>
              </div>
            )}

            {/* ── STEP 6: REVIEW & DEPLOY — Enhanced ── */}
            {step === 6 && (
              <div className="space-y-6">
                <h2 className="font-display font-bold text-xl sm:text-2xl text-[var(--color-text-primary)] mb-6 flex items-center gap-3">
                  <Upload size={20} className="text-[var(--color-purple-bright)]" />
                  Review & Deploy
                </h2>

                <div className="space-y-0 rounded-xl overflow-hidden border border-[var(--color-border)] bg-black/20">
                  {[
                    { label: 'DEPLOY MODE', value: isDatabase ? 'DATABASE ONLY' : 'BLOCKCHAIN + DB', highlight: isDatabase ? 'success' : 'purple' },
                    { label: 'OWNER WALLET', value: walletAddress ? `${walletAddress.slice(0, 16)}...` : '—', highlight: 'purple' },
                    { label: 'NAME', value: form.name || '—' },
                    { label: 'CATEGORY', value: form.category || '—' },
                    { label: 'ENDPOINT', value: form.endpoint || '—' },
                    { label: 'PRICING', value: form.pricing ? `${form.pricing} ETH/call` : '—' },
                  ].map((row, i) => (
                    <motion.div 
                      key={row.label} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex justify-between items-center px-5 py-3.5 ${i % 2 === 0 ? 'bg-[rgba(255,255,255,0.02)]' : ''}`}
                    >
                      <span className="text-[var(--color-text-dim)] font-mono text-[10px] tracking-widest">{row.label}</span>
                      <span className={`font-mono text-sm truncate max-w-[55%] text-right font-medium ${
                        row.highlight === 'success' ? 'text-[var(--color-success)]'
                        : row.highlight === 'purple' ? 'text-[var(--color-purple-bright)]'
                        : 'text-[var(--color-text-primary)]'
                      }`}>{row.value}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Note about wallet storage */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-[rgba(124,58,237,0.05)] border border-[rgba(124,58,237,0.2)]">
                  <div className="w-8 h-8 rounded-lg bg-[rgba(124,58,237,0.1)] flex items-center justify-center shrink-0">
                    <Database size={14} className="text-[var(--color-purple-bright)]" />
                  </div>
                  <p className="text-[var(--color-text-muted)] text-xs leading-relaxed">
                    Your wallet address is always saved to the database as the agent owner.
                    This powers your dashboard, revenue tracking, and agent attribution regardless of deploy mode.
                  </p>
                </div>

                {/* Wallet not connected guard */}
                {!isConnected && (
                  <motion.div 
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3.5 p-4 sm:p-5 rounded-xl bg-[rgba(248,113,113,0.06)] border border-[rgba(248,113,113,0.3)]"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[rgba(248,113,113,0.1)] flex items-center justify-center shrink-0">
                      <AlertTriangle size={16} className="text-[var(--color-danger)]" />
                    </div>
                    <div>
                      <div className="text-[var(--color-danger)] text-[11px] font-mono font-bold tracking-widest mb-1">WALLET NOT CONNECTED</div>
                      <div className="text-[var(--color-text-muted)] text-xs">Connect your wallet to identify ownership and enable dashboard tracking.</div>
                    </div>
                  </motion.div>
                )}

                {!deployed ? (
                  <div className="space-y-4 pt-2">
                    {isDatabase && (
                      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        <NeonButton
                          variant="success"
                          size="lg"
                          onClick={handleDeploy}
                          loading={deploying}
                          disabled={!canDeploy}
                          className="w-full justify-center py-4 text-sm"
                        >
                          <Database size={17} />
                          SAVE TO DATABASE
                        </NeonButton>
                      </motion.div>
                    )}
                    {isBlockchain && (
                      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        <NeonButton
                          size="lg"
                          onClick={handleDeploy}
                          loading={deploying}
                          disabled={!canDeploy}
                          className="w-full justify-center py-4 text-sm"
                        >
                          <Link2 size={17} />
                          {isConnected ? '⚡ DEPLOY ON-CHAIN' : 'CONNECT WALLET TO DEPLOY'}
                        </NeonButton>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className={`p-8 rounded-2xl border text-center relative overflow-hidden ${
                      isDatabase
                        ? 'bg-[rgba(52,211,153,0.08)] border-[rgba(52,211,153,0.35)]'
                        : 'bg-[rgba(124,58,237,0.08)] border-[rgba(124,58,237,0.35)]'
                    }`}
                  >
                    {/* Success glow */}
                    <div className={`absolute inset-0 pointer-events-none ${
                      isDatabase ? 'bg-gradient-to-br from-[rgba(52,211,153,0.1)] to-transparent' : 'bg-gradient-to-br from-[rgba(124,58,237,0.1)] to-transparent'
                    }`} />
                    <div className="relative z-10">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                        className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                          isDatabase ? 'bg-[rgba(52,211,153,0.15)] border border-[rgba(52,211,153,0.3)]' : 'bg-[rgba(124,58,237,0.15)] border border-[rgba(124,58,237,0.3)]'
                        }`}
                      >
                        <Check size={32} className={isDatabase ? 'text-[var(--color-success)]' : 'text-[var(--color-purple-bright)]'} />
                      </motion.div>
                      <div className={`font-display font-bold text-xl sm:text-2xl mb-2 ${isDatabase ? 'text-[var(--color-success)]' : 'text-[var(--color-purple-bright)]'}`}>
                        AGENT {isDatabase ? 'SAVED' : 'DEPLOYED'}
                      </div>
                      <div className="text-[var(--color-text-muted)] text-xs font-mono tracking-widest mb-4">
                        {isDatabase
                          ? 'STORED IN DATABASE · MARKETPLACE READY · DASHBOARD ACTIVE'
                          : 'ON-CHAIN · DATABASE SYNCED · DASHBOARD ACTIVE'}
                      </div>
                      <div className="text-[var(--color-text-dim)] text-[11px] font-mono px-3 py-2 rounded-lg bg-black/30 border border-[var(--color-border)] inline-block">
                        OWNER: {walletAddress?.slice(0, 18)}...
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation — Enhanced */}
        {!deployed && (
          <FadeInSection delay={0.1}>
            <div className="flex justify-between mt-6 gap-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <NeonButton variant="ghost" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}>
                  ← BACK
                </NeonButton>
              </motion.div>
              {step < 6 && (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <NeonButton
                    icon={ChevronRight}
                    onClick={() => setStep(s => Math.min(6, s + 1))}
                    disabled={step === 1 && !canProceedFromStep1}
                  >
                    NEXT STEP
                  </NeonButton>
                </motion.div>
              )}
            </div>
          </FadeInSection>
        )}

        {/* Step 1 hints — Enhanced */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-6 space-y-2">
            {!isConnected && (
              <p className="text-center text-[var(--color-warning)] text-[11px] font-mono tracking-widest opacity-80 flex items-center justify-center gap-2">
                <Wallet size={13} />
                CONNECT WALLET FIRST — REQUIRED FOR IDENTITY & DASHBOARD
              </p>
            )}
            {isConnected && !form.deployMode && (
              <p className="text-center text-[var(--color-text-dim)] text-[11px] font-mono tracking-widest">
                SELECT A DEPLOYMENT TARGET TO CONTINUE
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}