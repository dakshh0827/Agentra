import { Router } from 'express'
import {
  getAgents, getAgentById, deployAgent,
  updateAgent, deleteAgent, validateEndpoint, searchAgents,
} from '../controllers/agentController.js'
import { authMiddleware, optionalAuth } from '../middlewares/auth.js'
import { deployLimiter } from '../middlewares/rateLimiter.js'
import { getAgentMetrics } from '../controllers/analyticsController.js'
import { getInteractions } from '../controllers/executionController.js'

const router = Router()

// Public
router.get('/', optionalAuth, getAgents)
router.get('/search', searchAgents)
router.get('/:id', optionalAuth, getAgentById)
router.get('/:id/metrics', getAgentMetrics)
router.get('/:id/interactions', getInteractions)

// Protected
router.post('/deploy', authMiddleware, deployLimiter, deployAgent)
router.post('/validate-endpoint', authMiddleware, validateEndpoint)
router.put('/:id', authMiddleware, updateAgent)
router.delete('/:id', authMiddleware, deleteAgent)

export default router