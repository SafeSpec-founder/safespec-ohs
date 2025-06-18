import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { syncPendingData, getPendingSyncCount } from "../services/syncService";
import { useOnlineStatus } from "../hooks/useHooks";
import { logger } from "../utils/logger";

interface OfflineContextType {
  isOnline: boolean;
  isOffline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  pendingSyncCount: number;
  manualSync: () => Promise<boolean>;
  queueAction: (action: any) => void;
}

const defaultOfflineContext: OfflineContextType = {
  isOnline: navigator.onLine,
  isOffline: !navigator.onLine,
  isSyncing: false,
  lastSyncTime: null,
  pendingSyncCount: 0,
  manualSync: async () => false,
  queueAction: () => {},
};

export const OfflineContext = createContext<OfflineContextType>(
  defaultOfflineContext,
);

export const useOffline = () => useContext(OfflineContext);

interface OfflineProviderProps {
  children: ReactNode;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({
  children,
}) => {
  const isOnline = useOnlineStatus();
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  // Sync data function (move this above useEffect and wrap in useCallback)
  const syncData = React.useCallback(async () => {
    if (!isOnline || isSyncing) return;
    setIsSyncing(true);
    try {
      await syncPendingData();
      const now = Date.now();
      localStorage.setItem("lastSyncTime", now.toString());
      setLastSyncTime(new Date(now));
      const pendingCount = await getPendingSyncCount();
      setPendingSyncCount(pendingCount);
    } catch (error) {
      console.error("Error during automatic sync:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing]);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && !isSyncing && pendingSyncCount > 0) {
      syncData();
    }
  }, [isOnline, isSyncing, pendingSyncCount, syncData]);

  // Manual sync trigger
  const manualSync = async (): Promise<boolean> => {
    if (!isOnline || isSyncing) return false;

    setIsSyncing(true);

    try {
      await syncPendingData();

      // Update last sync time
      const now = Date.now();
      localStorage.setItem("lastSyncTime", now.toString());
      setLastSyncTime(new Date(now));

      // Update pending count
      const pendingCount = await getPendingSyncCount();
      setPendingSyncCount(pendingCount);

      return true;
    } catch (error) {
      console.error("Error during manual sync:", error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  const value = {
    isOnline,
    isOffline: !isOnline,
    isSyncing,
    lastSyncTime,
    pendingSyncCount,
    manualSync,
    queueAction: (action: any) => {
      // Queue action for offline sync
      logger.info("Queueing action for offline sync:", action);
    },
  };

  return (
    <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>
  );
};
