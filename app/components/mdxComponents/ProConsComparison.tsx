import React from "react";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";

interface ProConsComparisonProps {
  pros: string[];
  cons: string[];
}

export function ProConsComparison({ pros, cons }: ProConsComparisonProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-6 my-8">
      {/* Pros Card */}
      <div className="flex-1 bg-transparent border-l-4 border-green-500 pl-6 py-4 mb-6 sm:mb-0">
        <h4 className="text-lg font-semibold text-[var(--text-color)] mb-4 flex items-center">
          <FiCheckCircle className="h-5 w-5 mr-2 text-green-500" />
          Pros
        </h4>
        <div className="space-y-3">
          {pros.map((pro, index) => (
            <div key={index} className="flex items-start">
              <FiCheckCircle className="h-4 w-4 mr-3 mt-0.5 text-green-500 flex-shrink-0" />
              <span className="text-sm text-[var(--text-p)] leading-relaxed">
                {pro}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Cons Card */}
      <div className="flex-1 bg-transparent border-l-4 border-red-500 pl-6 py-4">
        <h4 className="text-lg font-semibold text-[var(--text-color)] mb-4 flex items-center">
          <FiXCircle className="h-5 w-5 mr-2 text-red-500" />
          Cons
        </h4>
        <div className="space-y-3">
          {cons.map((con, index) => (
            <div key={index} className="flex items-start">
              <FiXCircle className="h-4 w-4 mr-3 mt-0.5 text-red-500 flex-shrink-0" />
              <span className="text-sm text-[var(--text-p)] leading-relaxed">
                {con}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
