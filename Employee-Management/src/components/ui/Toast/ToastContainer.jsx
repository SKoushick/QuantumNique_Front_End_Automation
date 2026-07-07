/**
 * Toast notification component
 */

import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useNotification } from '../../../context/NotificationContext';
import './Toast.css';

const ICONS = {
  success: <CheckCircle size={18} />,
  error:   <XCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info:    <Info size={18} />,
};

function Toast({ toast }) {
  const { removeToast } = useNotification();
  return (
    <div className={`toast toast--${toast.type} toast-enter`} role="alert" aria-live="polite">
      <span className="toast__icon" aria-hidden="true">{ICONS[toast.type]}</span>
      <p className="toast__message">{toast.message}</p>
      <button
        className="toast__close"
        onClick={() => removeToast(toast.id)}
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts } = useNotification();
  if (toasts.length === 0) return null;
  return (
    <div className="toast-container" aria-label="Notifications" role="region">
      {toasts.map((t) => <Toast key={t.id} toast={t} />)}
    </div>
  );
}
