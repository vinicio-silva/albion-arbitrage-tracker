import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div style={{ width: '100%', marginBottom: '16px' }}>
        {label && <label className="label-base">{label}</label>}
        <input 
          ref={ref}
          className={`input-base ${className}`}
          style={{ borderColor: error ? 'var(--danger)' : undefined }}
          {...props} 
        />
        {error && <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
