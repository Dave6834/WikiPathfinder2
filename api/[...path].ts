import type { VercelRequest, VercelResponse } from '@vercel/node'
import { wikipedia } from './lib/wikipedia'
import { ai } from './lib/openai'
import { storage } from './storage'

export const config = {
  api: {
    bodyParser: true
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const { path } = req.query;
  const endpoint = Array.isArray(path) ? path[0] : path;

  try {
    switch (req.method) {
      case 'GET':
        switch (endpoint) {
          case 'random':
            const title = await wikipedia.getRandomArticle();
            return res.json({ title });

          case 'search-articles':
            const query = req.query.q as string;
            if (!query) {
              return res.json({ suggestions: [] });
            }
            const suggestions = await wikipedia.searchArticles(query);
            return res.json({ suggestions });

          case 'searches':
            const searches = await storage.getSearches();
            return res.json(searches);

          default:
            return res.status(404).json({ error: 'Route not found' });
        }

      case 'POST':
        switch (endpoint) {
          case 'search':
            const { startWord, endWord } = req.body;
            if (!startWord || !endWord) {
              return res.status(400).json({ 
                error: "Both start and end articles are required" 
              });
            }

            const { path, story } = await ai.findConnection(startWord, endWord);
            const search = await storage.createSearch({
              startWord,
              endWord,
              path,
              story
            });
            return res.json(search);

          default:
            return res.status(404).json({ error: 'Route not found' });
        }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: endpoint === 'random' ? 'Failed to get random article' : 'Search failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}