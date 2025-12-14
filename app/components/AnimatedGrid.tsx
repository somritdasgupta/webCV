"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";

interface GridCell {
  row: number;
  col: number;
  id: string;
}

export default function AnimatedGrid() {
  const [gridCells, setGridCells] = useState<GridCell[]>([]);
  const [activeCells, setActiveCells] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  const getGridSize = useCallback(() => {
    // Get grid size from CSS variable, with fallbacks for different screen sizes
    if (typeof window !== "undefined") {
      const screenWidth = window.innerWidth;
      if (screenWidth <= 480) return 16;
      if (screenWidth <= 768) return 18;
      return 20;
    }
    return 20;
  }, []);

  const updateGrid = useCallback(() => {
    if (!containerRef.current) return;

    const gridSize = getGridSize();
    const container = containerRef.current;
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;

    const cols = Math.ceil(containerWidth / gridSize);
    const rows = Math.ceil(containerHeight / gridSize);

    const cells: GridCell[] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        cells.push({
          row,
          col,
          id: `cell-${row}-${col}`,
        });
      }
    }

    setGridCells(cells);
  }, [getGridSize]);

  useEffect(() => {
    updateGrid();

    const handleResize = () => updateGrid();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [updateGrid]);

  useEffect(() => {
    if (gridCells.length === 0) return;

    const animateRandomCells = () => {
      // Select 2-4 random cells to light up simultaneously
      const numCells = Math.floor(Math.random() * 3) + 2; // 2-4 cells
      const selectedCells: string[] = [];

      for (let i = 0; i < numCells; i++) {
        let randomCell;
        do {
          randomCell = gridCells[Math.floor(Math.random() * gridCells.length)];
        } while (
          selectedCells.includes(randomCell.id) &&
          selectedCells.length < gridCells.length
        );

        selectedCells.push(randomCell.id);
      }

      // Light up multiple cells
      selectedCells.forEach((cellId, index) => {
        setTimeout(() => {
          setActiveCells((prev) => new Set(Array.from(prev).concat(cellId)));

          // Clear each cell after its animation duration
          setTimeout(
            () => {
              setActiveCells((prev) => {
                const newSet = new Set(prev);
                newSet.delete(cellId);
                return newSet;
              });
            },
            1500 + Math.random() * 1000
          ); // 1.5-2.5 second duration
        }, index * 200); // Stagger start times by 200ms
      });
    };

    // Start first animation after a short delay
    const firstTimeout = setTimeout(animateRandomCells, 1000);

    // Continue with random intervals
    const interval = setInterval(
      () => {
        animateRandomCells();
      },
      Math.random() * 3000 + 4000
    ); // Random interval between 4-7 seconds

    return () => {
      clearTimeout(firstTimeout);
      clearInterval(interval);
    };
  }, [gridCells]);

  const gridSize = getGridSize();

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base grid background */}
      <div className="animated-grid-container">
        <div className="animated-grid"></div>
      </div>

      {/* Animated grid cells overlay */}
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(auto-fill, ${gridSize}px)`,
          gridTemplateRows: `repeat(auto-fill, ${gridSize}px)`,
          gap: "0px",
        }}
      >
        {gridCells.slice(0, 500).map(
          (
            cell // Limit to 500 cells for performance
          ) => (
            <div
              key={cell.id}
              className={`grid-cell ${activeCells.has(cell.id) ? "active" : ""}`}
              style={{
                width: `${gridSize}px`,
                height: `${gridSize}px`,
              }}
            />
          )
        )}
      </div>
    </div>
  );
}
