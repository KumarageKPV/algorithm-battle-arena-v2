import { X, CheckCircle2, AlertCircle } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
}

export function Toast({ message, type = "info", onClose }: ToastProps) {
  const colors = {
    success: "border-success/30 bg-success/5",
    error: "border-destructive/30 bg-destructive/5",
    info: "border-primary/30 bg-primary/5",
  };

  const icons = {
    success: <CheckCircle2 className="size-5 text-success" />,
    error: <AlertCircle className="size-5 text-destructive" />,
    info: <AlertCircle className="size-5 text-primary" />,
  };

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg border ${colors[type]} px-4 py-3 shadow-lg animate-in slide-in-from-top-2`}>
      {icons[type]}
      <p className="text-sm font-medium text-foreground">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 rounded-md p-1 hover:bg-muted transition-colors"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
