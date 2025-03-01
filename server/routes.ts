import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { wikipedia } from "./lib/wikipedia";
import { ai } from "./lib/openai";
import { insertSearchSchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  app.get("/api/random", async (_req, res) => {
    try {
      const title = await wikipedia.getRandomArticle();
      res.json({ title });
    } catch (error) {
      console.error("Random article error details:", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      });
      res.status(500).json({ 
        error: "Failed to get random article",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/search-articles", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.json({ suggestions: [] });
      }
      const suggestions = await wikipedia.searchArticles(query);
      res.json({ suggestions });
    } catch (error) {
      console.error("Article search error:", error);
      res.status(500).json({ error: "Failed to search articles" });
    }
  });
  
  app.get("/api/article/:title", async (req, res) => {
    try {
      const title = decodeURIComponent(req.params.title);
      const info = await wikipedia.getPageInfo(title);

      if (!info || !info.extract) {
        // If no Wikipedia extract, generate one using AI
        const description = await ai.generateArticleDescription(title);
        res.json({
          title,
          extract: description
        });
        return;
      }

      res.json(info);
    } catch (error) {
      console.error("Article info error:", error);
      res.status(500).json({ 
        error: "Failed to get article info",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/search", async (req, res) => {
    try {
      console.log("Search request received:", req.body);
      
      const { startWord, endWord } = req.body;
      if (!startWord || !endWord) {
        return res.status(400).json({ error: "Both start and end articles are required" });
      }

      console.log("Calling OpenAI findConnection...");
      const { path, story } = await ai.findConnection(startWord, endWord);
      console.log("OpenAI response received");

      console.log("Creating search record...");
      const search = await storage.createSearch({
        startWord,
        endWord,
        path,
        story
      });
      console.log("Search record created");

      res.json(search);
    } catch (error) {
      console.error("Search error details:", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        body: req.body
      });
      
      res.status(500).json({
        error: "Search failed",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/searches", async (_req, res) => {
    try {
      const searches = await storage.getSearches();
      res.json(searches);
    } catch (error) {
      console.error("Get searches error:", error);
      res.status(500).json({ 
        error: "Failed to get searches",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}