import type { VercelRequest, VercelResponse } from '@vercel/node'
import express from 'express'
import { wikipedia } from './lib/wikipedia.js'
import { ai } from './lib/openai.js'
import { storage } from './storage.js'

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

// Search articles endpoint
app.get("/api/search-articles", async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.json({ suggestions: [] });
    }
    const suggestions = await wikipedia.searchArticles(query);
    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ error: "Failed to search articles" });
  }
});

// Search endpoint
app.post("/api/search", async (req, res) => {
  try {
    const { startWord, endWord } = req.body;
    if (!startWord || !endWord) {
      return res.status(400).json({ error: "Both start and end articles are required" });
    }

    const { path, story } = await ai.findConnection(startWord, endWord);
    const search = await storage.createSearch({
      startWord,
      endWord,
      path,
      story
    });
    res.json(search);
  } catch (error) {
    res.status(500).json({
      error: "Search failed",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Get searches endpoint
app.get("/api/searches", async (_req, res) => {
  try {
    const searches = await storage.getSearches();
    res.json(searches);
  } catch (error) {
    res.status(500).json({
      error: "Failed to get searches",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  return new Promise((resolve) => {
    app(req, res, resolve)
  })
}

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true
  }
}