"use client";

import { useState, useEffect } from "react";
import ProfileImage from "./ProfileImage";
import ShimmerText from "./ShimmerText";
import ContactPills from "./ContactPills";

export default function HeroContent() {
  const text = "Hi, I'm Somrit ";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-full flex flex-col items-start lg:items-center gap-6 lg:gap-8">
      <div className="w-full flex flex-row items-center gap-4 sm:gap-6 lg:gap-12 pt-4 lg:pt-0">
        {/* Gravatar */}
        <div
          className={`flex-shrink-0 ${
            mounted ? "animate-avatar-intro" : "opacity-0"
          }`}
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-[8vw] lg:h-[8vw] rounded-full overflow-hidden">
            <ProfileImage />
          </div>
        </div>

        {/* Text */}
        <h1
          className="text-[9vw] sm:text-[10vw] lg:text-[8vw] font-semibold leading-none whitespace-nowrap tracking-tight lg:tracking-normal"
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

      {/* Contact Pills */}
      <div className="w-full mt-4 lg:mt-6">
        <ContactPills />
      </div>
    </div>
  );
}
