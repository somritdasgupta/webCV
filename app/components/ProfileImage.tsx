import Image from "next/image";
import { getGravatarUrl } from "../lib/gravatar";

export default function ProfileImage() {
  const email = process.env.GRAVATAR_EMAIL || "fallback@example.com";

  // Generate high-resolution Gravatar URL (512px for crisp quality)
  const gravatarUrl = getGravatarUrl(email, 512, "mp");

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
        unoptimized // Allow external images
      />
    </div>
  );
}
