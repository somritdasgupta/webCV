"use client";

import { useState, useEffect, useRef } from "react";

interface ShimmerTextProps {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
}

export default function ShimmerText({
  text,
  className = "",
  delay = 0,
  speed = 0.03,
}: ShimmerTextProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <span ref={ref} className={`${className} inline-block`}>
      {text.split("").map((char, i) => (
        <span
          key={i}
          className={`inline-block ${visible ? "animate-char-shimmer" : "opacity-0"}`}
          style={{ animationDelay: `${i * speed}s` }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}
