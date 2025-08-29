"use client";

import Image from "next/image";
import { getGravatarUrl } from "../lib/gravatar";
import { useState } from "react";

export default function ProfileImage() {
  const email = "thesomritdasgupta@gmail.com";
  const gravatarUrl = getGravatarUrl(email, 256, "mp");
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-purple-500 blur-3xl rounded-full opacity-25 transition-colors duration-1000 animate-tilt"></div>
        <div className="relative w-[220px] h-[220px] rounded-full border-3 border-[var(--bronzer)]/70 bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-bold text-4xl">
          SD
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-purple-500 blur-3xl rounded-full opacity-25 transition-colors duration-1000 animate-tilt"></div>
      <Image
        src={gravatarUrl}
        alt="Photo of Somrit Dasgupta"
        width={220}
        height={220}
        className="relative rounded-full border-3 border-[var(--bronzer)]/70"
        priority
        unoptimized
        onError={() => setImageError(true)}
      />
    </div>
  );
}
