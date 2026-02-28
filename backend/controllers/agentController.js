import agentService from '../services/agentService.js'
import blockchainService from '../services/blockchainService.js'
import { asyncHandler, createError } from '../middlewares/errorHandler.js'
import { z } from 'zod'

// ── Validation schemas ────────────────────────────────────

const deployBaseSchema = z.object({
  name: z.string().min(2).max(64),
  description: z.string().min(10).max(1000).optional(),
  category: z.enum(['Analysis', 'Development', 'Security', 'Data', 'NLP', 'Web3', 'Other']),
  tags: z.array(z.string().max(32)).max(10).optional(),
  pricing: z.number().min(0).max(100),
  mcpSchema: z.record(z.string(), z.unknown()).optional(),
  deployMode: z.enum(['database', 'blockchain']).default('blockchain'),
  ownerWallet: z.string().optional(),
})

const blockchainDeploySchema = deployBaseSchema.extend({
  endpoint: z.string().url(),
})

const databaseDeploySchema = deployBaseSchema.extend({
  endpoint: z.string().url().optional().default(''),
})

const updateSchema = z.object({
  name: z.string().min(2).max(64).optional(),
  description: z.string().min(10).max(1000).optional(),
  endpoint: z.string().url().optional(),
  pricing: z.number().min(0).max(100).optional(),
  tags: z.array(z.string()).optional(),
  category: z.enum(['Analysis', 'Development', 'Security', 'Data', 'NLP', 'Web3', 'Other']).optional(),
})

// ── Controllers ───────────────────────────────────────────

const getAgents = asyncHandler(async (req, res) => {
  const { category, search, status, sortBy, page, limit, mine } = req.query

  const result = await agentService.getAgents({
    category: category === 'all' ? undefined : category,
    search,
    status: (!status || status === 'all') ? undefined : status,
    sortBy: sortBy || 'score',
    page: parseInt(page) || 1,
    limit: Math.min(parseInt(limit) || 20, 100),
    ownerWallet: mine === 'true' ? req.walletAddress : undefined,
  })

  res.json(result)
})

const getAgentById = asyncHandler(async (req, res) => {
  const agent = await agentService.getById(req.params.id)
  res.json(agent)
})

const deployAgent = asyncHandler(async (req, res) => {
  const { deployMode = 'blockchain' } = req.body

  let data
  try {
    if (deployMode === 'database') {
      data = databaseDeploySchema.parse(req.body)
    } else {
      data = blockchainDeploySchema.parse(req.body)
    }
  } catch (err) {
    throw err
  }

  if (deployMode === 'blockchain' && req.query.skipValidation !== 'true' && data.endpoint) {
    const validation = await agentService.validateEndpoint(data.endpoint)
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Endpoint validation failed',
        details: validation.error,
      })
    }
  }

  const agent = await agentService.createAgent(data, req.walletAddress)

  if (deployMode === 'blockchain') {
    blockchainService.registerAgentOnChain(
      agent.agentId,
      req.walletAddress,
      agent.metadataUri,
      agent.pricing
    ).catch(err => console.warn('[AGENT] On-chain registration failed (non-blocking):', err.message))
  } else {
    console.log(`[AGENT] Database-only deploy for agent: ${agent.agentId} — skipping on-chain registration`)
  }

  res.status(201).json(agent)
})

const updateAgent = asyncHandler(async (req, res) => {
  const data = updateSchema.parse(req.body)
  const agent = await agentService.updateAgent(req.params.id, data, req.walletAddress)
  res.json(agent)
})

const deleteAgent = asyncHandler(async (req, res) => {
  await agentService.deactivateAgent(req.params.id, req.walletAddress)
  res.json({ message: 'Agent deactivated successfully' })
})

const validateEndpoint = asyncHandler(async (req, res) => {
  const { endpoint } = req.body
  if (!endpoint) return res.status(400).json({ error: 'endpoint required' })
  const result = await agentService.validateEndpoint(endpoint)
  res.json(result)
})

const searchAgents = asyncHandler(async (req, res) => {
  const { q } = req.query
  if (!q) return res.status(400).json({ error: 'query param q required' })
  const agents = await agentService.searchAgents(q)
  res.json(agents)
})

export {
  getAgents,
  getAgentById,
  deployAgent,
  updateAgent,
  deleteAgent,
  validateEndpoint,
  searchAgents,
}