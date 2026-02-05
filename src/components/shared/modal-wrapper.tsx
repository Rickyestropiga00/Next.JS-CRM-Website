import React from "react";

interface ModalWrapperProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

/**
 * Reusable modal wrapper component with backdrop and responsive styling
 * @param open - Whether the modal is visible
 * @param onClose - Callback when modal should close
 * @param children - Modal content
 * @param maxWidth - Maximum width of the modal (default: 35rem)
 */
export function ModalWrapper({
  open,
  onClose,
  children,
  maxWidth = "35rem",
}: ModalWrapperProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      {/* Modal Content */}
      <div
        className="relative z-50 w-full bg-background border rounded-lg shadow-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
        style={{ maxWidth }}
      >
        {children}
      </div>
    </div>
  );
}
