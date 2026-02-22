import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layouts/Layout'
import Marketplace from './pages/Marketplace'
import AgentDetail from './pages/AgentDetail'
import DeployStudio from './pages/DeployStudio'
import Dashboard from './pages/Dashboard'
import Leaderboard from './pages/Leaderboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/marketplace" replace />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="agent/:id" element={<AgentDetail />} />
          <Route path="deploy" element={<DeployStudio />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="leaderboard" element={<Leaderboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App