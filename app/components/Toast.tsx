"use client";

import React, { useState, useEffect } from "react";
import { RiCheckLine, RiCloseLine } from "react-icons/ri";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  show: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({
  message,
  type,
  show,
  onClose,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  const typeStyles = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    info: "bg-[var(--bronzer)] text-white",
  };

  const icons = {
    success: <RiCheckLine size={20} />,
    error: <RiCloseLine size={20} />,
    info: <RiCheckLine size={20} />,
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${typeStyles[type]}`}
      >
        {icons[type]}
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 hover:opacity-75 transition-opacity"
          aria-label="Close notification"
        >
          <RiCloseLine size={16} />
        </button>
      </div>
    </div>
  );
}

// Hook for managing toast state
export function useToast() {
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
    show: boolean;
  }>({
    message: "",
    type: "info",
    show: false,
  });

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setToast({ message, type, show: true });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  return {
    toast,
    showToast,
    hideToast,
  };
}
