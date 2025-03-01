import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createServer } from 'http'
import { app } from '../server'

const server = createServer(app)

export const config = {
  api: {
    bodyParser: false,
  },
}

export default function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  return new Promise((resolve, reject) => {
    server.emit('request', req, res)
    res.on('finish', resolve)
  })
}