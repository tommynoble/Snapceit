import React, { ReactNode } from 'react';

interface PageTemplateProps {
  title: string;
  description: string;
  children: ReactNode;
  actionButton?: ReactNode;
}

export const PageTemplate = ({ 
  title, 
  description, 
  children,
  actionButton 
}: PageTemplateProps) => {
  return (
    <div className="space-y-4">
      <div className="px-6">
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <p className="text-white/70">{description}</p>
        {actionButton && (
          <div className="mt-4">
            {actionButton}
          </div>
        )}
      </div>

      <div className="space-y-6 px-6">
        {children}
      </div>
    </div>
  );
};
