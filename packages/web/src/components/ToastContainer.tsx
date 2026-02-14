import React from "react";
import { Toast } from "../hooks/useToast";

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <div className="toast-message">
            {toast.type === "success" && "✅ "}
            {toast.type === "error" && "❌ "}
            {toast.type === "warning" && "⚠️ "}
            {toast.type === "info" && "ℹ️ "}
            {toast.message}
          </div>
          {toast.txHash && (
            <a
              href={`https://monad.com/tx/${toast.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="toast-tx-link"
            >
              View TX
            </a>
          )}
          <button
            className="toast-close"
            onClick={() => onRemove(toast.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
