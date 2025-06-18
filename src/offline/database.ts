import { openDB, IDBPDatabase } from "idb";

// Database schema version
const DB_VERSION = 1;

// Database name
const DB_NAME = "safespec-offline";

// Store names
const STORES = {
  INCIDENTS: "incidents",
  DOCUMENTS: "documents",
  INSPECTIONS: "inspections",
  CORRECTIVE_ACTIONS: "correctiveActions",
  SYNC_QUEUE: "syncQueue",
  OFFLINE_CACHE: "offlineCache",
};

// Initialize the database
export const initDatabase = async (): Promise<IDBPDatabase> => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.INCIDENTS)) {
        db.createObjectStore(STORES.INCIDENTS, { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains(STORES.DOCUMENTS)) {
        db.createObjectStore(STORES.DOCUMENTS, { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains(STORES.INSPECTIONS)) {
        db.createObjectStore(STORES.INSPECTIONS, { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains(STORES.CORRECTIVE_ACTIONS)) {
        db.createObjectStore(STORES.CORRECTIVE_ACTIONS, { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        db.createObjectStore(STORES.SYNC_QUEUE, {
          keyPath: "id",
          autoIncrement: true,
        });
      }

      if (!db.objectStoreNames.contains(STORES.OFFLINE_CACHE)) {
        db.createObjectStore(STORES.OFFLINE_CACHE, { keyPath: "url" });
      }
    },
  });
};

// Generic CRUD operations
export const dbOperations = {
  // Create or update an item
  async put<T>(storeName: string, item: T): Promise<T> {
    const db = await initDatabase();
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    await store.put(item);
    await tx.done;
    return item;
  },

  // Get an item by ID
  async get<T>(storeName: string, id: string): Promise<T | undefined> {
    const db = await initDatabase();
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    return store.get(id);
  },

  // Get all items from a store
  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await initDatabase();
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    return store.getAll();
  },

  // Delete an item by ID
  async delete(storeName: string, id: string): Promise<void> {
    const db = await initDatabase();
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    await store.delete(id);
    await tx.done;
  },

  // Clear all items from a store
  async clear(storeName: string): Promise<void> {
    const db = await initDatabase();
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    await store.clear();
    await tx.done;
  },

  // Count items in a store
  async count(storeName: string): Promise<number> {
    const db = await initDatabase();
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    return store.count();
  },
};

// Add an item to the sync queue
export const addToSyncQueue = async (request: {
  url: string;
  method: string;
  data?: any;
  headers?: any;
}): Promise<void> => {
  await dbOperations.put(STORES.SYNC_QUEUE, {
    ...request,
    timestamp: new Date().toISOString(),
  });
};

// Get all items from the sync queue
export const getSyncQueue = async (): Promise<any[]> => {
  return dbOperations.getAll(STORES.SYNC_QUEUE);
};

// Remove an item from the sync queue
export const removeFromSyncQueue = async (id: number): Promise<void> => {
  await dbOperations.delete(STORES.SYNC_QUEUE, id.toString());
};

// Cache a response for offline use
export const cacheResponse = async (url: string, data: any): Promise<void> => {
  await dbOperations.put(STORES.OFFLINE_CACHE, {
    url,
    data,
    timestamp: new Date().toISOString(),
  });
};

// Get cached response
export const getCachedResponse = async (
  url: string,
): Promise<any | undefined> => {
  return dbOperations.get(STORES.OFFLINE_CACHE, url);
};

// Export store names for use in other files
export { STORES };
