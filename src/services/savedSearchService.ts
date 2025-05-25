
import { SavedSearch, JobFilters } from '@/types/job';

class SavedSearchService {
  private storageKey = 'saved_searches';

  async saveSearch(name: string, filters: JobFilters, userId: string): Promise<SavedSearch> {
    const savedSearch: SavedSearch = {
      id: `search-${Date.now()}`,
      name,
      filters,
      createdAt: new Date().toISOString()
    };

    const searches = this.getSavedSearches(userId);
    searches.push(savedSearch);
    localStorage.setItem(`${this.storageKey}_${userId}`, JSON.stringify(searches));

    return savedSearch;
  }

  getSavedSearches(userId: string): SavedSearch[] {
    try {
      const stored = localStorage.getItem(`${this.storageKey}_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  async deleteSearch(searchId: string, userId: string): Promise<void> {
    const searches = this.getSavedSearches(userId);
    const filtered = searches.filter(search => search.id !== searchId);
    localStorage.setItem(`${this.storageKey}_${userId}`, JSON.stringify(filtered));
  }

  async executeSearch(searchId: string, userId: string): Promise<JobFilters | null> {
    const searches = this.getSavedSearches(userId);
    const search = searches.find(s => s.id === searchId);
    return search ? search.filters : null;
  }
}

export const savedSearchService = new SavedSearchService();
