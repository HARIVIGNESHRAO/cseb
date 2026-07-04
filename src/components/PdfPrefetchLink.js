'use client';

import Link from 'next/link';

export default function PdfPrefetchLink({
  href,
  className,
  style,
  children,
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className={className}
      style={style}
    >
      {children}
    </Link>
  );
}
