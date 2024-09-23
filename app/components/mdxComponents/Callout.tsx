import React from 'react';

interface CalloutProps {
  emoji: React.ReactNode;
  children: React.ReactNode;
}

export function Callout({ emoji, children }: CalloutProps) {
  return (
    <div className="flex items-center p-4 mt-8 mb-8 rounded-lg bg-[var(--callout-bg)] border-1 border-[var(--callout-border)] text-[var(--text-color)] shadow-xs backdrop-blur-sm">
      <div className="text-lg mr-3 flex items-center justify-center flex-shrink-0 animate-pulse">
        {emoji}
      </div>
      <div className="flex-1 text-xs leading-6">
        {children}
      </div>
    </div>
  );
}
