import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import StarField from '../ui/StarField'
import NeuralGrid from '../ui/NeuralGrid'

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#000' }}>
      <StarField />
      <NeuralGrid />

      {/* Very subtle, small ambient glows — not screaming purple */}
      <div className="fixed top-0 right-0 w-[500px] h-[300px] rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse, rgba(100,40,200,0.04) 0%, transparent 70%)' }} />
      <div className="fixed bottom-0 left-0 w-[400px] h-[250px] rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse, rgba(80,30,160,0.03) 0%, transparent 70%)' }} />

      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 relative z-10">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}