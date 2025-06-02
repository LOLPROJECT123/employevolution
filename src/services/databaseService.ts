
export class DatabaseService {
  private prefix = 'employevolution_';

  set<T>(key: string, data: T, expiryHours?: number): void {
    const item = {
      data,
      timestamp: Date.now(),
      expiry: expiryHours ? Date.now() + (expiryHours * 60 * 60 * 1000) : null
    };
    
    try {
      localStorage.setItem(`${this.prefix}${key}`, JSON.stringify(item));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(`${this.prefix}${key}`);
      if (!stored) return null;

      const item = JSON.parse(stored);
      
      // Check if item has expired
      if (item.expiry && Date.now() > item.expiry) {
        this.remove(key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.error('Failed to get from localStorage:', error);
      return null;
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(`${this.prefix}${key}`);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }

  // Get all keys with prefix
  getKeys(): string[] {
    try {
      return Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.replace(this.prefix, ''));
    } catch (error) {
      console.error('Failed to get keys from localStorage:', error);
      return [];
    }
  }
}

export const databaseService = new DatabaseService();
