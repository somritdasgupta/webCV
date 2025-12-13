"use client";

import { useState, useEffect } from "react";
import ProfileImage from "./ProfileImage";
import ShimmerText from "./ShimmerText";

export default function HeroContent() {
  const text = "hey, I'm Somrit ";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-full flex flex-col lg:flex-row items-center lg:items-center gap-4 lg:gap-12">
      {/* Gravatar */}
      <div
        className={`flex-shrink-0 self-start lg:self-center ${
          mounted ? "animate-avatar-intro" : "opacity-0"
        }`}
      >
        <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-30 lg:h-30 rounded-full overflow-hidden">
          <ProfileImage />
        </div>
      </div>

      {/* Text */}
      <h1
        className="text-[10vw] sm:text-[10vw] lg:text-[8vw] font-bold leading-none self-start lg:self-center whitespace-nowrap"
        style={{ color: "var(--text-color)" }}
      >
        <ShimmerText text={text} />
        <span
          className={`inline-block ${mounted ? "animate-wave" : "opacity-0"}`}
        >
          👋
        </span>
      </h1>
    </div>
  );
}
