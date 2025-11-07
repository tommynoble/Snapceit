import React, { ReactNode } from 'react';

interface ContentContainerProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  headerContent?: ReactNode;
}

export const ContentContainer = ({ 
  children, 
  className = '',
  title,
  description,
  headerContent
}: ContentContainerProps) => {
  return (
    <div className={`bg-white/5 backdrop-blur-lg rounded-xl ${className}`}>
      {/* Optional Header */}
      {(title || description || headerContent) && (
        <div className="px-6 py-4 border-b border-white/5">
          <div className="flex justify-between items-center">
            <div>
              {title && (
                <h2 className="text-xl font-semibold text-white mb-1">{title}</h2>
              )}
              {description && (
                <p className="text-sm text-white/60">{description}</p>
              )}
            </div>
            {headerContent && (
              <div className="flex-shrink-0">
                {headerContent}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};
