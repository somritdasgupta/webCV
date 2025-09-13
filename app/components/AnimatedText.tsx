"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
}

export default function AnimatedText({
  text,
  className = "",
  delay = 0,
  speed = 60,
}: AnimatedTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setIsStarted(true);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!isStarted) return;

    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed, isStarted]);

  // Split text into characters while preserving spaces
  const characters = text.split("");

  return (
    <span className={className}>
      {characters.map((char, index) => {
        const shouldShow = isStarted && index < currentIndex;

        return (
            <span
            key={index}
            style={{
              display: char === " " ? "inline" : "inline-block",
              minWidth: char === " " ? "0.25em" : "auto",
            }}
            >
            {shouldShow ? (char === " " ? "\u00A0" : char) : ""}
            </span>
        );
      })}
      {currentIndex < text.length && isStarted && (
        <motion.span
          className="text-violet-500 ml-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          |
        </motion.span>
      )}
    </span>
  );
}
