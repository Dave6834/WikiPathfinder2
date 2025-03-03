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

async function searchArticles(query: string) {
  try {
    const params = {
      action: "opensearch",
      format: "json",
      search: query,
      limit: 5,
      namespace: 0,
      origin: "*"
    };
    const response = await wikipediaClient.get(API_BASE, { params });
    return response.data[1] || [];
  } catch (error) {
    console.error("Wikipedia search error:", error);
    return [];
  }
}

async function getPageInfo(title: string) {
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
    const response = await wikipediaClient.get(API_BASE, { params });
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
  searchArticles,
  getPageInfo
}; 