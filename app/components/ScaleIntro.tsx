"use client";

import { useState, useEffect, useRef, ReactNode } from "react";

interface ScaleIntroProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export default function ScaleIntro({ children, delay = 0, className = "" }: ScaleIntroProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
    <div ref={ref} className={`${visible ? 'animate-avatar-intro' : 'opacity-0'} ${className}`}>
      {children}
    </div>
  );
}
