import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initializeOfflineSync, syncPendingData, getPendingSyncCount } from '../services/syncService';
import { useOnlineStatus } from '../hooks/useHooks';

interface OfflineContextType {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  pendingSyncCount: number;
  manualSync: () => Promise<boolean>;
}

const defaultOfflineContext: OfflineContextType = {
  isOnline: navigator.onLine,
  isSyncing: false,
  lastSyncTime: null,
  pendingSyncCount: 0,
  manualSync: async () => false,
};

export const OfflineContext = createContext<OfflineContextType>(defaultOfflineContext);

export const useOffline = () => useContext(OfflineContext);

interface OfflineProviderProps {
  children: ReactNode;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  const isOnline = useOnlineStatus();
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  // Initialize offline sync and load pending count
  useEffect(() => {
    const initializeSync = async () => {
      try {
        await initializeOfflineSync();
        const pendingCount = await getPendingSyncCount();
        setPendingSyncCount(pendingCount);
        
        const lastSync = localStorage.getItem('lastSyncTime');
        if (lastSync) {
          setLastSyncTime(new Date(parseInt(lastSync, 10)));
        }
      } catch (error) {
        console.error('Failed to initialize offline sync:', error);
      }
    };

    initializeSync();
  }, []);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && !isSyncing && pendingSyncCount > 0) {
      syncData();
    }
  }, [isOnline, isSyncing, pendingSyncCount]);

  // Sync data function
  const syncData = async () => {
    if (!isOnline || isSyncing) return;
    
    setIsSyncing(true);
    
    try {
      await syncPendingData();
      
      // Update last sync time
      const now = Date.now();
      localStorage.setItem('lastSyncTime', now.toString());
      setLastSyncTime(new Date(now));
      
      // Update pending count
      const pendingCount = await getPendingSyncCount();
      setPendingSyncCount(pendingCount);
    } catch (error) {
      console.error('Error during automatic sync:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Manual sync trigger
  const manualSync = async (): Promise<boolean> => {
    if (!isOnline || isSyncing) return false;
    
    setIsSyncing(true);
    
    try {
      await syncPendingData();
      
      // Update last sync time
      const now = Date.now();
      localStorage.setItem('lastSyncTime', now.toString());
      setLastSyncTime(new Date(now));
      
      // Update pending count
      const pendingCount = await getPendingSyncCount();
      setPendingSyncCount(pendingCount);
      
      return true;
    } catch (error) {
      console.error('Error during manual sync:', error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  const value = {
    isOnline,
    isSyncing,
    lastSyncTime,
    pendingSyncCount,
    manualSync,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};

