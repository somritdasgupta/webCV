import ProfileImage from "./ProfileImage";
import AnimatedText from "./AnimatedText";

interface HeroContentProps {
  isMobile?: boolean;
}

const HERO_TEXT = `Days usually start with coffee and code. Most of the time, I'm tinkering with new tech, exploring problems worth solving, and building things that are both useful and fun to work with. When I'm not at the keyboard, you'll probably catch me unraveling a mystery on screen or living through the highs and lows of a football match. Music is always in the mix—hip-hop, alt-rock, indie—whatever keeps the thoughts moving. I earned myself a Bachelor Of Technology in Computer Science & Engineering, and lately I've been diving deep into Agentic AI and ecosystem integration—exploring multiple possibilities and experimentation on how it can take on complex tasks that demand orchestration and real effort. Writing on my blog keeps these ideas alive and evolving. tldr: engineer by profession, hobbyist by passion, focused on clarity over chaos, and always chasing that balance between deep work and real-life rhythm.`;

export default function HeroContent({ isMobile = false }: HeroContentProps) {
  if (isMobile) {
    return (
      <div className="block sm:hidden">
        {/* Small Profile Picture - Mobile */}
        <div className="flex justify-start mb-6">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-violet-500/20">
            <ProfileImage />
          </div>
        </div>

        {/* Greeting - Mobile */}
        <h1 className="text-2xl font-bold text-[var(--text-p)] mb-6">
          hey, I'm Somrit 👋
        </h1>

        {/* Quote Section - Mobile */}
        <div className="text-lg leading-relaxed italic">
          <AnimatedText
            text={HERO_TEXT}
            className="text-[var(--text-color)]"
            delay={300}
            speed={20}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="hidden sm:flex items-start space-x-6">
      {/* Small Profile Picture - Desktop */}
      <div className="flex-shrink-0">
        <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden border-2 border-violet-500/20">
          <ProfileImage />
        </div>
      </div>

      {/* Content - Desktop */}
      <div className="flex-1 min-w-0">
        {/* Greeting */}
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-p)] mb-6">
          Hey, I'm Somrit
        </h1>

        {/* Quote Section */}
        <div className="text-xl sm:text-2xl lg:text-3xl leading-relaxed italic">
          <AnimatedText
            text={HERO_TEXT}
            className="text-[var(--text-color)]"
            delay={300}
            speed={20}
          />
        </div>
      </div>
    </div>
  );
}
