import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Custom hook to detect online/offline status
 * @returns {boolean} Current online status
 */
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
};

/**
 * Custom hook to manage form state with validation
 * @param {Object} initialValues - Initial form values
 * @param {Function} validate - Validation function
 * @returns {Object} Form state and handlers
 */
export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  validate?: (values: T) => Record<string, string>,
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isSubmitting) {
      const noErrors = Object.keys(errors).length === 0;
      if (noErrors) {
        setIsSubmitting(false);
      } else {
        setIsSubmitting(false);
      }
    }
  }, [errors, isSubmitting]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value,
    });
  };

  const handleBlur = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true,
    });

    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
    }
  };

  const handleSubmit =
    (callback: (values: T) => void) => (e: React.FormEvent) => {
      e.preventDefault();

      if (validate) {
        const validationErrors = validate(values);
        setErrors(validationErrors);
        setTouched(
          Object.keys(values).reduce((acc: Record<string, boolean>, key) => {
            acc[key] = true;
            return acc;
          }, {}),
        );

        if (Object.keys(validationErrors).length === 0) {
          setIsSubmitting(true);
          callback(values);
        }
      } else {
        setIsSubmitting(true);
        callback(values);
      }
    };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues,
  };
};

/**
 * Custom hook to handle API requests with loading and error states
 * @param {Function} apiFunction - The API function to call
 * @returns {Object} Request state and execute function
 */
export const useApiRequest = (
  apiFunction: (...args: any[]) => Promise<any>,
) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (...args: any[]) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err: any) {
      setError(err.message || "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, execute };
};

/**
 * Custom hook to handle local storage with automatic JSON parsing/stringifying
 * @param {string} key - Storage key
 * @param {any} initialValue - Initial value
 * @returns {Array} [storedValue, setValue] pair
 */
export const useLocalStorage = (key: string, initialValue: any) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: any) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

/**
 * Custom hook to handle debounced values
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} Debounced value
 */
export const useDebounce = (value: string, delay: number): string => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Custom hook to handle media queries
 * @param {string} query - Media query string
 * @returns {boolean} Whether the media query matches
 */
export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
};

/**
 * Custom hook to handle permissions
 * @param {string} role - User role
 * @param {Array} requiredPermissions - Required permissions
 * @returns {boolean} Whether the user has the required permissions
 */
export const usePermissions = (
  role: keyof typeof roles,
  requiredPermissions: string[] = [],
) => {
  // Role-based permission mapping
  const rolePermissions = {
    admin: [
      "read",
      "write",
      "delete",
      "manage_users",
      "manage_settings",
      "approve",
      "export",
    ],
    manager: ["read", "write", "approve", "export"],
    staff: ["read", "write"],
    viewer: ["read"],
  };

  const hasPermission = (permission: string) => {
    if (!role || !rolePermissions[role]) return false;
    return rolePermissions[role].includes(permission);
  };

  const hasAllPermissions = requiredPermissions.every(hasPermission);

  return {
    hasPermission,
    hasAllPermissions,
  };
};

/**
 * Custom hook to handle notifications
 * @returns {Object} Notification state and handlers
 */
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<
    { id: string; message?: string; read?: boolean }[]
  >([]);

  const addNotification = (notification: { message: string }) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { ...notification, id, read: false }]);
    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true })),
    );
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
  };
};

/**
 * Custom hook to handle offline data synchronization
 * @param {string} entityType - Type of entity to sync
 * @param {Function} syncFunction - Function to call for syncing
 * @returns {Object} Sync state and handlers
 */
export const useOfflineSync = (
  entityType: string,
  syncFunction: (changes: any[]) => Promise<void>,
) => {
  const isOnline = useOnlineStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<any[]>([]);

  // Load pending changes from IndexedDB
  useEffect(() => {
    const loadPendingChanges = async () => {
      try {
        // This would be implemented with actual IndexedDB code
        const storedChanges = localStorage.getItem(
          `${entityType}_pending_changes`,
        );
        if (storedChanges) {
          setPendingChanges(JSON.parse(storedChanges));
        }
      } catch (error) {
        console.error("Error loading pending changes:", error);
      }
    };

    loadPendingChanges();
  }, [entityType]);

  // Attempt to sync when coming back online
  useEffect(() => {
    if (isOnline && pendingChanges.length > 0 && !isSyncing) {
      syncPendingChanges();
    }
  }, [isOnline, pendingChanges]);

  const addPendingChange = (change: any) => {
    const updatedChanges = [
      ...pendingChanges,
      { ...change, id: Date.now().toString() },
    ];
    setPendingChanges(updatedChanges);
    localStorage.setItem(
      `${entityType}_pending_changes`,
      JSON.stringify(updatedChanges),
    );
  };

  const syncPendingChanges = async () => {
    if (!isOnline || pendingChanges.length === 0) return;

    setIsSyncing(true);
    try {
      await syncFunction(pendingChanges);
      setPendingChanges([]);
      localStorage.removeItem(`${entityType}_pending_changes`);
      setLastSyncTime(new Date().toISOString());
    } catch (error) {
      console.error("Error syncing pending changes:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    syncPendingChanges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSyncing]);

  return {
    isOnline,
    isSyncing,
    lastSyncTime,
    pendingChanges,
    addPendingChange,
    syncPendingChanges,
  };
};

const debounce = (value: string, delay: number): void => {
  // Ensure parameters have explicit types
};

const searchQuery = (query: string): void => {
  // Ensure query has explicit type
};

const roles = {
  admin: ["read", "write"],
  manager: ["read"],
  staff: ["read"],
  viewer: ["read"],
};

const checkPermission = (
  role: keyof typeof roles,
  permission: string,
): boolean => {
  return roles[role]?.includes(permission) || false; // Fix indexing error
};

const handleNotification = (notification: { id: string; message: string }) => {
  // Ensure notification parameter has explicit type
};

const updateState = (id: string) => {
  // Ensure id parameter has explicit type
};
