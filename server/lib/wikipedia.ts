import axios from "axios";

const API_BASE = "https://en.wikipedia.org/w/api.php";

// Add timeout and retry logic
const wikipediaClient = axios.create({
  timeout: 10000, // 10 seconds
  headers: {
    'User-Agent': 'WikiPathFinder/2.0 (https://wikipathfinder2.vercel.app/)'
  }
});

interface WikiPageInfo {
  title: string;
  extract: string;
}

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

    console.log('Wikipedia API response received');
    
    if (!response.data?.query?.random?.[0]?.title) {
      console.error('Invalid Wikipedia response:', response.data);
      throw new Error("Invalid response format from Wikipedia API");
    }

    const title = response.data.query.random[0].title;
    console.log(`Got random article: ${title}`);
    return title;

  } catch (error) {
    console.error("Random article error details:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      isAxiosError: axios.isAxiosError(error),
      timeout: error instanceof Error && 'code' in error && error.code === 'ECONNABORTED'
    });
    throw error;
  }
}

async function searchArticles(query: string): Promise<string[]> {
  try {
    const params = {
      action: "opensearch",
      format: "json",
      search: query,
      limit: 5,
      namespace: 0,
      origin: "*"
    };

    const response = await axios.get(API_BASE, { params, timeout: 5000 });
    return response.data[1] || [];
  } catch (error) {
    console.error("Wikipedia search error:", error);
    return [];
  }
}

async function getPageInfo(title: string): Promise<WikiPageInfo | null> {
  try {
    const params = {
      action: "query",
      format: "json",
      titles: title,
      prop: "extracts",
      exintro: true,
      explaintext: true,
      redirects: true,
      origin: "*"
    };

    const response = await axios.get(API_BASE, { params, timeout: 5000 });
    const pages = response.data.query.pages;
    const pageId = Object.keys(pages)[0];
    const page = pages[pageId];

    if (page.missing) {
      return null;
    }

    return {
      title: page.title,
      extract: page.extract
    };
  } catch (error) {
    console.error("Wikipedia API error:", error);
    return null;
  }
}

export const wikipedia = {
  getRandomArticle,
  getPageInfo,
  searchArticles
};