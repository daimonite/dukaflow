import React from 'react';

/**
 * DukaSmart mark — a white "D" with an amber growth arrow rising beside it.
 * Reads as a D down to favicon size and as shop + profit at icon size.
 */
export const BrandLogo: React.FC<{ className?: string; title?: string }> = ({
  className = 'w-9 h-9',
  title = 'DukaSmart',
}) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    role="img"
    aria-label={title}
    focusable="false"
  >
    <rect width="24" height="24" rx="6" fill="#064e3b" />
    <path
      fill="#ffffff"
      fillRule="evenodd"
      d="M3.5 6h3.4a6 6 0 0 1 0 12H3.5V6Zm2.2 2.2v7.6h1.5a3.4 3.4 0 0 0 0-7.6H5.7Z"
    />
    <path
      d="M13.4 17.9 18.1 10.9"
      fill="none"
      stroke="#f59e0b"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <path d="M19.8 8 16.12 9.96 19.7 12.16Z" fill="#f59e0b" />
  </svg>
);
