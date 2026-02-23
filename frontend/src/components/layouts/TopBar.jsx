import React from 'react'
import { motion } from 'framer-motion'
import { Radio, Bell, ChevronDown } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useWallet } from '../../hooks/useWallet'
import NeonButton from '../ui/NeonButton'

export default function TopBar() {
  const { isConnected, balance, shortAddress } = useAuthStore()
  const { connect, disconnect, isConnecting } = useWallet()

  return (
    <header className="h-13 glass-panel border-b border-[var(--color-border)] flex items-center justify-between px-5 shrink-0 z-10">
      {/* Left */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 text-[var(--color-success)] text-[10px] font-mono tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] pulse-dot" />
          NETWORK ONLINE
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[var(--color-text-dim)] text-[10px] font-mono tracking-widest">
          <Radio size={11} />
          ETH MAINNET
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-nebula-deep)] border border-[var(--color-border)] text-[10px] font-mono text-[var(--color-text-dim)]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-purple-bright)] pulse-dot" />
          AGENTS: 247 ONLINE
        </motion.div>

        <Bell size={16} className="text-[var(--color-text-dim)] hover:text-[var(--color-text-secondary)] cursor-pointer transition-colors" />

        {isConnected ? (
          <button
            onClick={disconnect}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-nebula)] border border-[var(--color-border-bright)] text-[var(--color-purple-bright)] hover:border-[var(--color-purple-core)] hover:shadow-[var(--shadow-glow-soft)] transition-all cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-purple-bright)] pulse-dot" />
            <span className="text-[10px] font-mono">{shortAddress()}</span>
            {balance && (
              <span className="hidden sm:inline text-[10px] font-mono text-[var(--color-text-muted)]">
                {parseFloat(balance).toFixed(3)} ETH
              </span>
            )}
            <ChevronDown size={11} />
          </button>
        ) : (
          <NeonButton size="sm" onClick={connect} loading={isConnecting}>
            CONNECT WALLET
          </NeonButton>
        )}
      </div>
    </header>
  )
}