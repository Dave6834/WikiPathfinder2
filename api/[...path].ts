import type { VercelRequest, VercelResponse } from '@vercel/node'
import express from 'express'
import { wikipedia } from './lib/wikipedia.js'
import { ai } from './lib/openai.js'

const app = express()
app.use(express.json())

// Random article endpoint
app.get("/api/random", async (_req, res) => {
  try {
    const title = await wikipedia.getRandomArticle();
    res.json({ title });
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to get random article",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Search endpoint
app.post("/api/search", async (req, res) => {
  try {
    const { startWord, endWord } = req.body;
    if (!startWord || !endWord) {
      return res.status(400).json({ error: "Both start and end articles are required" });
    }

    const result = await ai.findConnection(startWord, endWord);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: "Search failed",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  return new Promise<void>((resolve) => {
    // Convert VercelRequest to Express Request by adding missing properties
    const expressReq = Object.assign(req, {
      get: (name: string) => req.headers[name.toLowerCase()],
      header: (name: string) => req.headers[name.toLowerCase()],
      accepts: () => true,
      acceptsCharsets: () => true,
      acceptsEncodings: () => true,
      acceptsLanguages: () => true
    });

    // Convert VercelResponse to Express Response
    const expressRes = Object.assign(res, {
      header: (name: string, value: string) => res.setHeader(name, value),
      end: (chunk: any) => {
        res.end(chunk);
        resolve();
      }
    });

    app(expressReq, expressRes);
  });
}

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true
  }
}