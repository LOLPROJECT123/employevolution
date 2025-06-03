
import { useState, useEffect } from 'react';

export interface IndexedDBConfig {
  dbName: string;
  version: number;
  stores: {
    name: string;
    keyPath?: string;
    autoIncrement?: boolean;
    indexes?: { name: string; keyPath: string; unique?: boolean }[];
  }[];
}

export const useIndexedDB = (config: IndexedDBConfig) => {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeDB();
  }, []);

  const initializeDB = async () => {
    try {
      setIsLoading(true);
      const database = await openDB(config);
      setDb(database);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize database');
    } finally {
      setIsLoading(false);
    }
  };

  const openDB = (config: IndexedDBConfig): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(config.dbName, config.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create or update stores
        config.stores.forEach(storeConfig => {
          let store: IDBObjectStore;
          
          if (db.objectStoreNames.contains(storeConfig.name)) {
            // Store exists, we might need to update it
            return; // Skip for now, handle updates in a more sophisticated way if needed
          } else {
            // Create new store
            store = db.createObjectStore(storeConfig.name, {
              keyPath: storeConfig.keyPath,
              autoIncrement: storeConfig.autoIncrement
            });
          }
          
          // Create indexes
          if (storeConfig.indexes) {
            storeConfig.indexes.forEach(indexConfig => {
              if (!store.indexNames.contains(indexConfig.name)) {
                store.createIndex(indexConfig.name, indexConfig.keyPath, {
                  unique: indexConfig.unique || false
                });
              }
            });
          }
        });
      };
    });
  };

  const add = async (storeName: string, data: any): Promise<void> => {
    if (!db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  const put = async (storeName: string, data: any): Promise<void> => {
    if (!db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  const get = async (storeName: string, key: any): Promise<any> => {
    if (!db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const getAll = async (storeName: string): Promise<any[]> => {
    if (!db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const remove = async (storeName: string, key: any): Promise<void> => {
    if (!db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  const clear = async (storeName: string): Promise<void> => {
    if (!db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  const count = async (storeName: string): Promise<number> => {
    if (!db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const query = async (
    storeName: string, 
    indexName?: string, 
    range?: IDBKeyRange
  ): Promise<any[]> => {
    if (!db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      let source: IDBObjectStore | IDBIndex = store;
      if (indexName) {
        source = store.index(indexName);
      }
      
      const request = range ? source.getAll(range) : source.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  // Bulk operations for better performance
  const bulkAdd = async (storeName: string, items: any[]): Promise<void> => {
    if (!db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      let completed = 0;
      let hasError = false;
      
      items.forEach(item => {
        const request = store.add(item);
        
        request.onsuccess = () => {
          completed++;
          if (completed === items.length && !hasError) {
            resolve();
          }
        };
        
        request.onerror = () => {
          if (!hasError) {
            hasError = true;
            reject(request.error);
          }
        };
      });
    });
  };

  const bulkPut = async (storeName: string, items: any[]): Promise<void> => {
    if (!db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      let completed = 0;
      let hasError = false;
      
      items.forEach(item => {
        const request = store.put(item);
        
        request.onsuccess = () => {
          completed++;
          if (completed === items.length && !hasError) {
            resolve();
          }
        };
        
        request.onerror = () => {
          if (!hasError) {
            hasError = true;
            reject(request.error);
          }
        };
      });
    });
  };

  return {
    db,
    isLoading,
    error,
    add,
    put,
    get,
    getAll,
    remove,
    clear,
    count,
    query,
    bulkAdd,
    bulkPut,
    initializeDB
  };
};

// Predefined database configurations for common use cases
export const jobCacheDBConfig: IndexedDBConfig = {
  dbName: 'JobLiftCache',
  version: 1,
  stores: [
    {
      name: 'jobs',
      keyPath: 'id',
      indexes: [
        { name: 'company', keyPath: 'company' },
        { name: 'location', keyPath: 'location' },
        { name: 'remote', keyPath: 'remote' },
        { name: 'posted', keyPath: 'posted' }
      ]
    },
    {
      name: 'searches',
      keyPath: 'id',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp' },
        { name: 'filters', keyPath: 'filters' }
      ]
    },
    {
      name: 'applications',
      keyPath: 'id',
      indexes: [
        { name: 'jobId', keyPath: 'jobId' },
        { name: 'status', keyPath: 'status' },
        { name: 'appliedAt', keyPath: 'appliedAt' }
      ]
    }
  ]
};

export const userDataDBConfig: IndexedDBConfig = {
  dbName: 'JobLiftUserData',
  version: 1,
  stores: [
    {
      name: 'profile',
      keyPath: 'id'
    },
    {
      name: 'resumes',
      keyPath: 'id',
      indexes: [
        { name: 'isDefault', keyPath: 'isDefault' },
        { name: 'createdAt', keyPath: 'createdAt' }
      ]
    },
    {
      name: 'settings',
      keyPath: 'key'
    }
  ]
};
