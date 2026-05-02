import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, className = '', ...props }: InputProps) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-sm text-[#8b949e]">{label}</label>}
    <input
      className={`w-full px-3 py-2.5 rounded-lg bg-[#161b27] border ${error ? 'border-red-500' : 'border-[#2a3347]'} text-[#e6edf3] placeholder-[#4a5568] focus:outline-none focus:border-brand-500 transition-colors text-sm ${className}`}
      {...props}
    />
    {error && <span className="text-xs text-red-400">{error}</span>}
  </div>
);
