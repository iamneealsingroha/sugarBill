import React from 'react';

export default function ClayButton({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  className = '',
  type = 'button'
}) {
  const variants = {
    primary: 'bg-gradient-to-br from-purple-200 to-purple-100 text-purple-900 hover:from-purple-300 hover:to-purple-200',
    success: 'bg-gradient-to-br from-green-200 to-green-100 text-green-900 hover:from-green-300 hover:to-green-200',
    danger: 'bg-gradient-to-br from-red-200 to-red-100 text-red-900 hover:from-red-300 hover:to-red-200',
    info: 'bg-gradient-to-br from-blue-200 to-blue-100 text-blue-900 hover:from-blue-300 hover:to-blue-200',
    warning: 'bg-gradient-to-br from-yellow-200 to-yellow-100 text-yellow-900 hover:from-yellow-300 hover:to-yellow-200'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        rounded-[16px] font-semibold
        transition-all duration-200
        shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.9)]
        active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  );
}