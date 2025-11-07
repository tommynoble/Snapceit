import React, { ReactNode } from 'react';
import { api } from '../../utils/api';

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
  const testConnection = async () => {
    try {
      const result = await api.test.check();
      alert(JSON.stringify(result, null, 2));
    } catch (error) {
      alert('Error: ' + error);
    }
  };

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

      <div>
        <button 
          onClick={testConnection}
          style={{
            padding: '10px 20px',
            margin: '20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Server Connection
        </button>
      </div>
    </div>
  );
};
