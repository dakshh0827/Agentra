import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, ChevronRight, Check, Globe, Tag, DollarSign, Zap, Database, Link2 } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import NeonButton from '../components/ui/NeonButton'
import { agentsAPI } from '../api/agents'
import { useAuthStore } from '../stores/authStore'

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
    <label className="text-[9px] font-mono text-[var(--color-text-dim)] tracking-[0.2em] uppercase block mb-2">{label}</label>
    {rows ? (
      <textarea
        value={form[field]}
        onChange={e => update(field, e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="input-field w-full px-4 py-3 rounded-lg text-sm resize-none"
      />
    ) : (
      <input
        type={type}
        value={form[field]}
        onChange={e => update(field, e.target.value)}
        placeholder={placeholder}
        className="input-field w-full px-4 py-3 rounded-lg text-sm"
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
    <div className="p-5 lg:p-7 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-7">
        <div className="flex items-center gap-2 mb-2">
          <Upload size={14} className="text-[var(--color-purple-pale)]" />
          <span className="font-mono text-[10px] text-[var(--color-purple-pale)] tracking-[0.3em]">AGENT DEPLOYMENT PROTOCOL</span>
        </div>
        <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-[var(--color-text-primary)] leading-tight">DEPLOY STUDIO</h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-1.5">Launch your autonomous AI agent on the neural marketplace</p>
      </motion.div>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-7 overflow-x-auto pb-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          const isActive = step === s.id
          const isDone = step > s.id
          return (
            <React.Fragment key={s.id}>
              <motion.div
                whileHover={isDone ? { y: -1 } : {}}
                onClick={() => isDone && setStep(s.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all shrink-0 ${isDone ? 'cursor-pointer' : ''} ${
                  isActive
                    ? 'bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.4)] text-[var(--color-purple-bright)]'
                    : isDone
                    ? 'bg-[rgba(52,211,153,0.07)] border border-[rgba(52,211,153,0.25)] text-[var(--color-success)]'
                    : 'text-[var(--color-text-dim)] border border-transparent'
                }`}
              >
                {isDone ? <Check size={12} /> : <Icon size={12} />}
                <div className="hidden sm:block">
                  <div className="text-[10px] font-mono font-bold tracking-[0.12em]">{s.label}</div>
                  <div className="text-[9px] opacity-50">{s.description}</div>
                </div>
              </motion.div>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-4 shrink-0 mx-0.5 transition-colors ${step > s.id ? 'bg-[rgba(52,211,153,0.3)]' : 'bg-[var(--color-border)]'}`} />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.18 }}
        >
          <GlassCard className="p-6" hover={false}>

            {/* ── STEP 1: DEPLOY MODE ── */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-display font-bold text-lg text-[var(--color-text-primary)] mb-1">Deployment Target</h2>
                  <p className="text-[var(--color-text-muted)] text-xs mb-1">
                    Your wallet address is always saved to the database for identity and dashboard tracking.
                    Choose whether the agent is also registered on-chain.
                  </p>
                </div>

                {/* Wallet always required — show warning if not connected */}
                {!isConnected && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 p-3.5 rounded-lg bg-[rgba(251,191,36,0.05)] border border-[rgba(251,191,36,0.2)]"
                  >
                    <span className="text-[var(--color-warning)] mt-0.5">⚠</span>
                    <div>
                      <div className="text-[var(--color-warning)] text-[10px] font-mono font-bold tracking-widest mb-0.5">WALLET REQUIRED</div>
                      <div className="text-[var(--color-text-muted)] text-[11px]">
                        Connect your wallet via the top bar. Your address is saved to the database so your agents appear in your dashboard — regardless of deployment mode.
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Mode cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Database only */}
                  <button
                    onClick={() => update('deployMode', 'database')}
                    className={`p-5 rounded-xl border text-left transition-all cursor-pointer ${
                      isDatabase
                        ? 'bg-[rgba(52,211,153,0.06)] border-[rgba(52,211,153,0.35)]'
                        : 'border-[var(--color-border)] hover:border-[var(--color-border-bright)]'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
                        isDatabase
                          ? 'bg-[rgba(52,211,153,0.1)] border-[rgba(52,211,153,0.3)]'
                          : 'bg-[var(--color-nebula-deep)] border-[var(--color-border)]'
                      }`}>
                        <Database size={16} className={isDatabase ? 'text-[var(--color-success)]' : 'text-[var(--color-text-dim)]'} />
                      </div>
                      <div>
                        <div className={`font-mono font-bold text-[11px] tracking-widest ${isDatabase ? 'text-[var(--color-success)]' : 'text-[var(--color-text-secondary)]'}`}>
                          DATABASE ONLY
                        </div>
                        <div className="text-[9px] font-mono mt-0.5 text-[var(--color-text-dim)]">OFF-CHAIN</div>
                      </div>
                      {isDatabase && <Check size={14} className="ml-auto text-[var(--color-success)]" />}
                    </div>
                    <p className="text-[11px] leading-relaxed text-[var(--color-text-muted)]">
                      Agent and wallet address stored in database only. Full marketplace access — execution, ratings, leaderboard, dashboard — with no gas fees or on-chain transaction.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {['No gas fees', 'Instant deploy', 'Dashboard tracked', 'Full marketplace'].map(tag => (
                        <span key={tag} className={`text-[9px] font-mono px-2 py-0.5 rounded border ${
                          isDatabase
                            ? 'border-[rgba(52,211,153,0.2)] text-[var(--color-success)]'
                            : 'border-[var(--color-border)] text-[var(--color-text-dim)]'
                        }`}>{tag}</span>
                      ))}
                    </div>
                  </button>

                  {/* Blockchain */}
                  <button
                    onClick={() => update('deployMode', 'blockchain')}
                    className={`p-5 rounded-xl border text-left transition-all cursor-pointer ${
                      isBlockchain
                        ? 'bg-[rgba(124,58,237,0.08)] border-[rgba(124,58,237,0.4)]'
                        : 'border-[var(--color-border)] hover:border-[var(--color-border-bright)]'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
                        isBlockchain
                          ? 'bg-[rgba(124,58,237,0.1)] border-[rgba(124,58,237,0.3)]'
                          : 'bg-[var(--color-nebula-deep)] border-[var(--color-border)]'
                      }`}>
                        <Link2 size={16} className={isBlockchain ? 'text-[var(--color-purple-bright)]' : 'text-[var(--color-text-dim)]'} />
                      </div>
                      <div>
                        <div className={`font-mono font-bold text-[11px] tracking-widest ${isBlockchain ? 'text-[var(--color-purple-bright)]' : 'text-[var(--color-text-secondary)]'}`}>
                          BLOCKCHAIN + DB
                        </div>
                        <div className="text-[9px] font-mono mt-0.5 text-[var(--color-text-dim)]">ON-CHAIN</div>
                      </div>
                      {isBlockchain && <Check size={14} className="ml-auto text-[var(--color-purple-bright)]" />}
                    </div>
                    <p className="text-[11px] leading-relaxed text-[var(--color-text-muted)]">
                      Agent registered on-chain via smart contract and also saved to the database. Enables trustless payments, immutable ownership, and on-chain revenue tracking.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {['On-chain payments', 'Immutable record', 'Dashboard tracked', 'Gas required'].map(tag => (
                        <span key={tag} className={`text-[9px] font-mono px-2 py-0.5 rounded border ${
                          isBlockchain
                            ? 'border-[rgba(124,58,237,0.2)] text-[var(--color-purple-bright)]'
                            : 'border-[var(--color-border)] text-[var(--color-text-dim)]'
                        }`}>{tag}</span>
                      ))}
                    </div>
                  </button>
                </div>

                {/* Confirmation badge */}
                {form.deployMode && isConnected && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-2 text-[10px] font-mono px-3 py-2 rounded-lg border w-fit ${
                      isDatabase
                        ? 'border-[rgba(52,211,153,0.2)] text-[var(--color-success)] bg-[rgba(52,211,153,0.04)]'
                        : 'border-[rgba(124,58,237,0.2)] text-[var(--color-purple-bright)] bg-[rgba(124,58,237,0.04)]'
                    }`}
                  >
                    <Check size={11} />
                    {isDatabase
                      ? `Database deploy · wallet ${walletAddress?.slice(0, 8)}... will be stored`
                      : `On-chain deploy · wallet ${walletAddress?.slice(0, 8)}... will be stored`
                    }
                  </motion.div>
                )}
              </div>
            )}

            {/* ── STEP 2: IDENTITY ── */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="font-display font-bold text-lg text-[var(--color-text-primary)] mb-5">Agent Identity</h2>
                <InputField label="AGENT NAME" field="name" placeholder="e.g. DataSynth-X" form={form} update={update} />
                <div>
                  <label className="text-[9px] font-mono text-[var(--color-text-dim)] tracking-[0.2em] uppercase block mb-2">CATEGORY</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {CATEGORIES.map(cat => (
                      <button key={cat} onClick={() => update('category', cat)}
                        className={`py-2 px-3 rounded-lg text-[10px] font-mono border transition-all cursor-pointer ${
                          form.category === cat
                            ? 'bg-[var(--color-nebula)] border-[var(--color-purple-core)] text-[var(--color-purple-bright)]'
                            : 'border-[var(--color-border)] text-[var(--color-text-dim)] hover:border-[var(--color-border-bright)]'
                        }`}
                      >
                        {cat.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: ENDPOINT ── */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="font-display font-bold text-lg text-[var(--color-text-primary)] mb-5">MCP Endpoint</h2>
                <InputField label="ENDPOINT URL" field="endpoint" placeholder="https://your-agent.example.com" form={form} update={update} />
                <InputField label="MCP SCHEMA (JSON)" field="mcpSchema" rows={8}
                  placeholder={`{\n  "name": "my-agent",\n  "version": "1.0.0",\n  "tools": []\n}`}
                  form={form} update={update}
                />
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-nebula-deep)] border border-[var(--color-border)]">
                  <span className="text-xs font-mono text-[var(--color-text-muted)]">Endpoint validation</span>
                  <NeonButton variant="ghost" size="sm" onClick={() => update('testPassed', true)}>TEST</NeonButton>
                </div>
                {form.testPassed && (
                  <div className="flex items-center gap-2 text-[var(--color-success)] text-xs font-mono">
                    <Check size={13} /> Endpoint reachable. Schema valid.
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 4: METADATA ── */}
            {step === 4 && (
              <div className="space-y-5">
                <h2 className="font-display font-bold text-lg text-[var(--color-text-primary)] mb-5">Metadata</h2>
                <InputField label="DESCRIPTION" field="description" rows={4} placeholder="Describe what your agent does..." form={form} update={update} />
                <InputField label="TAGS (comma separated)" field="tags" placeholder="e.g. analysis, data, ml" form={form} update={update} />
              </div>
            )}

            {/* ── STEP 5: PRICING ── */}
            {step === 5 && (
              <div className="space-y-5">
                <h2 className="font-display font-bold text-lg text-[var(--color-text-primary)] mb-1">Pricing Model</h2>
                {isDatabase && (
                  <p className="text-[var(--color-text-muted)] text-[11px] font-mono">
                    Pricing is recorded in the database. Payments are handled off-chain or manually between parties.
                  </p>
                )}
                <InputField label="PRICE PER CALL (ETH)" field="pricing" type="number" placeholder="0.05" form={form} update={update} />
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'MICRO', value: '0.001', desc: 'High volume' },
                    { label: 'STANDARD', value: '0.05', desc: 'Balanced' },
                    { label: 'PREMIUM', value: '0.15', desc: 'Specialized' },
                  ].map(tier => (
                    <button key={tier.value} onClick={() => update('pricing', tier.value)}
                      className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
                        form.pricing === tier.value
                          ? 'bg-[var(--color-nebula)] border-[var(--color-purple-core)] text-[var(--color-purple-bright)]'
                          : 'border-[var(--color-border)] text-[var(--color-text-dim)] hover:border-[var(--color-border-bright)]'
                      }`}
                    >
                      <div className="text-[10px] font-mono font-bold mb-1 tracking-widest">{tier.label}</div>
                      <div className="text-lg font-display font-bold">{tier.value} ETH</div>
                      <div className="text-[10px] opacity-50 mt-0.5">{tier.desc}</div>
                    </button>
                  ))}
                </div>
                <div className="p-3 rounded-lg bg-[var(--color-nebula-deep)] border border-[var(--color-border)] text-[var(--color-text-dim)] text-[10px] font-mono">
                  {isBlockchain
                    ? 'Platform fee: 5% per transaction. Revenue via smart contract.'
                    : 'Platform fee: 5% per transaction. Revenue tracked in database.'}
                </div>
              </div>
            )}

            {/* ── STEP 6: REVIEW & DEPLOY ── */}
            {step === 6 && (
              <div className="space-y-5">
                <h2 className="font-display font-bold text-lg text-[var(--color-text-primary)] mb-5">Review & Deploy</h2>

                <div className="space-y-0 rounded-lg overflow-hidden border border-[var(--color-border)]">
                  {[
                    { label: 'DEPLOY MODE', value: isDatabase ? 'DATABASE ONLY' : 'BLOCKCHAIN + DB', highlight: isDatabase ? 'success' : 'purple' },
                    { label: 'OWNER WALLET', value: walletAddress ? `${walletAddress.slice(0, 16)}...` : '—', highlight: 'purple' },
                    { label: 'NAME', value: form.name || '—' },
                    { label: 'CATEGORY', value: form.category || '—' },
                    { label: 'ENDPOINT', value: form.endpoint || '—' },
                    { label: 'PRICING', value: form.pricing ? `${form.pricing} ETH/call` : '—' },
                  ].map((row, i) => (
                    <div key={row.label} className={`flex justify-between items-center px-4 py-2.5 ${i % 2 === 0 ? 'bg-[rgba(255,255,255,0.015)]' : ''}`}>
                      <span className="text-[var(--color-text-dim)] font-mono text-[10px] tracking-widest">{row.label}</span>
                      <span className={`font-mono text-xs truncate max-w-[55%] text-right ${
                        row.highlight === 'success' ? 'text-[var(--color-success)]'
                        : row.highlight === 'purple' ? 'text-[var(--color-purple-bright)]'
                        : 'text-[var(--color-text-primary)]'
                      }`}>{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Note about wallet storage */}
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[rgba(124,58,237,0.04)] border border-[rgba(124,58,237,0.15)]">
                  <Database size={13} className="text-[var(--color-purple-bright)] mt-0.5 shrink-0" />
                  <p className="text-[var(--color-text-muted)] text-[11px] leading-relaxed">
                    Your wallet address is always saved to the database as the agent owner.
                    This powers your dashboard, revenue tracking, and agent attribution regardless of deploy mode.
                  </p>
                </div>

                {/* Wallet not connected guard */}
                {!isConnected && (
                  <div className="flex items-start gap-3 p-3.5 rounded-lg bg-[rgba(248,113,113,0.05)] border border-[rgba(248,113,113,0.25)]">
                    <span className="text-[var(--color-danger)] mt-0.5">✕</span>
                    <div>
                      <div className="text-[var(--color-danger)] text-[10px] font-mono font-bold tracking-widest mb-0.5">WALLET NOT CONNECTED</div>
                      <div className="text-[var(--color-text-muted)] text-[11px]">Connect your wallet to identify ownership and enable dashboard tracking.</div>
                    </div>
                  </div>
                )}

                {!deployed ? (
                  <div className="space-y-3">
                    {isDatabase && (
                      <NeonButton
                        variant="success"
                        size="lg"
                        onClick={handleDeploy}
                        loading={deploying}
                        disabled={!canDeploy}
                        className="w-full justify-center"
                      >
                        <Database size={15} />
                        SAVE TO DATABASE
                      </NeonButton>
                    )}
                    {isBlockchain && (
                      <NeonButton
                        size="lg"
                        onClick={handleDeploy}
                        loading={deploying}
                        disabled={!canDeploy}
                        className="w-full justify-center"
                      >
                        <Link2 size={15} />
                        {isConnected ? '⚡ DEPLOY ON-CHAIN' : 'CONNECT WALLET TO DEPLOY'}
                      </NeonButton>
                    )}
                  </div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`p-6 rounded-xl border text-center ${
                      isDatabase
                        ? 'bg-[rgba(52,211,153,0.06)] border-[rgba(52,211,153,0.3)]'
                        : 'bg-[rgba(124,58,237,0.06)] border-[rgba(124,58,237,0.3)]'
                    }`}
                  >
                    <Check size={28} className={`mx-auto mb-3 ${isDatabase ? 'text-[var(--color-success)]' : 'text-[var(--color-purple-bright)]'}`} />
                    <div className={`font-display font-bold text-lg mb-1 ${isDatabase ? 'text-[var(--color-success)]' : 'text-[var(--color-purple-bright)]'}`}>
                      AGENT {isDatabase ? 'SAVED' : 'DEPLOYED'}
                    </div>
                    <div className="text-[var(--color-text-muted)] text-xs font-mono tracking-widest mb-3">
                      {isDatabase
                        ? 'STORED IN DATABASE · MARKETPLACE READY · DASHBOARD ACTIVE'
                        : 'ON-CHAIN · DATABASE SYNCED · DASHBOARD ACTIVE'}
                    </div>
                    <div className="text-[var(--color-text-dim)] text-[10px] font-mono px-2 py-1.5 rounded bg-[rgba(255,255,255,0.03)] border border-[var(--color-border)] inline-block">
                      OWNER: {walletAddress?.slice(0, 18)}...
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
          {step < 6 && (
            <NeonButton
              icon={ChevronRight}
              onClick={() => setStep(s => Math.min(6, s + 1))}
              disabled={step === 1 && !canProceedFromStep1}
            >
              NEXT
            </NeonButton>
          )}
        </div>
      )}

      {/* Step 1 hints */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-4 space-y-1.5">
          {!isConnected && (
            <p className="text-center text-[var(--color-warning)] text-[10px] font-mono tracking-widest opacity-70">
              ⚠ CONNECT WALLET FIRST — REQUIRED FOR IDENTITY & DASHBOARD
            </p>
          )}
          {isConnected && !form.deployMode && (
            <p className="text-center text-[var(--color-text-dim)] text-[10px] font-mono tracking-widest">
              SELECT A DEPLOYMENT TARGET TO CONTINUE
            </p>
          )}
        </motion.div>
      )}
    </div>
  )
}