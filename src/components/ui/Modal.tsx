// Modal component following docs/ui-components/modals.md
// EARS-UI-021 through EARS-UI-025 implementation

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils/helpers';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'centered' | 'bottom-sheet';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
}

const sizeVariants = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4'
};

const variantVariants = {
  default: 'mx-auto my-8',
  centered: 'mx-auto my-auto',
  'bottom-sheet': 'mx-0 mb-0 mt-auto rounded-t-xl'
};

const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

const modalVariants = {
  default: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 }
  },
  'bottom-sheet': {
    initial: { opacity: 0, y: '100%' },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: '100%' }
  }
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  variant = 'default',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
  overlayClassName,
  contentClassName
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // Handle focus trap
  useEffect(() => {
    if (!isOpen) return;

    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    firstElement?.focus();
    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const overlayClasses = cn(
    'fixed inset-0 z-50 flex items-center justify-center',
    'bg-black bg-opacity-50 backdrop-blur-sm',
    overlayClassName
  );

  const modalClasses = cn(
    'relative bg-white rounded-lg shadow-xl',
    'w-full max-h-[90vh] overflow-hidden',
    sizeVariants[size],
    variantVariants[variant],
    className
  );

  const contentClasses = cn(
    'p-6 overflow-y-auto max-h-[calc(90vh-3rem)]',
    contentClassName
  );

  const currentVariants = modalVariants[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={overlayClasses}
          variants={overlayVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2 }}
          onClick={handleOverlayClick}
        >
          <motion.div
            ref={modalRef}
            className={modalClasses}
            variants={currentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            aria-describedby={description ? 'modal-description' : undefined}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex-1">
                  {title && (
                    <h2
                      id="modal-title"
                      className="text-xl font-semibold text-gray-900"
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p
                      id="modal-description"
                      className="mt-1 text-sm text-gray-600"
                    >
                      {description}
                    </p>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className={contentClasses}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Modal sub-components
export interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ children, className }) => (
  <div className={cn('mb-4', className)}>
    {children}
  </div>
);

export interface ModalTitleProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const ModalTitle: React.FC<ModalTitleProps> = ({ 
  children, 
  className, 
  as: Component = 'h2' 
}) => (
  <Component className={cn('text-xl font-semibold text-gray-900', className)}>
    {children}
  </Component>
);

export interface ModalDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalDescription: React.FC<ModalDescriptionProps> = ({ children, className }) => (
  <p className={cn('text-sm text-gray-600 mt-1', className)}>
    {children}
  </p>
);

export interface ModalContentProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalContent: React.FC<ModalContentProps> = ({ children, className }) => (
  <div className={cn('text-gray-700', className)}>
    {children}
  </div>
);

export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({ children, className }) => (
  <div className={cn('flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200', className)}>
    {children}
  </div>
);

export default Modal;
