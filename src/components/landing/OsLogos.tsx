import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * Authentic Apple macOS Silhouette Vector Logo
 */
export const AppleLogo: React.FC<LogoProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 170 170"
    fill="currentColor"
    className={className}
    aria-label="Apple macOS Logo"
  >
    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.69-7.8-11.99-14.28-6.19-9.14-11.11-19.58-14.77-31.33-3.66-11.75-5.49-23.08-5.49-33.99 0-14.58 3.73-26.68 11.19-36.31 7.46-9.63 16.92-14.59 28.38-14.89 4.35 0 9.29 1.14 14.82 3.42 5.53 2.28 9.38 3.49 11.55 3.63 1.95-.14 5.92-1.35 11.91-3.63 5.99-2.28 10.8-3.3 14.42-3.06 10.88.65 19.8 4.58 26.76 11.79-9.58 5.76-14.26 13.91-14.05 24.45.22 8.37 3.51 15.42 9.87 21.15 6.36 5.73 13.79 9.07 22.29 10.02-2.17 6.31-4.78 12.78-7.83 19.42zM119.22 33.5c0-6.96 2.53-13.62 7.59-19.98 5.06-6.36 11.45-10.74 19.18-13.14-.11 1.2-.27 2.4-.49 3.61-.43 2.39-1.2 4.89-2.3 7.5-1.1 2.61-2.5 5.06-4.2 7.35-3.48 4.67-7.46 8.16-11.94 10.45-4.48 2.29-8.74 3.7-12.78 4.23.1-2.18.94-5.52 4.94-10.02z" />
  </svg>
);

/**
 * Authentic Microsoft Windows Flat 4-Tile Vector Logo
 */
export const WindowsLogo: React.FC<LogoProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 88 88"
    fill="currentColor"
    className={className}
    aria-label="Microsoft Windows Logo"
  >
    <path d="M0 12.56L35.79 7.68V41.74H0V12.56ZM0 46.26H35.79V80.32L0 75.44V46.26ZM40.06 7.1L88 0V41.74H40.06V7.1ZM40.06 46.26H88V88L40.06 80.9V46.26Z" />
  </svg>
);

/**
 * Authentic Linux Mascot / Terminal Vector Logo
 */
export const LinuxLogo: React.FC<LogoProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-label="Linux Logo"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M6 8l4 3-4 3" />
    <line x1="12" y1="14" x2="16" y2="14" />
    <path d="M8 21h8" />
    <path d="M12 17v4" />
  </svg>
);

/**
 * Web Platform / Browser Vector Logo
 */
export const WebBrowserLogo: React.FC<LogoProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-label="Web Browser Logo"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
