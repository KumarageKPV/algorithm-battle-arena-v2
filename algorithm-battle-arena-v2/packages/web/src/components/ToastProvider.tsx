"use client";

import React, { useState, useCallback, useEffect } from "react";
import { ToastContext, ToastType } from "@/hooks/useToast";
import { X } from "lucide-react";

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

const typeStyles: Record<ToastType, string> = {
  success: "border-green-500 bg-green-500/10 text-green-400",
  error: "border-red-500 bg-red-500/10 text-red-400",
  info: "border-blue-500 bg-blue-500/10 text-blue-400",
  warning: "border-arena-orange bg-arena-orange/10 text-arena-orange",
};

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  let counter = 0;

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = ++counter;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const remove = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const value = {
    success: (msg: string) => addToast("success", msg),
    error: (msg: string) => addToast("error", msg),
    info: (msg: string) => addToast("info", msg),
    warning: (msg: string) => addToast("warning", msg),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container - bottom center */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 max-w-md w-full px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-in slide-in-from-bottom-2 border rounded-lg px-4 py-3 flex items-center gap-3 shadow-xl backdrop-blur ${typeStyles[t.type]}`}
          >
            <span className="flex-1 text-sm font-medium">{t.message}</span>
            <button onClick={() => remove(t.id)} className="opacity-60 hover:opacity-100 transition-opacity">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

