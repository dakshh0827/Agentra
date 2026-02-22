import React from 'react'

export default function NeuralGrid({ className = '' }) {
  return (
    <div
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{
        backgroundImage: `
          linear-gradient(rgba(0,168,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,168,255,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }}
    >
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-64 h-64 opacity-20"
        style={{ background: 'radial-gradient(ellipse at top left, #00a8ff, transparent 60%)' }} />
      <div className="absolute bottom-0 right-0 w-64 h-64 opacity-20"
        style={{ background: 'radial-gradient(ellipse at bottom right, #bf00ff, transparent 60%)' }} />
    </div>
  )
}