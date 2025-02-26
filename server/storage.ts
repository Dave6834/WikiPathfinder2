import { searches, type Search, type InsertSearch } from "@shared/schema";

export interface IStorage {
  createSearch(search: InsertSearch): Promise<Search>;
  getSearches(): Promise<Search[]>;
  getSearch(id: number): Promise<Search | undefined>;
}

export class MemStorage implements IStorage {
  private searches: Map<number, Search>;
  private currentId: number;

  constructor() {
    this.searches = new Map();
    this.currentId = 1;
  }

  async createSearch(insertSearch: InsertSearch): Promise<Search> {
    const id = this.currentId++;
    
    // ✅ Ensure path is an array of strings
    const path = Array.isArray(insertSearch.path) ? insertSearch.path.map(String) : [];
  
    const search: Search = {
      ...insertSearch,
      path, // Assign the correctly typed path
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
