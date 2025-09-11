"use client";

import React from "react";

export default function AnimatedGrid() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="animated-grid-container">
        <div className="animated-grid"></div>
      </div>
    </div>
  );
}
