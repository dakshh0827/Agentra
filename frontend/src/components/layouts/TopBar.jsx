import React from 'react'
import { motion } from 'framer-motion'
import { Wifi, Shield, Bell, ChevronDown } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useWallet } from '../../hooks/useWallet'
import NeonButton from '../ui/NeonButton'

export default function TopBar() {
  const { walletAddress, isConnected, balance, shortAddress } = useAuthStore()
  const { connect, disconnect, isConnecting } = useWallet()

  return (
    <header className="h-14 glass-panel border-b border-border flex items-center justify-between px-6 shrink-0 z-10">
      {/* Left — status indicators */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-cyber-green text-xs font-mono">
          <div className="w-1.5 h-1.5 rounded-full bg-cyber-green pulse-dot" />
          <span>NETWORK ONLINE</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-text-muted text-xs font-mono">
          <Wifi size={12} />
          <span>ETH MAINNET</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-text-muted text-xs font-mono">
          <Shield size={12} />
          <span>SECURE</span>
        </div>
      </div>

      {/* Right — wallet */}
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded bg-panel-light border border-border text-xs font-mono text-text-muted"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-cyber-yellow pulse-dot" />
          <span>AGENTS: 247 ONLINE</span>
        </motion.div>

        <Bell size={18} className="text-text-muted hover:text-text-primary cursor-pointer transition-colors" />

        {isConnected ? (
          <button
            onClick={disconnect}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-electric-blue/10 border border-electric-blue/30 text-electric-blue hover:bg-electric-blue/20 transition-all"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-electric-blue pulse-dot" />
            <span className="text-xs font-mono">{shortAddress()}</span>
            {balance && (
              <span className="hidden sm:inline text-xs font-mono text-text-muted">
                {parseFloat(balance).toFixed(3)} ETH
              </span>
            )}
            <ChevronDown size={12} />
          </button>
        ) : (
          <NeonButton
            variant="solid"
            size="sm"
            onClick={connect}
            loading={isConnecting}
          >
            CONNECT WALLET
          </NeonButton>
        )}
      </div>
    </header>
  )
}