import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000,
  maxRetries: 3
});

async function findConnection(startWord: string, endWord: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a Wikipedia expert that discovers fascinating connections between topics.`
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
    if (!content) throw new Error("No response from OpenAI");
    
    const result = JSON.parse(content);
    return result;
  } catch (error) {
    console.error("OpenAI error:", error);
    throw error;
  }
}

export const ai = {
  findConnection
}; 