import React, { useEffect, useRef } from 'react'
import { Terminal } from 'lucide-react'

export default function TerminalBox({ logs = [], title = 'SYSTEM LOG', className = '' }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const levelColor = {
    info: 'text-electric-blue',
    success: 'text-cyber-green',
    error: 'text-cyber-red',
    warn: 'text-cyber-yellow',
    system: 'text-neon-purple',
  }

  return (
    <div className={`glass-panel rounded-lg overflow-hidden ${className}`}>
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-panel-light">
        <Terminal size={14} className="text-electric-blue" />
        <span className="font-mono text-xs text-text-secondary tracking-widest uppercase">{title}</span>
        <div className="ml-auto flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyber-red opacity-60" />
          <div className="w-2.5 h-2.5 rounded-full bg-cyber-yellow opacity-60" />
          <div className="w-2.5 h-2.5 rounded-full bg-cyber-green opacity-60" />
        </div>
      </div>
      {/* Terminal body */}
      <div className="p-4 h-64 overflow-y-auto font-mono text-xs space-y-1.5 bg-black/30">
        {logs.length === 0 ? (
          <div className="text-text-muted terminal-cursor">Awaiting input...</div>
        ) : (
          logs.map((log, i) => (
            <div key={log.id || i} className="flex gap-3 leading-relaxed">
              <span className="text-text-muted shrink-0">
                {new Date(log.timestamp).toLocaleTimeString('en', { hour12: false })}
              </span>
              <span className={`${levelColor[log.level] || 'text-text-secondary'} shrink-0 uppercase text-[10px] font-bold pt-0.5`}>
                [{log.level || 'INFO'}]
              </span>
              <span className="text-text-secondary break-all">{log.message}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}