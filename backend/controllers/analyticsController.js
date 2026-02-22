import analyticsService from '../services/analyticsService.js'
import { asyncHandler } from '../middlewares/errorHandler.js'

const getLeaderboard = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 100)
  const leaderboard = await analyticsService.getLeaderboard(limit)
  res.json(leaderboard)
})

const getDashboard = asyncHandler(async (req, res) => {
  const wallet = req.walletAddress
  const data = await analyticsService.getDashboard(wallet)
  res.json(data)
})

const getGlobalStats = asyncHandler(async (req, res) => {
  const stats = await analyticsService.getGlobalStats()
  res.json(stats)
})

const getAgentMetrics = asyncHandler(async (req, res) => {
  const metrics = await analyticsService.getAgentMetrics(req.params.id)
  res.json(metrics)
})

export { getLeaderboard, getDashboard, getGlobalStats, getAgentMetrics }