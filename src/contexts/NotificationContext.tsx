import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  showSuccess: (title: string, message: string, duration?: number) => string;
  showError: (title: string, message: string, persistent?: boolean) => string;
  showWarning: (title: string, message: string, duration?: number) => string;
  showInfo: (title: string, message: string, duration?: number) => string;
}

const defaultNotificationContext: NotificationContextType = {
  notifications: [],
  addNotification: () => "",
  removeNotification: () => {},
  clearAllNotifications: () => {},
  showSuccess: () => "",
  showError: () => "",
  showWarning: () => "",
  showInfo: () => "",
};

export const NotificationContext = createContext<NotificationContextType>(
  defaultNotificationContext,
);

export const useNotification = () => useContext(NotificationContext);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const generateId = () => {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const addNotification = (notification: Omit<Notification, "id">): string => {
    const id = generateId();
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000,
    };

    setNotifications((prev) => [...prev, newNotification]);

    // Auto-remove notification after duration (unless persistent)
    if (
      !notification.persistent &&
      newNotification.duration &&
      newNotification.duration > 0
    ) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const showSuccess = (
    title: string,
    message: string,
    duration = 5000,
  ): string => {
    return addNotification({
      type: "success",
      title,
      message,
      duration,
    });
  };

  const showError = (
    title: string,
    message: string,
    persistent = false,
  ): string => {
    return addNotification({
      type: "error",
      title,
      message,
      persistent,
      duration: persistent ? 0 : 8000,
    });
  };

  const showWarning = (
    title: string,
    message: string,
    duration = 6000,
  ): string => {
    return addNotification({
      type: "warning",
      title,
      message,
      duration,
    });
  };

  const showInfo = (
    title: string,
    message: string,
    duration = 5000,
  ): string => {
    return addNotification({
      type: "info",
      title,
      message,
      duration,
    });
  };

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
export const useNotifications = () => {
  return useContext(NotificationContext);
};
