import { useState } from 'react';
import { Drawer } from './drawer';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface MobileNavProps {
  children: React.ReactNode;
}

export function MobileNav({ children }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useFocusTrap(isOpen);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 text-gray-500 hover:text-gray-700"
        aria-label="Open menu"
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
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div ref={containerRef} className="flex flex-col space-y-4">
          {children}
        </div>
      </Drawer>
    </>
  );
} 