import React from "react";

interface CalloutProps {
  emoji: React.ReactNode;
  children: React.ReactNode;
}

export function Callout({ emoji, children }: CalloutProps) {
  return (
    <div className="my-8 bg-transparent border-l-4 border-[var(--bronzer)] pl-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <span className="text-lg leading-none">{emoji}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm leading-7 text-[var(--text-p)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
