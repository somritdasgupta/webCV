import Link from 'next/link';
import React from 'react';

export function CustomLink({ href, ...props }) {
  const className = "text-violet-500 hover:text-yellow-800 underline";

  if (href.startsWith('/')) {
    return <Link href={href} className={className} {...props}>{props.children}</Link>;
  }

  if (href.startsWith('#')) {
    return <a className={className} {...props} />;
  }

  return <a target="_blank" rel="noopener noreferrer" className={className} {...props} />;
}