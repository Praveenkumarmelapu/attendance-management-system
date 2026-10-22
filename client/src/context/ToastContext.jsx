/**
 * context/ToastContext.jsx — Institutional Pop-up & Toast Notification System
 * Provides global toast messages and clean confirmation pop-ups across all dashboards
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);

  // Add a toast pop-up
  const addToast = useCallback((message, type = 'success', title = null, duration = 3800) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, title }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Quick helper methods
  const toast = {
    success: (msg, title = 'Success') => addToast(msg, 'success', title),
    error: (msg, title = 'Error') => addToast(msg, 'error', title),
    warning: (msg, title = 'Attention') => addToast(msg, 'warning', title),
    info: (msg, title = 'Notice') => addToast(msg, 'info', title),
  };

  // Pop-up confirmation dialog (replaces browser window.confirm)
  const confirm = useCallback(({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', isDestructive = false, onConfirm }) => {
    setConfirmDialog({
      title,
      message,
      confirmText,
      cancelText,
      isDestructive,
      onConfirm: async () => {
        setConfirmDialog(null);
        if (onConfirm) await onConfirm();
      },
      onCancel: () => setConfirmDialog(null),
    });
  }, []);

  return (
    <ToastContext.Provider value={{ toast, confirm }}>
      {children}

      {/* Floating Pop-up Toast Container */}
      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => {
          const icons = {
            success: <CheckCircle2 size={18} className="toast-icon-svg success" />,
            error: <XCircle size={18} className="toast-icon-svg error" />,
            warning: <AlertTriangle size={18} className="toast-icon-svg warning" />,
            info: <Info size={18} className="toast-icon-svg info" />,
          };

          return (
            <div key={t.id} className={`toast-popup ${t.type}`} role="alert">
              <div className="toast-icon-box">{icons[t.type] || icons.info}</div>
              <div className="toast-content">
                {t.title && <div className="toast-title">{t.title}</div>}
                <div className="toast-message">{t.message}</div>
              </div>
              <button
                type="button"
                className="toast-close-btn"
                onClick={() => removeToast(t.id)}
                aria-label="Close notification"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal Pop-up */}
      {confirmDialog && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && confirmDialog.onCancel()}
        >
          <div className="modal" style={{ maxWidth: '440px', padding: '24px' }}>
            <div className="modal-header" style={{ marginBottom: '14px', border: 'none', padding: 0 }}>
              <h3 className="modal-title" style={{ fontSize: '1.15rem' }}>
                {confirmDialog.title || 'Confirm Action'}
              </h3>
              <button
                type="button"
                className="modal-close"
                onClick={confirmDialog.onCancel}
              >
                <X size={16} />
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '22px' }}>
              {confirmDialog.message}
            </p>

            <div className="modal-footer" style={{ border: 'none', padding: 0, margin: 0 }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={confirmDialog.onCancel}
              >
                {confirmDialog.cancelText}
              </button>
              <button
                type="button"
                className={`btn ${confirmDialog.isDestructive ? 'btn-danger' : 'btn-primary'}`}
                onClick={confirmDialog.onConfirm}
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .toast-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          z-index: 9999;
          pointer-events: none;
          max-width: 400px;
          width: 100%;
        }

        .toast-popup {
          pointer-events: auto;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          background-color: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.6);
          animation: slideUpToast 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          color: var(--text-primary);
        }

        .toast-popup.success {
          border-left: 4px solid var(--success);
        }

        .toast-popup.error {
          border-left: 4px solid var(--danger);
        }

        .toast-popup.warning {
          border-left: 4px solid var(--warning);
        }

        .toast-popup.info {
          border-left: 4px solid var(--primary);
        }

        .toast-icon-box {
          margin-top: 1px;
          flex-shrink: 0;
        }

        .toast-icon-svg.success { color: var(--success); }
        .toast-icon-svg.error { color: var(--danger); }
        .toast-icon-svg.warning { color: var(--warning); }
        .toast-icon-svg.info { color: var(--primary); }

        .toast-content {
          flex: 1;
        }

        .toast-title {
          font-size: 0.84rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .toast-message {
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .toast-close-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 3px;
          border-radius: var(--radius-xs);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color var(--transition-fast);
        }

        .toast-close-btn:hover {
          color: var(--text-primary);
        }

        @keyframes slideUpToast {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
