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
          hey, I'm Somrit
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
