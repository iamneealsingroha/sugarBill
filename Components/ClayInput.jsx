import React from 'react';

export default function ClayInput({ 
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  min,
  step,
  icon,
  disabled
}) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
          {icon}
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        min={min}
        step={step}
        disabled={disabled}
        className={`
          w-full px-4 py-3 ${icon ? 'pl-12' : ''}
          bg-white/80
          rounded-[16px]
          border-none
          shadow-[inset_4px_4px_8px_rgba(163,177,198,0.4),inset_-4px_-4px_8px_rgba(255,255,255,1)]
          focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white
          text-gray-900 placeholder-gray-500
          transition-all duration-200
          disabled:opacity-50
          ${className}
        `}
      />
    </div>
  );
}