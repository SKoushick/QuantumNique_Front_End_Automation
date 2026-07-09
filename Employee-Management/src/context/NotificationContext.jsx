/**
 * Notification/Toast Context — global toast notifications
 */

import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

let toastId = 0;

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
    return id;
  }, [removeToast]);

  const success = useCallback((msg, d) => addToast(msg, 'success', d), [addToast]);
  const error   = useCallback((msg, d) => addToast(msg, 'error', d), [addToast]);
  const warning = useCallback((msg, d) => addToast(msg, 'warning', d), [addToast]);
  const info    = useCallback((msg, d) => addToast(msg, 'info', d), [addToast]);

  return (
    <NotificationContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used inside NotificationProvider');
  return ctx;
};
