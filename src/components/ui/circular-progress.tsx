import React from 'react';
import { cn } from '@/lib/utils';

interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export function CircularProgress({
  size = 40,
  strokeWidth = 4,
  color = 'text-blue-600',
  className,
  ...props
}: CircularProgressProps) {
  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      {...props}
    >
      <svg
        className={cn('animate-spin', color)}
        viewBox="0 0 50 50"
        style={{ width: size, height: size }}
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          strokeLinecap="round"
          style={{
            strokeDasharray: '1, 200',
            strokeDashoffset: '0',
            animation: 'dash 1.5s ease-in-out infinite',
          }}
        />
      </svg>
    </div>
  );
}
