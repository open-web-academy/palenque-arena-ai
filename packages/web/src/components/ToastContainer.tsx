import React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { Toast } from "../hooks/useToast";

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

function ToastIcon({ type }: { type: Toast["type"] }) {
  switch (type) {
    case "success": return <CheckCircle className="w-5 h-5 text-emerald" />;
    case "error": return <AlertCircle className="w-5 h-5 text-arena-red" />;
    case "warning": return <AlertTriangle className="w-5 h-5 text-gold" />;
    case "info": return <Info className="w-5 h-5 text-blue-400" />;
  }
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            className={`toast toast-${toast.type}`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <span className="flex-shrink-0"><ToastIcon type={toast.type} /></span>
            <div className="toast-message">{toast.message}</div>
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
              type="button"
              className="toast-close"
              onClick={() => onRemove(toast.id)}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
