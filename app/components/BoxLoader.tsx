"use client";

import { motion } from "framer-motion";

interface BoxLoaderProps {
  size?: "sm" | "md" | "lg";
}

export function BoxLoader({ size = "md" }: BoxLoaderProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const boxVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
    },
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        className={`grid grid-cols-2 gap-1 ${sizeClasses[size]}`}
        variants={containerVariants}
        animate="animate"
      >
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            className="bg-gradient-to-br from-[var(--bronzer)] to-[var(--callout-border)] rounded-sm"
            variants={boxVariants}
            style={{
              animationDelay: `${index * 0.1}s`,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}

export default BoxLoader;
