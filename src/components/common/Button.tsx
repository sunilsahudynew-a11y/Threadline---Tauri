import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  icon,
  children,
  className = '',
  disabled,
  ...rest
}) => {
  let baseClasses = '';

  if (variant === 'primary') {
    baseClasses =
      'h-10 px-4 rounded-[6px] bg-[#B54B32] text-[#FAF6EE] font-sans font-semibold text-[14px] leading-none tracking-[0.01em] ' +
      'hover:bg-[#9E3E28] active:bg-[#883421] ' +
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35505F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF6EE] ' +
      'disabled:bg-[rgba(122,112,95,0.30)] disabled:text-[#7A705F] disabled:cursor-not-allowed disabled:pointer-events-none ' +
      'transition-all duration-150 ease-in-out inline-flex items-center justify-center gap-2 cursor-pointer select-none';
  } else if (variant === 'secondary') {
    baseClasses =
      'h-10 px-4 rounded-[6px] bg-transparent text-[#221E18] font-sans font-semibold text-[14px] leading-none tracking-[0.01em] ' +
      'border border-[rgba(34,30,24,0.16)] ' +
      'hover:bg-[rgba(34,30,24,0.04)] hover:border-[rgba(34,30,24,0.24)] active:bg-[rgba(34,30,24,0.07)] ' +
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35505F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF6EE] ' +
      'disabled:opacity-35 disabled:cursor-not-allowed ' +
      'transition-all duration-150 ease-in-out inline-flex items-center justify-center gap-2 cursor-pointer select-none';
  } else if (variant === 'tertiary') {
    baseClasses =
      'h-auto min-h-[32px] px-2 bg-transparent text-[#35505F] font-sans font-medium text-[14px] leading-normal ' +
      'border-0 hover:underline active:text-[#283C47] ' +
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35505F] focus-visible:ring-offset-2 focus-visible:rounded-[2px] ' +
      'disabled:text-[rgba(122,112,95,0.40)] disabled:no-underline disabled:cursor-not-allowed ' +
      'transition-all duration-150 ease-in-out inline-flex items-center justify-center gap-1.5 cursor-pointer select-none';
  } else if (variant === 'destructive') {
    baseClasses =
      'h-10 px-4 rounded-[6px] bg-transparent text-[#9B3B2C] font-sans font-semibold text-[14px] leading-none tracking-[0.01em] ' +
      'border border-[rgba(155,59,44,0.25)] ' +
      'hover:bg-[rgba(155,59,44,0.06)] hover:border-[#9B3B2C] active:bg-[rgba(155,59,44,0.12)] ' +
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9B3B2C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF6EE] ' +
      'disabled:opacity-35 disabled:cursor-not-allowed ' +
      'transition-all duration-150 ease-in-out inline-flex items-center justify-center gap-2 cursor-pointer select-none';
  } else if (variant === 'icon') {
    baseClasses =
      'w-9 h-9 min-w-[36px] min-h-[36px] rounded-[6px] bg-transparent border-0 ' +
      'text-[#7A705F] hover:text-[#221E18] hover:bg-[rgba(34,30,24,0.05)] active:bg-[rgba(34,30,24,0.09)] ' +
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35505F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF6EE] ' +
      'disabled:opacity-30 disabled:cursor-not-allowed ' +
      'transition-all duration-150 ease-in-out inline-flex items-center justify-center cursor-pointer select-none';
  }

  return (
    <button
      className={`${baseClasses} ${className}`.trim()}
      disabled={disabled}
      {...rest}
    >
      {icon && <span className="shrink-0 flex items-center justify-center">{icon}</span>}
      {children}
    </button>
  );
};
