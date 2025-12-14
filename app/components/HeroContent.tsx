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
      <div className="w-full flex flex-col lg:flex-row items-center lg:items-center gap-8 lg:gap-12">
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
          className="text-[10vw] sm:text-[10vw] lg:text-[8vw] font-semibold leading-none self-start lg:self-center whitespace-nowrap"
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
