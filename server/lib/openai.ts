import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set in environment variables");
}

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 8000,
  maxRetries: 2
});

async function generateArticleDescription(title: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a knowledgeable encyclopedia expert. Provide a brief, one-sentence description of the given topic."
        },
        {
          role: "user",
          content: `What is "${title}"? Provide a concise explanation.`
        }
      ],
      temperature: 0.7,
      max_tokens: 100
    });

    return response.choices[0].message.content || `Description of ${title}`;
  } catch (error) {
    console.error("OpenAI API error:", error);
    return `Brief description of ${title}`;
  }
}

async function findConnection(startWord: string, endWord: string): Promise<{ path: string[], story: string }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a Wikipedia expert that discovers fascinating connections between topics. Given two subjects, find:
1. A path of real Wikipedia articles connecting them (2-8 steps)
2. An insightful explanation of a deeper connection between them - this could be:
   - A surprising similarity or contrast
   - A shared underlying concept or principle
   - An interesting historical or cultural link
   - A cause-and-effect relationship
   - A philosophical or metaphorical connection

Return your response in this JSON format:
{
  "path": ["Article1", "Article2", ...],
  "story": "Your explanation of the connection..."
}`
        },
        {
          role: "user",
          content: `Find an interesting connection between "${startWord}" and "${endWord}"`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1000
    });

    const content = response.choices[0].message.content;
    
    if (typeof content !== "string" || content.trim() === "") {
      throw new Error("Invalid response from OpenAI: message.content is null or empty.");
    }

    const result = JSON.parse(content);

    if (!result.path || !Array.isArray(result.path) || !result.story || 
        !result.path.includes(startWord) || !result.path.includes(endWord)) {
      throw new Error("Invalid response format from AI");
    }

    return {
      path: result.path,
      story: result.story
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    if (error instanceof Error) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
    throw new Error("Failed to find connection between articles");
  }
}

export const ai = {
  findConnection,
  generateArticleDescription
};