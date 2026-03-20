import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';

interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  label?: string;
  options: Option[];
  value: string[];
  onChange: (val: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({ label, options, value, onChange, placeholder = "Select..." }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const removeOption = (e: React.MouseEvent, optionValue: string) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== optionValue));
  };

  return (
    <div className="multi-select-container" ref={containerRef} style={{ position: 'relative', width: '100%', marginBottom: '16px' }}>
      {label && <label className="label-base">{label}</label>}
      <div 
        className="input-base" 
        style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', minHeight: '42px', alignItems: 'center', cursor: 'pointer', paddingRight: '32px' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {value.length === 0 && <span style={{ color: 'var(--text-muted)' }}>{placeholder}</span>}
        {value.map(val => {
          const opt = options.find(o => o.value === val);
          return (
            <span key={val} style={{ background: 'var(--accent-primary)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {opt?.label || val}
              <X size={12} onClick={(e) => removeOption(e, val)} style={{ cursor: 'pointer' }} />
            </span>
          );
        })}
        <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
      </div>

      {isOpen && (
        <div className="glass-panel" style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 50, maxHeight: '200px', overflowY: 'auto', padding: '4px' }}>
          {options.map(opt => {
            const isSelected = value.includes(opt.value);
            return (
              <div 
                key={opt.value} 
                onClick={() => toggleOption(opt.value)}
                style={{ 
                  padding: '8px 12px', 
                  borderRadius: 'var(--radius-sm)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  cursor: 'pointer', 
                  background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                  fontWeight: isSelected ? 500 : 400
                }}
              >
                <span>{opt.label}</span>
                {isSelected && <Check size={16} color="var(--accent-primary)" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
