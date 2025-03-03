interface Search {
  id: number;
  startWord: string;
  endWord: string;
  path: string[];
  story: string;
  searchedAt: Date;
}

interface InsertSearch {
  startWord: string;
  endWord: string;
  path: string[];
  story: string;
}

export class MemStorage {
  private searches: Map<number, Search>;
  private currentId: number;

  constructor() {
    this.searches = new Map();
    this.currentId = 1;
  }

  async createSearch(insertSearch: InsertSearch): Promise<Search> {
    const id = this.currentId++;
    const path = Array.isArray(insertSearch.path) ? insertSearch.path.map(String) : [];
  
    const search: Search = {
      ...insertSearch,
      path,
      id,
      searchedAt: new Date()
    };
  
    this.searches.set(id, search);
    return search;
  }

  async getSearches(): Promise<Search[]> {
    return Array.from(this.searches.values());
  }

  async getSearch(id: number): Promise<Search | undefined> {
    return this.searches.get(id);
  }
}

export const storage = new MemStorage(); 