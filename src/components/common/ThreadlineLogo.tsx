import React from 'react';

interface ThreadlineMarkProps {
  className?: string;
  size?: number; // width in pixels
  color?: string; // ink color (defaults to #221E18 or current text)
  knotColor?: string; // knot color (always #B54B32 by default)
}

/**
 * Threadline Mark:
 * One continuous line, rising and falling once, settling into a single knot.
 * Fixed 240x120 grid, 9pt constant stroke weight.
 * Knot is rendered in Wax Seal (#B54B32).
 */
export const ThreadlineMark: React.FC<ThreadlineMarkProps> = ({
  className = '',
  size = 36,
  color = '#221E18',
  knotColor = '#B54B32'
}) => {
  const height = (size * 120) / 240;

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 240 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Threadline story arc and knot mark"
    >
      {/* Story Arc Stroke: setup, rise, fall, settling into the knot */}
      <path
        d="M 24 88 C 44 80 58 66 78 66 C 98 66 108 86 128 86 C 150 86 166 42 190 42 C 206 42 216 58 222 66"
        stroke={color}
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Knot: Solid dot held in Wax Seal */}
      <circle cx="225" cy="67" r="11" fill={knotColor} />
    </svg>
  );
};

interface ThreadlineBadgeProps {
  className?: string;
  size?: number; // width & height of badge (e.g. 28, 32, 40)
}

/**
 * Monogram / App Icon:
 * Arc-and-knot mark reversed to Paper (#FAF6EE) on a solid Ink (#221E18) field,
 * with the knot held in Wax Seal (#B54B32).
 */
export const ThreadlineBadge: React.FC<ThreadlineBadgeProps> = ({
  className = '',
  size = 28
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-lg bg-[#221E18] flex items-center justify-center p-1 shrink-0 select-none shadow-xs ${className}`}
      title="Threadline"
    >
      <ThreadlineMark size={size * 0.8} color="#FAF6EE" knotColor="#B54B32" />
    </div>
  );
};

interface ThreadlineLogoProps {
  className?: string;
  showSubtitle?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'horizontal' | 'vertical';
}

export const ThreadlineLogo: React.FC<ThreadlineLogoProps> = ({
  className = '',
  showSubtitle = false,
  size = 'md',
  variant = 'horizontal'
}) => {
  const markSizes = {
    sm: 24,
    md: 32,
    lg: 48
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl'
  };

  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`}>
        <ThreadlineMark size={markSizes[size] * 1.5} color="#221E18" knotColor="#B54B32" />
        <h1 className={`font-serif font-semibold tracking-tight text-[#221E18] mt-2 ${textSizes[size]}`}>
          Threadline
        </h1>
        {showSubtitle && (
          <p className="text-[11px] font-sans font-medium tracking-[0.16em] uppercase text-[#7A705F] mt-1">
            Narrative Studio &amp; Novelist Workspace
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <ThreadlineBadge size={size === 'sm' ? 24 : size === 'lg' ? 36 : 28} />
      <div className="flex flex-col leading-tight">
        <span className={`font-serif font-semibold tracking-tight text-[#221E18] ${textSizes[size]}`}>
          Threadline
        </span>
        {showSubtitle && (
          <span className="text-[9px] font-sans font-medium tracking-[0.16em] uppercase text-[#7A705F]">
            Narrative Studio
          </span>
        )}
      </div>
    </div>
  );
};
