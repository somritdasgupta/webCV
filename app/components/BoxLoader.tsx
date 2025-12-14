"use client";

import { motion } from "framer-motion";

interface BoxLoaderProps {
  size?: "sm" | "md" | "lg";
}

export function BoxLoader({ size = "md" }: BoxLoaderProps) {
  const heights = {
    sm: 3,
    md: 4,
    lg: 5,
  };

  const height = heights[size];

  return (
    <div className="w-full flex items-center justify-center">
      <div
        className="relative w-full rounded-full overflow-hidden"
        style={{
          height: height,
          backgroundColor: "rgba(167, 139, 250, 0.08)",
        }}
      >
        <motion.div
          className="absolute inset-y-0 rounded-full"
          initial={{ left: "-35%" }}
          style={{
            background: `linear-gradient(90deg, 
              transparent 0%,
              rgba(167, 139, 250, 0.3) 25%,
              #a78bfa 50%,
              rgba(167, 139, 250, 0.3) 75%,
              transparent 100%)`,
            width: "35%",
            willChange: "left",
            boxShadow: "0 0 15px #a78bfa, 0 0 30px rgba(167, 139, 250, 0.5)",
            filter: "blur(0.5px)",
          }}
          animate={{
            left: ["-35%", "100%", "-35%"],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: "linear",
            repeatType: "loop",
          }}
        />

        <motion.div
          className="absolute inset-y-0 rounded-full"
          initial={{ left: "-15%" }}
          style={{
            background: `radial-gradient(ellipse, 
              rgba(255, 255, 255, 0.9) 0%,
              rgba(167, 139, 250, 0.4) 50%,
              transparent 100%)`,
            width: "15%",
            willChange: "left",
            boxShadow: "0 0 8px rgba(255, 255, 255, 0.9)",
          }}
          animate={{
            left: ["-15%", "100%", "-15%"],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: "linear",
            repeatType: "loop",
          }}
        />
      </div>
    </div>
  );
}

export default BoxLoader;
