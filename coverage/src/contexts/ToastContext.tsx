import React, { createContext, useState, useContext, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import Toast, { ToastProps } from "../components/Toast";

// Define the shape of a toast notification
export interface ToastNotification extends ToastProps {
  id: string;
}

// Define the shape of the toast context
interface ToastContextType {
  toasts: ToastNotification[];
  addToast: (toast: Omit<ToastNotification, "id">) => void;
  removeToast: (id: string) => void;
}

// Create the context with a default value
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Provider component
export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Add a new toast
  const addToast = (toast: Omit<ToastNotification, "id">) => {
    try {
      const newToast = { ...toast, id: uuidv4() };
      setToasts((prevToasts) => [...prevToasts, newToast]);

      // Auto-remove toast after 5 seconds (or custom duration)
      setTimeout(() => {
        removeToast(newToast.id);
      }, toast.duration || 5000);
    } catch (error) {
      console.error("Error adding toast:", error);
    }
  };

  // Remove a toast by ID
  const removeToast = (id: string) => {
    try {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    } catch (error) {
      console.error("Error removing toast:", error);
    }
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Custom hook to use the toast context
export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export default ToastContext;
