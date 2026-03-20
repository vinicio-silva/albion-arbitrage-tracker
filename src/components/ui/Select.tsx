import React, { SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  label: string;
  value: string | number;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, className = '', ...props }, ref) => {
    return (
      <div style={{ width: '100%', marginBottom: '16px', position: 'relative' }}>
        {label && <label className="label-base">{label}</label>}
        <div style={{ position: 'relative' }}>
          <select 
            ref={ref}
            className={`input-base ${className}`}
            style={{ appearance: 'none', paddingRight: '32px', cursor: 'pointer' }}
            {...props}
          >
            <option value="" disabled>Select...</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown 
            size={16} 
            style={{ 
              position: 'absolute', 
              right: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: 'var(--text-muted)',
              pointerEvents: 'none'
            }} 
          />
        </div>
      </div>
    );
  }
);
Select.displayName = 'Select';
