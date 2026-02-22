import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutGrid, Zap, Upload, BarChart3, Trophy,
  Cpu, ChevronRight, X, Menu,
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { to: '/marketplace', icon: LayoutGrid, label: 'MARKETPLACE', sublabel: 'Discover agents' },
  { to: '/deploy', icon: Upload, label: 'DEPLOY', sublabel: 'Launch agent' },
  { to: '/dashboard', icon: BarChart3, label: 'DASHBOARD', sublabel: 'Analytics' },
  { to: '/leaderboard', icon: Trophy, label: 'LEADERBOARD', sublabel: 'Rankings' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden lg:flex flex-col h-screen bg-panel border-r border-border relative z-20 overflow-hidden shrink-0"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-5 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-electric-blue to-neon-purple flex items-center justify-center shrink-0">
            <Cpu size={16} className="text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="font-display font-bold text-sm text-text-primary tracking-widest">NEURAL</div>
                <div className="font-mono text-[10px] text-electric-blue tracking-[0.3em]">MARKET</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label, sublabel }) => {
            const isActive = location.pathname.startsWith(to)
            return (
              <NavLink key={to} to={to}>
                <motion.div
                  whileHover={{ x: 2 }}
                  className={clsx(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 group',
                    isActive
                      ? 'bg-electric-blue/10 border border-electric-blue/30 text-electric-blue'
                      : 'text-text-muted hover:text-text-secondary hover:bg-panel-light border border-transparent'
                  )}
                >
                  <Icon size={18} className={isActive ? 'text-electric-blue' : ''} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 min-w-0"
                      >
                        <div className="text-xs font-mono tracking-widest">{label}</div>
                        <div className="text-[10px] text-text-muted">{sublabel}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {isActive && !collapsed && (
                    <ChevronRight size={12} className="ml-auto text-electric-blue" />
                  )}
                </motion.div>
              </NavLink>
            )
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="p-3 border-t border-border">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-lg text-text-muted hover:text-text-secondary hover:bg-panel-light transition-all"
          >
            <motion.div animate={{ rotate: collapsed ? 0 : 180 }}>
              <ChevronRight size={16} />
            </motion.div>
            {!collapsed && <span className="text-xs font-mono">COLLAPSE</span>}
          </button>
        </div>
      </motion.aside>
    </>
  )
}