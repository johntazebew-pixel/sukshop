'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
  variant = 'danger',
}: ConfirmDialogProps) {
  const [internalLoading, setInternalLoading] = useState(false);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading && !internalLoading) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, isLoading, internalLoading, onCancel]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const loading = isLoading || internalLoading;

  const variantStyles = {
    danger: {
      iconBg: 'bg-destructive/10',
      iconColor: 'text-destructive',
      buttonBg: 'bg-destructive hover:bg-destructive/90',
    },
    warning: {
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      buttonBg: 'bg-amber-600 hover:bg-amber-700',
    },
    info: {
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      buttonBg: 'bg-primary hover:bg-primary/90',
    },
  };

  const styles = variantStyles[variant];

  const handleConfirm = async () => {
    setInternalLoading(true);
    try {
      await onConfirm();
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => !loading && onCancel()}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl pointer-events-auto animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={() => !loading && onCancel()}
            disabled={loading}
            className="absolute top-4 right-4 h-8 w-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>

          <div className="p-6">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div
                className={`h-14 w-14 rounded-full ${styles.iconBg} flex items-center justify-center`}
              >
                <AlertTriangle className={`h-7 w-7 ${styles.iconColor}`} />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-center mb-2">{title}</h3>

            {/* Message */}
            <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
              {message}
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="flex-1 rounded-xl h-11 border-2 border-primary/20 font-semibold text-sm"
              >
                {cancelText}
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className={`flex-1 rounded-xl h-11 ${styles.buttonBg} text-white font-semibold text-sm`}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  confirmText
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}