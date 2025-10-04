// PageContainer component for consistent page layout and structure
// Part of HIGH Priority Layout Components implementation

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';

export interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  actions?: React.ReactNode;
  loading?: boolean;
  error?: string;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  background?: 'white' | 'gray' | 'transparent';
  showHeader?: boolean;
  showFooter?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  sidebar?: React.ReactNode;
  sidebarCollapsed?: boolean;
  onBreadcrumbClick?: (breadcrumb: { label: string; href?: string }) => void;
}

const maxWidthVariants = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full'
};

const paddingVariants = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
};

const backgroundVariants = {
  white: 'bg-white',
  gray: 'bg-gray-50',
  transparent: 'bg-transparent'
};

export const PageContainer = forwardRef<HTMLDivElement, PageContainerProps>(
  (
    {
      children,
      title,
      subtitle,
      breadcrumbs,
      actions,
      loading = false,
      error,
      className,
      maxWidth = 'full',
      padding = 'md',
      background = 'white',
      showHeader = true,
      showFooter = false,
      header,
      footer,
      sidebar,
      sidebarCollapsed = false,
      onBreadcrumbClick
    },
    ref
  ) => {
    const maxWidthClass = maxWidthVariants[maxWidth];
    const paddingClass = paddingVariants[padding];
    const backgroundClass = backgroundVariants[background];

    const renderBreadcrumbs = () => {
      if (!breadcrumbs || breadcrumbs.length === 0) return null;

      return (
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          {breadcrumbs.map((breadcrumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <span className="text-gray-400">/</span>
              )}
              {breadcrumb.href ? (
                <button
                  onClick={() => onBreadcrumbClick?.(breadcrumb)}
                  className="hover:text-gray-900 transition-colors"
                >
                  {breadcrumb.label}
                </button>
              ) : (
                <span className={index === breadcrumbs.length - 1 ? 'text-gray-900 font-medium' : ''}>
                  {breadcrumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      );
    };

    const renderHeader = () => {
      if (!showHeader) return null;

      if (header) {
        return header;
      }

      if (!title && !subtitle && !breadcrumbs && !actions) {
        return null;
      }

      return (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          {renderBreadcrumbs()}
          
          {(title || subtitle || actions) && (
            <div className="flex items-center justify-between">
              <div>
                {title && (
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-gray-600">
                    {subtitle}
                  </p>
                )}
              </div>
              
              {actions && (
                <div className="flex items-center space-x-3">
                  {actions}
                </div>
              )}
            </div>
          )}
        </motion.div>
      );
    };

    const renderContent = () => {
      if (loading) {
        return (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        );
      }

      if (error) {
        return (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        );
      }

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {children}
        </motion.div>
      );
    };

    const renderFooter = () => {
      if (!showFooter) return null;

      if (footer) {
        return footer;
      }

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-8 pt-6 border-t border-gray-200"
        >
          <div className="text-center text-sm text-gray-500">
            <p>© 2024 Diet Game. All rights reserved.</p>
          </div>
        </motion.div>
      );
    };

    if (sidebar) {
      return (
        <div className="flex h-screen">
          {/* Sidebar */}
          <div className={cn(
            'flex-shrink-0',
            sidebarCollapsed ? 'w-16' : 'w-64'
          )}>
            {sidebar}
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {header && (
              <div className="flex-shrink-0">
                {header}
              </div>
            )}
            
            <main className="flex-1 overflow-y-auto">
              <div
                ref={ref}
                className={cn(
                  'h-full',
                  maxWidthClass,
                  paddingClass,
                  backgroundClass,
                  'mx-auto',
                  className
                )}
              >
                {renderHeader()}
                {renderContent()}
                {renderFooter()}
              </div>
            </main>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'min-h-screen',
          maxWidthClass,
          paddingClass,
          backgroundClass,
          'mx-auto',
          className
        )}
      >
        {renderHeader()}
        {renderContent()}
        {renderFooter()}
      </div>
    );
  }
);

PageContainer.displayName = 'PageContainer';

// Specialized Page Container Variants
export interface DashboardPageProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const DashboardPage = forwardRef<HTMLDivElement, DashboardPageProps>(
  ({ children, title, subtitle, actions, className }, ref) => {
    return (
      <PageContainer
        ref={ref}
        title={title}
        subtitle={subtitle}
        actions={actions}
        maxWidth="full"
        padding="lg"
        background="gray"
        className={className}
      >
        {children}
      </PageContainer>
    );
  }
);

DashboardPage.displayName = 'DashboardPage';

export interface ContentPageProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  actions?: React.ReactNode;
  className?: string;
}

export const ContentPage = forwardRef<HTMLDivElement, ContentPageProps>(
  ({ children, title, subtitle, breadcrumbs, actions, className }, ref) => {
    return (
      <PageContainer
        ref={ref}
        title={title}
        subtitle={subtitle}
        breadcrumbs={breadcrumbs}
        actions={actions}
        maxWidth="2xl"
        padding="lg"
        background="white"
        className={className}
      >
        {children}
      </PageContainer>
    );
  }
);

ContentPage.displayName = 'ContentPage';

export interface ModalPageProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const ModalPage = forwardRef<HTMLDivElement, ModalPageProps>(
  ({ children, title, subtitle, actions, className }, ref) => {
    return (
      <PageContainer
        ref={ref}
        title={title}
        subtitle={subtitle}
        actions={actions}
        maxWidth="md"
        padding="md"
        background="white"
        showHeader={false}
        showFooter={false}
        className={className}
      >
        {children}
      </PageContainer>
    );
  }
);

ModalPage.displayName = 'ModalPage';

export default PageContainer;
