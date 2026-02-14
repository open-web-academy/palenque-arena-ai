import { useState, useCallback } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  txHash?: string;
}

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback(
    (message: string, type: ToastType = "info", duration = 4000, txHash?: string) => {
      const id = `toast-${++toastId}`;
      const toast: Toast = { id, message, type, duration, txHash };

      setToasts(prev => [...prev, toast]);

      if (duration > 0) {
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
      }

      return id;
    },
    []
  );

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback(
    (message: string, duration?: number, txHash?: string) =>
      show(message, "success", duration, txHash),
    [show]
  );

  const error = useCallback(
    (message: string, duration?: number) => show(message, "error", duration),
    [show]
  );

  const info = useCallback(
    (message: string, duration?: number) => show(message, "info", duration),
    [show]
  );

  const warning = useCallback(
    (message: string, duration?: number) => show(message, "warning", duration),
    [show]
  );

  return { toasts, show, remove, success, error, info, warning };
}
