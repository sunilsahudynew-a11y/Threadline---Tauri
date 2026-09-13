import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  wrapperClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ icon, className = '', wrapperClassName = '', ...rest }, ref) => {
    const inputEl = (
      <input
        ref={ref}
        className={`h-10 px-3 rounded-[6px] border border-[rgba(34,30,24,0.16)] bg-[#FAF6EE] text-[#221E18] text-[15px] leading-normal font-sans ` +
          `placeholder:text-[#7A705F]/70 ` +
          `focus:outline-none focus:border-[#35505F] focus:ring-2 focus:ring-[#35505F] focus:ring-offset-2 focus:ring-offset-[#FAF6EE] ` +
          `disabled:opacity-40 disabled:cursor-not-allowed ` +
          `transition-all duration-150 ease-in-out w-full ${icon ? 'pl-9' : ''} ${className}`.trim()}
        {...rest}
      />
    );

    if (!icon) return inputEl;

    return (
      <div className={`relative flex items-center w-full ${wrapperClassName}`}>
        <div className="absolute left-3 flex items-center pointer-events-none text-[#7A705F]">
          {icon}
        </div>
        {inputEl}
      </div>
    );
  }
);

Input.displayName = 'Input';
