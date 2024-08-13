"use client";

import React, { useState, useEffect } from "react";

function ErrorBoundaryComponent({
  fallback,
  children,
}: {
  fallback: React.ReactNode;
  children?: React.ReactNode;
}) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error: any) => {
      setHasError(true);
    };

    // Add your error handling logic here

    return () => {
      // Cleanup error handling logic if needed
    };
  }, []);

  if (hasError) {
    return (
      <div className="px-4 py-3 border border-red-700 bg-red-200 rounded p-1 text-sm flex items-center text-red-900 mb-8">
        <div className="w-full callout">{fallback}</div>
      </div>
    );
  }

  return <>{children}</>;
}

export default ErrorBoundaryComponent;
