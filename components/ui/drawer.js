'use client';
import { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { Button } from './button';

/**
 * Reusable accessible drawer using native <dialog>
 * Handles focus trapping, Escape to close, and backdrop click natively.
 */
export function Drawer({ isOpen, onClose, children, side = 'left' }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    
    if (isOpen && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = 'hidden'; // Ensure strict scroll lock
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = () => {
    document.body.style.overflow = '';
    onClose();
  };
  
  const handleBackdropClick = (e) => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const rect = dialog.getBoundingClientRect();
    const isInDialog = (
      rect.top <= e.clientY && e.clientY <= rect.bottom &&
      rect.left <= e.clientX && e.clientX <= rect.right
    );
    if (!isInDialog) {
      dialog.close();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      onClick={handleBackdropClick}
      className={cn(
        "fixed m-0 h-full max-h-screen max-w-[80vw] w-72 bg-surface-elevated text-foreground shadow-xl backdrop:bg-black/60 backdrop:backdrop-blur-sm focus-visible:outline-none",
        side === 'left' ? "left-0 right-auto" : "left-auto right-0"
      )}
    >
      <div className="flex h-full flex-col">
        {children}
      </div>
    </dialog>
  );
}
