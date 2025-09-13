"use client";

import { motion } from "framer-motion";
import ProfileImage from "./ProfileImage";
import AnimatedText from "./AnimatedText";

interface HeroContentProps {
  isMobile?: boolean;
}

const HERO_TEXT = `I'm a software engineer if we're talking profession else a hobbyist coder, tinkerer because I genuinely love exploring new ideas. I enjoy to build and learn new tech out of my curiosity, whether it's algorithms or AI experiments that make you go "that's cool, what can I build using that?" On my blog, I share what I'm working on, and ideas that excite me and my own take on stuffs that is happening around the same matter of interest. You'll also find me dive in a good story—books, shows, movies or anything else I can get into. If you're into tech, ideas, and keeping it real, I'd love for you to look into the blogs below shared over time.`;

export default function HeroContent({ isMobile = false }: HeroContentProps) {
  if (isMobile) {
    return (
      <div className="block sm:hidden">
        {/* Simple fade-in greeting - FIRST */}
        <motion.h1
          className="font-bold text-2xl text-[var(--text-p)] mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
        >
          hey, I'm Somrit {"\u{1F44B}"}
        </motion.h1>

        {/* Profile Picture - SECOND */}
        <motion.div
          className="flex justify-start mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
        >
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-violet-500/20">
            <ProfileImage />
          </div>
        </motion.div>

        {/* Typewriter text - THIRD */}
        <motion.div
          className="text-lg leading-relaxed italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <AnimatedText
            text={HERO_TEXT}
            className="text-[var(--text-color)]"
            delay={1600}
            speed={20}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="hidden sm:flex items-start space-x-6">
      {/* Profile Picture - SECOND (but appears on left side) */}
      <motion.div
        className="flex-shrink-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
      >
        <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden border-2 border-violet-500/20">
          <ProfileImage />
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Simple fade-in greeting - FIRST */}
        <motion.h1
          className="font-bold text-3xl lg:text-4xl text-[var(--text-p)] mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
        >
          hey, I'm Somrit {"\u{1F44B}"}
        </motion.h1>

        <motion.div
          className="text-xl sm:text-2xl lg:text-3xl leading-relaxed italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <AnimatedText
            text={HERO_TEXT}
            className="text-[var(--text-color)]"
            delay={1600}
            speed={1}
          />
        </motion.div>
      </div>
    </div>
  );
}
