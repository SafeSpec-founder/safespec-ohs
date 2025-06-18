// Offline Sync Service for SafeSpec OHS Application
import { openDB } from "idb";
import { logger } from "../utils/logger";

// Database configuration
const DB_NAME = "SafeSpecOfflineDB";
const DB_VERSION = 1;
const STORE_NAME = "pendingSync";

interface SyncItem {
  id: string;
  type: "incident" | "document" | "corrective-action" | "report" | "user";
  action: "create" | "update" | "delete";
  data: any;
  timestamp: number;
  retryCount: number;
}

class SyncService {
  private syncQueue: SyncItem[] = [];
  private isOnline: boolean = navigator.onLine;
  private maxRetries = 3;
  private syncInProgress = false;

  constructor() {
    this.loadSyncQueue();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.processSyncQueue();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
    });
  }

  private loadSyncQueue() {
    try {
      const stored = localStorage.getItem("safespec-sync-queue");
      if (stored) {
        this.syncQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load sync queue:", error);
      this.syncQueue = [];
    }
  }

  private saveSyncQueue() {
    try {
      localStorage.setItem(
        "safespec-sync-queue",
        JSON.stringify(this.syncQueue),
      );
    } catch (error) {
      console.error("Failed to save sync queue:", error);
    }
  }

  public addToSyncQueue(
    item: Omit<SyncItem, "id" | "timestamp" | "retryCount">,
  ) {
    const syncItem: SyncItem = {
      ...item,
      id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.syncQueue.push(syncItem);
    this.saveSyncQueue();

    // Try to sync immediately if online
    if (this.isOnline) {
      this.processSyncQueue();
    }

    return syncItem.id;
  }

  public async processSyncQueue(): Promise<boolean> {
    if (!this.isOnline || this.syncInProgress || this.syncQueue.length === 0) {
      return false;
    }

    this.syncInProgress = true;
    let allSuccessful = true;

    try {
      const itemsToSync = [...this.syncQueue];

      for (const item of itemsToSync) {
        try {
          const success = await this.syncItem(item);

          if (success) {
            // Remove successfully synced item
            this.syncQueue = this.syncQueue.filter(
              (queueItem) => queueItem.id !== item.id,
            );
          } else {
            // Increment retry count
            const queueItem = this.syncQueue.find(
              (queueItem) => queueItem.id === item.id,
            );
            if (queueItem) {
              queueItem.retryCount++;

              // Remove item if max retries exceeded
              if (queueItem.retryCount >= this.maxRetries) {
                console.error(
                  `Max retries exceeded for sync item ${item.id}, removing from queue`,
                );
                this.syncQueue = this.syncQueue.filter(
                  (queueItem) => queueItem.id !== item.id,
                );
              }
            }
            allSuccessful = false;
          }
        } catch (error) {
          console.error(`Error syncing item ${item.id}:`, error);
          allSuccessful = false;
        }
      }

      this.saveSyncQueue();
      return allSuccessful;
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncItem(item: SyncItem): Promise<boolean> {
    try {
      const endpoint = this.getEndpointForType(item.type);
      const url = `${endpoint}${item.action === "update" || item.action === "delete" ? `/${item.data.id}` : ""}`;

      let method: string;
      let body: string | undefined;

      switch (item.action) {
        case "create":
          method = "POST";
          body = JSON.stringify(item.data);
          break;
        case "update":
          method = "PUT";
          body = JSON.stringify(item.data);
          break;
        case "delete":
          method = "DELETE";
          break;
        default:
          throw new Error(`Unknown action: ${item.action}`);
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body,
      });

      if (response.ok) {
        logger.info(
          `Successfully synced ${item.type} ${item.action} for item ${item.id}`,
        );
        return true;
      } else {
        console.error(
          `Failed to sync item ${item.id}: ${response.status} ${response.statusText}`,
        );
        return false;
      }
    } catch (error) {
      console.error(`Error syncing item ${item.id}:`, error);
      return false;
    }
  }

  private getEndpointForType(type: string): string {
    const baseUrl = "/api";

    switch (type) {
      case "incident":
        return `${baseUrl}/incidents`;
      case "document":
        return `${baseUrl}/documents`;
      case "corrective-action":
        return `${baseUrl}/corrective-actions`;
      case "report":
        return `${baseUrl}/reports`;
      case "user":
        return `${baseUrl}/users`;
      default:
        throw new Error(`Unknown sync type: ${type}`);
    }
  }

  public getSyncQueueCount(): number {
    return this.syncQueue.length;
  }

  public clearSyncQueue() {
    this.syncQueue = [];
    this.saveSyncQueue();
  }

  public async forceSyncAll(): Promise<boolean> {
    return this.processSyncQueue();
  }
}

// Create singleton instance
const syncService = new SyncService();

// Export functions for use in components
export const initializeOfflineSync = () => {
  logger.info("Offline sync service initialized");
  return syncService;
};

export const addToSyncQueue = (
  item: Omit<SyncItem, "id" | "timestamp" | "retryCount">,
) => {
  return syncService.addToSyncQueue(item);
};

export const syncQueuedItems = () => {
  return syncService.processSyncQueue();
};

export const triggerSync = () => {
  return syncService.forceSyncAll();
};

export const getSyncQueueCount = () => {
  return syncService.getSyncQueueCount();
};

export const clearSyncQueue = () => {
  return syncService.clearSyncQueue();
};

export default syncService;

/**
 * Get the count of pending sync operations
 * @returns Promise<number> Number of pending operations
 */
export const getPendingSyncCount = async (): Promise<number> => {
  try {
    const db = await openDB(DB_NAME, DB_VERSION);
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const count = await store.count();
    return count;
  } catch (error) {
    console.error("Error getting pending sync count:", error);
    return 0;
  }
};

/**
 * Sync all pending data
 * @returns Promise<boolean> True if all data synced successfully, false otherwise
 */
export const syncPendingData = async (): Promise<boolean> => {
  // Use your existing processSyncQueue method to sync all pending items
  return syncService.processSyncQueue();
};
