import React from 'react';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

interface ProConsComparisonProps {
  pros: string[];
  cons: string[];
}

export function ProConsComparison({ pros, cons }: ProConsComparisonProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4">
      {/* Pros Card */}
      <div className="flex-1 flex flex-col p-4 mb-4 sm:mb-0 rounded-lg bg-[var(--card-bg)]/50 border-1 border-[var(--bronzer)] shadow-md backdrop-blur-sm">
        <div className="mt-4 ml-4">
          {pros.map((pro) => (
            <div
              key={pro}
              className="flex font-medium items-center mb-4"
            >
              <FiCheckCircle className="h-4 w-4 mr-2 text-green-500" />
              <span className="text-sm">{pro}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cons Card */}
      <div className="flex-1 flex flex-col p-4 mb-4 sm:mb-0 rounded-lg bg-[var(--card-bg)]/50 border-1 border-[var(--bronzer)] shadow-md backdrop-blur-sm">
        <div className="mt-4 ml-4">
          {cons.map((con) => (
            <div
              key={con}
              className="flex font-medium items-center mb-4"
            >
              <FiXCircle className="h-4 w-4 mr-2 text-red-500" />
              <span className="text-sm">{con}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
