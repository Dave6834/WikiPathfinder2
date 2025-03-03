import axios from "axios";

const API_BASE = "https://en.wikipedia.org/w/api.php";

const wikipediaClient = axios.create({
  timeout: 10000,
  headers: {
    'User-Agent': 'WikiPathFinder/2.0'
  }
});

async function getRandomArticle() {
  try {
    console.log('Fetching random article...');
    const params = {
      action: "query",
      format: "json",
      list: "random",
      rnnamespace: 0,
      rnlimit: 1,
      origin: "*"
    };

    const response = await wikipediaClient.get(API_BASE, { 
      params,
      validateStatus: (status) => status < 500
    });

    if (!response.data?.query?.random?.[0]?.title) {
      throw new Error("Invalid response format from Wikipedia API");
    }

    return response.data.query.random[0].title;
  } catch (error) {
    console.error("Random article error:", error);
    throw error;
  }
}

export const wikipedia = {
  getRandomArticle
}; 