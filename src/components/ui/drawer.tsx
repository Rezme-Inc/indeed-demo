import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: 'left' | 'right' | 'bottom';
}

export function Drawer({ isOpen, onClose, children, position = 'left' }: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const positionClasses = {
    left: 'left-0 top-0 h-full max-w-drawer animate-slide-in',
    right: 'right-0 top-0 h-full max-w-drawer translate-x-full',
    bottom: 'bottom-0 left-0 w-full h-[80vh] translate-y-full',
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity"
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={drawerRef}
        className={`fixed bg-white shadow-xl ${positionClasses[position]}`}
      >
        <div className="h-full overflow-y-auto">
          <div className="flex justify-end p-4">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close drawer"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="px-4 pb-4">{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
} 