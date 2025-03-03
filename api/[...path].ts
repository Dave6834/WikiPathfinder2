import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createServer } from 'http'
import { app } from '../server'

const server = createServer(app)

export const config = {
  api: {
    bodyParser: true,
    externalResolver: true
  },
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  return new Promise((resolve, reject) => {
    server.emit('request', req, res)
    res.on('finish', resolve)
    res.on('error', reject)
    
    // Add timeout handling
    const timeout = setTimeout(() => {
      reject(new Error('Request timeout'))
    }, 50000)
    
    res.on('finish', () => clearTimeout(timeout))
    res.on('error', () => clearTimeout(timeout))
  })
}