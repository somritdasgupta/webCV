"use client";

import Image from "next/image";
import { getGravatarUrl } from "../lib/gravatar";
import { useState } from "react";

export function AuthorInfo() {
  const email = process.env.GRAVATAR_EMAIL || "thesomritdasgupta@gmail.com";
  const gravatarUrl = getGravatarUrl(email, 64, "mp");
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className="flex items-center gap-3 transition-all duration-200 hover:opacity-80">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
          SD
        </div>
        <div>
          <p className="text-[var(--text-p)] font-medium text-sm">
            By Somrit Dasgupta
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 transition-all duration-200 hover:opacity-80">
      <Image
        src={gravatarUrl}
        alt="Somrit Dasgupta"
        width={32}
        height={32}
        className="rounded-full ring-1 ring-[var(--bronzer)]/20 shadow-sm"
        onError={() => setImageError(true)}
      />
      <div>
        <p className="text-[var(--text-p)] font-medium text-sm">
          By Somrit Dasgupta
        </p>
      </div>
    </div>
  );
}
