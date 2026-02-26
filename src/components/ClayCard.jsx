import React from 'react';

export default function ClayCard({ children, className = '', color = 'lavender' }) {
  const colorClasses = {
    lavender: 'bg-gradient-to-br from-purple-100 to-purple-50',
    mint: 'bg-gradient-to-br from-green-100 to-green-50',
    blue: 'bg-gradient-to-br from-blue-100 to-blue-50',
    pink: 'bg-gradient-to-br from-pink-100 to-pink-50',
    yellow: 'bg-gradient-to-br from-yellow-100 to-yellow-50',
    white: 'bg-gradient-to-br from-gray-50 to-white'
  };

  return (
    <div 
      className={`
        ${colorClasses[color]}
        rounded-[20px] p-6
        shadow-[8px_8px_16px_rgba(163,177,198,0.3),-8px_-8px_16px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(255,255,255,0.5)]
        ${className}
      `}
      style={{
        boxShadow: '8px 8px 16px rgba(163, 177, 198, 0.3), -8px -8px 16px rgba(255, 255, 255, 0.8), inset 2px 2px 4px rgba(255, 255, 255, 0.5)'
      }}
    >
      {children}
    </div>
  );
}