import { useState, useEffect, useCallback, useMemo } from "react";
import { useAppSelector, useAppDispatch } from "@store/index";

/**
 * Custom hook for API calls with loading and error states
 * @param apiFunction The API function to call
 * @param dependencies Dependencies array for useEffect
 * @returns Object with data, loading, error, and refetch function
 */
export const useApiCall = <T>(
  apiFunction: () => Promise<T>,
  dependencies: any[] = [],
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};

/**
 * Custom hook for managing pagination
 * @param initialPage Initial page number
 * @param initialLimit Initial items per page
 * @returns Pagination state and handlers
 */
export const usePagination = (initialPage = 1, initialLimit = 10) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / limit);

  const goToPage = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setPage(newPage);
      }
    },
    [totalPages],
  );

  const nextPage = useCallback(() => {
    goToPage(page + 1);
  }, [page, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(page - 1);
  }, [page, goToPage]);

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  }, []);

  return {
    page,
    limit,
    total,
    totalPages,
    setTotal,
    goToPage,
    nextPage,
    prevPage,
    changeLimit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

/**
 * Custom hook for managing search and filters
 * @param initialFilters Initial filter values
 * @returns Filter state and handlers
 */
export const useFilters = <T extends Record<string, any>>(
  initialFilters: T,
) => {
  const [filters, setFilters] = useState<T>(initialFilters);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const updateFilter = useCallback((key: keyof T, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setSearchTerm("");
  }, [initialFilters]);

  const clearFilter = useCallback(
    (key: keyof T) => {
      setFilters((prev) => ({ ...prev, [key]: initialFilters[key] }));
    },
    [initialFilters],
  );

  return {
    filters,
    searchTerm,
    setSearchTerm,
    updateFilter,
    resetFilters,
    clearFilter,
  };
};

/**
 * Custom hook for managing modal/dialog state
 * @param initialOpen Initial open state
 * @returns Modal state and handlers
 */
export const useModal = (initialOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle };
};

/**
 * Custom hook for debouncing values
 * @param value Value to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced value
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

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
 * Custom hook for local storage with state synchronization
 * @param key Storage key
 * @param initialValue Initial value
 * @returns Value, setter, and remove function
 */
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue],
  );

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
};

/**
 * Custom hook for managing async operations with Redux
 * @param asyncAction Redux async action
 * @returns Loading state and action dispatcher
 */
export const useAsyncAction = (asyncAction: any) => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async (...args: any[]) => {
      try {
        setIsLoading(true);
        const result = await dispatch(asyncAction(...args));
        return result;
      } catch (error) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, asyncAction],
  );

  return { execute, isLoading };
};

/**
 * Custom hook for permission checking
 * @param permission Permission to check
 * @returns Boolean indicating if user has permission
 */
export const usePermission = (permission: string): boolean => {
  const user = useAppSelector((state) => state.auth.user);

  return useMemo(() => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  }, [user, permission]);
};
