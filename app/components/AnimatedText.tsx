"use client";

import { useState, useEffect } from "react";

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
  speed = 30, // milliseconds per character
}: AnimatedTextProps) {
  const [displayedText, setDisplayedText] = useState("");
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
        setDisplayedText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed, isStarted]);

  return (
    <span className={className}>
      {displayedText}
      {currentIndex < text.length && isStarted && (
        <span className="animate-pulse text-violet-500 ml-1">|</span>
      )}
    </span>
  );
}
