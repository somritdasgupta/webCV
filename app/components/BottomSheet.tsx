"use client";

import { useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";
import { HiX } from "react-icons/hi";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <>
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed inset-x-0 bottom-0 z-[100] transition-transform duration-300 ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="nav-shimmer bg-[var(--nav-bg)]/95 backdrop-blur-md border border-[var(--nav-border)] rounded-t-2xl shadow-2xl max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-[var(--nav-border)]">
            <h2 className="text-base lg:text-lg font-semibold text-[var(--text-primary)]">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--nav-border)] rounded-xl transition-all duration-200"
              aria-label="Close"
            >
              <HiX className="w-5 h-5 text-[var(--text-primary)]" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
