"use client";

import { createContext, useContext, useCallback } from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastContextType {
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
  warning: (msg: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  success: (msg) => console.log("[toast:success]", msg),
  error: (msg) => console.error("[toast:error]", msg),
  info: (msg) => console.log("[toast:info]", msg),
  warning: (msg) => console.warn("[toast:warning]", msg),
});

export function useToast() {
  return useContext(ToastContext);
}

export { ToastContext };
export type { ToastContextType, ToastType };

