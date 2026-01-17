"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "../blog/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  card?: "profile" | "projects" | "blog";
  data?: any;
  suggestions?: string[];
}

const PROMPT_CARDS = [
  { text: "Tell me about Somrit", query: "who is somrit" },
  { text: "Show me projects", query: "show projects" },
  { text: "What does he write?", query: "blog posts" },
  { text: "Recent activity", query: "github activity" },
];

export function ChatInterface({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch dynamic profile data on mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Fetch GitHub profile for bio and stats
        const githubRes = await fetch(
          "https://api.github.com/users/somritdasgupta",
        );
        const githubData = await githubRes.json();

        setProfileData({
          name: githubData.name || "Somrit Dasgupta",
          bio:
            githubData.bio ||
            "Software Engineer specializing in web development, AI/ML, and cloud technologies. Passionate about building scalable applications and exploring cutting-edge tech.",
          avatar: githubData.avatar_url,
          github: githubData.html_url,
          linkedin: "https://linkedin.com/in/somritdasgupta",
          instagram: "https://instagram.com/somritdasgupta",
          email: "somritdasgupta@outlook.com",
        });
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      }
    };
    fetchProfileData();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Prevent body scrolling when chat is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const keywords = {
    profile: [
      "who",
      "about",
      "introduce",
      "yourself",
      "background",
      "bio",
      "somrit",
    ],
    projects: [
      "project",
      "work",
      "built",
      "portfolio",
      "created",
      "developed",
      "repo",
    ],
    blog: ["blog", "article", "post", "write", "written", "read", "latest"],
    skills: [
      "skill",
      "technology",
      "tech stack",
      "language",
      "framework",
      "tool",
    ],
    contact: ["contact", "reach", "email", "connect", "message", "hire"],
    navigation: ["go to", "navigate", "show", "open", "take me", "visit"],
    specific: [
      "tell me about",
      "explain",
      "what is",
      "summary",
      "summarize",
      "details",
    ],
    greeting: ["hi", "hello", "hey", "greetings", "sup"],
    thanks: ["thanks", "thank you", "appreciate", "awesome", "great"],
  };

  const getResponse = useCallback(
    async (query: string): Promise<Message> => {
      const lowerQuery = query.toLowerCase();

      // Greeting responses (check first)
      if (/^(hi|hello|hey|greetings|sup)(\s|$)/i.test(lowerQuery)) {
        const greetings = [
          "Hey there! 👋 I'm here to help you explore Somrit's work. What would you like to know?",
          "Hello! Feel free to ask me about projects, blog posts, skills, or anything else!",
          "Hi! I can tell you about experience, projects, blog, or how to reach out. What interests you?",
        ];
        return {
          role: "assistant",
          content: greetings[Math.floor(Math.random() * greetings.length)],
          suggestions: [
            "Tell me about Somrit",
            "Show me projects",
            "What does he write about?",
          ],
        };
      }

      // Thanks responses
      if (lowerQuery.includes("thanks") || lowerQuery.includes("thank you")) {
        return {
          role: "assistant",
          content: "You're welcome! Anything else you'd like to know? 😊",
          suggestions: [
            "Show me projects",
            "View blog posts",
            "What are your skills?",
          ],
        };
      }

      // PRIORITY 1: Specific blog post queries ("summarize", "what is", "explain")
      if (
        lowerQuery.includes("what is") ||
        lowerQuery.includes("summarize") ||
        lowerQuery.includes("summary of") ||
        lowerQuery.includes("explain") ||
        lowerQuery.includes("tell me about")
      ) {
        try {
          const response = await fetch("/api/blog-posts");
          const data = await response.json();
          const posts = data.posts || [];

          // Extract the subject (remove question words)
          const subject = lowerQuery
            .replace(/what is (the |a )?/g, "")
            .replace(/tell me about (the |a )?/g, "")
            .replace(/summarize (the |a )?/g, "")
            .replace(/summary of (the |a )?/g, "")
            .replace(/explain (the |a )?/g, "")
            .trim();

          // Try to find matching post
          const matchingPost = posts.find((p: any) => {
            const slug = p.slug?.toLowerCase() || "";
            const title = p.metadata?.title?.toLowerCase() || "";

            // Split slug and subject into words
            const slugWords = slug.split("-");
            const subjectWords = subject.split(" ").filter((w) => w.length > 2); // Ignore short words

            // Count matching words
            const matchCount = subjectWords.filter((sw) =>
              slugWords.some(
                (slugWord) => slugWord.includes(sw) || sw.includes(slugWord),
              ),
            ).length;

            return (
              matchCount >= 2 || // At least 2 significant words match
              slug.includes(subject.replace(/\s+/g, "-")) || // Direct slug match
              subject.includes(slug.replace(/-/g, " ")) || // Reverse match
              title.includes(subject)
            ); // Title contains subject
          });

          if (matchingPost) {
            return {
              role: "assistant",
              content: `"${matchingPost.metadata?.title}"\n\n${matchingPost.metadata?.summary || "An insightful article."}\n\nPublished: ${matchingPost.metadata?.publishedAt ? new Date(matchingPost.metadata.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Recently"}`,
              data: { postSlug: matchingPost.slug },
              suggestions: [
                "Read full article",
                "Show more posts",
                "What are your projects?",
              ],
            };
          } else {
            return {
              role: "assistant",
              content: `I couldn't find a post about "${subject}". Here are all recent articles:`,
              card: "blog",
              data: posts.slice(0, 4),
              suggestions: [
                "Tell me about a project",
                "What are your skills?",
                "How can I contact you?",
              ],
            };
          }
        } catch (error) {
          return {
            role: "assistant",
            content:
              "Having trouble accessing blog posts. Try asking about projects or skills!",
            suggestions: [
              "Show me projects",
              "What's your tech stack?",
              "Tell me about yourself",
            ],
          };
        }
      }

      // PRIORITY 2: "What does he write about" - show blog posts
      if (
        (lowerQuery.includes("write") ||
          lowerQuery.includes("wrote") ||
          lowerQuery.includes("writing")) &&
        (lowerQuery.includes("about") ||
          lowerQuery.includes("blog") ||
          lowerQuery.includes("post") ||
          lowerQuery.includes("article"))
      ) {
        try {
          const response = await fetch("/api/blog-posts");
          const data = await response.json();
          return {
            role: "assistant",
            content: "Here's what I've been writing about recently:",
            card: "blog",
            data: data.posts?.slice(0, 4) || [],
            suggestions: [
              "Summarize a post",
              "Show me projects",
              "What are your skills?",
            ],
          };
        } catch (error) {
          return {
            role: "assistant",
            content: "Unable to fetch blog posts. Try checking projects!",
            suggestions: [
              "Show projects",
              "What are your skills?",
              "Tell me about yourself",
            ],
          };
        }
      }

      // PRIORITY 3: "Show me blog posts" - display blog posts inline
      if (
        (lowerQuery.includes("show") ||
          lowerQuery.includes("display") ||
          lowerQuery.includes("see") ||
          lowerQuery.includes("view")) &&
        (lowerQuery.includes("blog") ||
          lowerQuery.includes("post") ||
          lowerQuery.includes("article"))
      ) {
        try {
          const response = await fetch("/api/blog-posts");
          const data = await response.json();
          return {
            role: "assistant",
            content: "Here are my recent blog posts:",
            card: "blog",
            data: data.posts?.slice(0, 4) || [],
            suggestions: [
              "Summarize a specific post",
              "Show me projects",
              "What's your tech stack?",
            ],
          };
        } catch (error) {
          return {
            role: "assistant",
            content:
              "Having trouble loading blog posts. Would you like to see projects instead?",
            suggestions: [
              "Show me projects",
              "Tell me about yourself",
              "What are your skills?",
            ],
          };
        }
      }

      // Latest blog post
      if (
        (lowerQuery.includes("latest") || lowerQuery.includes("recent")) &&
        (lowerQuery.includes("blog") ||
          lowerQuery.includes("post") ||
          lowerQuery.includes("article"))
      ) {
        try {
          const response = await fetch("/api/blog-posts");
          const data = await response.json();
          const latestPost = data.posts?.[0];

          if (latestPost) {
            return {
              role: "assistant",
              content: `Latest: "${latestPost.metadata?.title}"\n\n${latestPost.metadata?.summary}\n\nPublished ${new Date(latestPost.metadata.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
              data: { postSlug: latestPost.slug },
              suggestions: [
                "Read full article",
                "Show all posts",
                "What are your projects?",
              ],
            };
          }
        } catch (error) {
          console.error("Failed to fetch blog post:", error);
        }
      }

      // Projects queries
      if (keywords.projects.some((kw) => lowerQuery.includes(kw))) {
        const response = await fetch("/api/github", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        })
          .then((r) => r.json())
          .catch(() => []);

        const projects = Array.isArray(response)
          ? response.map((p: any) => ({
              name: p.name,
              description: p.description,
              language: p.topics?.[0] || "Code",
              stars: p.stargazers_count || 0,
              url: p.html_url,
            }))
          : [];

        const context =
          lowerQuery.includes("latest") || lowerQuery.includes("recent")
            ? "Here are the most recent projects"
            : lowerQuery.includes("popular") || lowerQuery.includes("best")
              ? "Here are the featured projects"
              : "Here are some highlighted projects from GitHub";

        return {
          role: "assistant",
          content: context,
          card: "projects",
          data: projects.slice(0, 4),
          suggestions: [
            "Tell me about skills",
            "Show blog posts",
            "View recent activity",
          ],
        };
      }

      // Skills with enhanced info
      if (keywords.skills.some((kw) => lowerQuery.includes(kw))) {
        try {
          const projectsRes = await fetch("/api/github", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          });
          const projects = await projectsRes.json();

          const skills = Array.isArray(projects)
            ? Array.from(new Set(projects.flatMap((p: any) => p.topics || [])))
                .filter(Boolean)
                .slice(0, 15)
            : [];

          const context = lowerQuery.includes("what")
            ? "The tech stack includes:"
            : lowerQuery.includes("all") || lowerQuery.includes("list")
              ? "Here's a comprehensive list of technologies:"
              : "Working with various technologies:";

          const skillsText =
            skills.length > 0
              ? `${context}\n\n${skills.map((s) => `• ${s}`).join("\n")}\n\nBased on GitHub projects and real-world experience.`
              : "Specializes in web development, AI/ML, cloud technologies, and full-stack engineering. Check out the projects to see technologies in action!";

          return {
            role: "assistant",
            content: skillsText,
            suggestions: [
              "Show me projects",
              "What do you write about?",
              "View activity",
            ],
          };
        } catch (error) {
          return {
            role: "assistant",
            content:
              "Having trouble fetching skills. Check out the projects to see technologies in action!",
            card: "projects",
            suggestions: [
              "Show me projects",
              "What do you write?",
              "Tell me about yourself",
            ],
          };
        }
      }

      // Contact with context
      if (keywords.contact.some((kw) => lowerQuery.includes(kw))) {
        const isHiring =
          lowerQuery.includes("hire") ||
          lowerQuery.includes("work") ||
          lowerQuery.includes("opportunity");
        const context = isHiring
          ? "Great to hear you're interested! Here's how to get in touch:"
          : "Let's connect! Here are the best ways to reach out:";

        const contactInfo = profileData
          ? `${context}\n\n• Email: ${profileData.email}\n• LinkedIn: ${profileData.linkedin}\n• GitHub: ${profileData.github}\n• Instagram: ${profileData.instagram}\n\n${isHiring ? "Looking forward to discussing opportunities!" : "Always happy to connect and chat!"}`
          : `${context}\n\nYou can find all contact links in the profile section.`;

        return {
          role: "assistant",
          content: contactInfo,
          suggestions: [
            "Tell me about him",
            "Show projects",
            "What does he write?",
          ],
        };
      }

      // Profile queries - very specific only
      if (
        lowerQuery.includes("who is somrit") ||
        lowerQuery.includes("introduce yourself") ||
        lowerQuery.includes("tell me about yourself") ||
        lowerQuery.includes("about somrit dasgupta") ||
        lowerQuery === "who are you" ||
        lowerQuery === "about you"
      ) {
        return {
          role: "assistant",
          content: "Let me introduce you to Somrit:",
          card: "profile",
          suggestions: [
            "Show me projects",
            "What does he write about?",
            "What are his skills?",
          ],
        };
      }

      // Activity queries
      if (
        lowerQuery.includes("activity") ||
        lowerQuery.includes("commit") ||
        lowerQuery.includes("recent work")
      ) {
        router.push("/activity");
        return {
          role: "assistant",
          content: "Taking you to GitHub activity...",
          suggestions: [
            "Show me projects",
            "What do you write?",
            "Tell me about yourself",
          ],
        };
      }

      // Bookmarks/Tools
      if (
        lowerQuery.includes("bookmark") ||
        lowerQuery.includes("recommend") ||
        lowerQuery.includes("suggest")
      ) {
        router.push("/bookmarks");
        return {
          role: "assistant",
          content: "Opening curated bookmarks and tool recommendations...",
          suggestions: [
            "Show projects",
            "What do you write?",
            "Tell me about skills",
          ],
        };
      }

      // Navigation (explicit "go to" only)
      if (
        (lowerQuery.includes("go to") ||
          lowerQuery.includes("navigate to") ||
          lowerQuery.includes("take me to")) &&
        !lowerQuery.includes("blog") &&
        !lowerQuery.includes("post")
      ) {
        const pageMap: Record<string, string> = {
          activity: "/activity",
          bookmarks: "/bookmarks",
          projects: "/projects",
          home: "/",
        };

        for (const [key, path] of Object.entries(pageMap)) {
          if (lowerQuery.includes(key)) {
            router.push(path);
            return {
              role: "assistant",
              content: `Taking you to ${key}...`,
              suggestions: ["Come back to chat", "Tell me more", "What else?"],
            };
          }
        }
      }

      // Clarification for vague queries
      if (
        query.trim().split(" ").length <= 2 ||
        lowerQuery === "tell me more" ||
        lowerQuery === "more" ||
        lowerQuery === "what else"
      ) {
        return {
          role: "assistant",
          content:
            "I'd love to help! Could you be more specific? I can assist with:",
          suggestions: [
            "Tell me about Somrit",
            "Show me projects",
            "What does he write about?",
            "What are his skills?",
            "How can I contact him?",
          ],
        };
      }

      // Default intelligent response with suggestions
      return {
        role: "assistant",
        content:
          "I'm not quite sure what you're looking for. I can help you explore:",
        suggestions: [
          "Tell me about Somrit",
          "Show me his projects",
          "What does he write about?",
          "What's his tech stack?",
          "How can I contact him?",
        ],
      };
    },
    [profileData],
  );

  const handleSend = useCallback(
    async (query?: string) => {
      const text = query || input;
      if (!text.trim()) return;

      const userMessage: Message = { role: "user", content: text };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsTyping(true);

      const response = await getResponse(text.toLowerCase());

      setTimeout(() => {
        setMessages((prev) => [...prev, response]);
        setIsTyping(false);
      }, 600);
    },
    [input, getResponse],
  );

  const ProfileCard = () => {
    const profile = profileData || {
      name: "Somrit Dasgupta",
      bio: "Software Engineer",
      avatar: "/somritdasgupta.jpg",
      github: "https://github.com/somritdasgupta",
      linkedin: "https://linkedin.com/in/somritdasgupta",
      instagram: "https://instagram.com/somritdasgupta",
    };

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-linear-to-br from-(--card-bg) to-(--callout-bg) rounded-2xl p-6 shadow-lg nav-shimmer"
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-lg shrink-0">
            <Image
              src={profile.avatar}
              alt={profile.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-bold text-(--text-color) mb-1">
              {profile.name}
            </h3>
            <p className="text-sm text-(--text-p) mb-3">Software Engineer</p>
            <div className="flex flex-wrap gap-2">
              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-shimmer text-xs px-3 py-1.5 bg-(--callout-bg) rounded-lg hover:bg-bronzer/10 transition-all"
              >
                GitHub
              </a>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-shimmer text-xs px-3 py-1.5 bg-(--callout-bg) rounded-lg hover:bg-bronzer/10 transition-all"
              >
                LinkedIn
              </a>
              <a
                href={profile.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-shimmer text-xs px-3 py-1.5 bg-(--callout-bg) rounded-lg hover:bg-bronzer/10 transition-all"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>
        <p className="text-sm text-(--text-p) leading-relaxed mb-4">
          {profile.bio}
        </p>
        <div className="flex gap-3">
          <Link
            href="/"
            onClick={onClose}
            className="nav-shimmer flex-1 text-center px-4 py-2.5 bg-bronzer border-2 border-bronzer text-(--bg-color) rounded-xl hover:scale-105 transition-transform text-sm font-semibold shadow-lg"
          >
            View Profile
          </Link>
          <a
            href="/Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-shimmer flex-1 text-center px-4 py-2.5 bg-(--callout-bg) border-2 border-callout text-(--text-color) rounded-xl hover:scale-105 hover:bg-bronzer/20 hover:border-bronzer transition-all text-sm font-semibold shadow-md"
          >
            Download CV
          </a>
        </div>
      </motion.div>
    );
  };

  const ProjectsCard = ({ projects }: { projects: any[] }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {projects.map((project: any, idx: number) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-(--card-bg) rounded-xl p-4 hover:shadow-lg transition-all group nav-shimmer"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-(--text-color) mb-2 group-hover:text-(--bronzer) transition-colors">
                {project.name}
              </h4>
              <p className="text-xs text-(--text-p) mb-3 line-clamp-2">
                {project.description || "No description available"}
              </p>
              <div className="flex flex-wrap gap-2">
                {project.language && (
                  <span className="nav-shimmer text-xs px-2 py-1 bg-(--callout-bg) rounded-md text-(--text-p)">
                    {project.language}
                  </span>
                )}
                {project.stars > 0 && (
                  <span className="nav-shimmer text-xs px-2 py-1 bg-(--callout-bg) rounded-md text-(--text-p)">
                    ★ {project.stars}
                  </span>
                )}
              </div>
            </div>
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-shimmer px-4 py-2 bg-bronzer border-2 border-bronzer text-(--bg-color) rounded-lg hover:scale-105 transition-transform text-xs font-semibold whitespace-nowrap shadow-lg"
            >
              View Repo
            </a>
          </div>
        </motion.div>
      ))}
      <Link
        href="/projects"
        onClick={onClose}
        className="nav-shimmer block text-center px-4 py-3 bg-(--callout-bg) border-2 border-callout text-(--text-color) rounded-xl hover:bg-bronzer/20 hover:border-bronzer hover:scale-105 transition-all text-sm font-semibold shadow-md"
      >
        View All Projects →
      </Link>
    </motion.div>
  );

  const BlogCard = ({ posts }: { posts: any[] }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {posts.map((post: any, idx: number) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <Link
            href={`/blog/${post.slug}`}
            onClick={onClose}
            className="block bg-(--card-bg) rounded-xl p-4 hover:shadow-lg transition-all group nav-shimmer"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-(--text-color) mb-2 group-hover:text-(--bronzer) transition-colors">
                  {post.metadata.title}
                </h4>
                <p className="text-xs text-(--text-p) mb-3 line-clamp-2">
                  {post.metadata.summary}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-(--text-p)">
                    {formatDate(post.metadata.publishedAt, false)}
                  </span>
                  {post.metadata.tags && post.metadata.tags[0] && (
                    <span className="nav-shimmer text-xs px-2 py-1 bg-(--callout-bg) rounded-md text-(--text-p)">
                      {post.metadata.tags[0]}
                    </span>
                  )}
                </div>
              </div>
              <div className="nav-shimmer px-4 py-2 bg-bronzer border-2 border-bronzer text-(--bg-color) rounded-lg group-hover:scale-105 transition-transform text-xs font-semibold whitespace-nowrap shadow-lg">
                Read Post
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
      <Link
        href="/blog"
        onClick={onClose}
        className="nav-shimmer block text-center px-4 py-3 bg-(--callout-bg) border-2 border-callout text-(--text-color) rounded-xl hover:bg-bronzer/20 hover:border-bronzer hover:scale-105 transition-all text-sm font-semibold shadow-md"
      >
        View All Posts →
      </Link>
    </motion.div>
  );

  return (
    <>
      {/* Desktop View - Full Screen */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="hidden md:flex fixed inset-0 z-100 bg-(--bg-color)/95 backdrop-blur-2xl flex-col overflow-hidden"
      >
        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-8">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-10 py-16"
              >
                <div>
                  <h3 className="text-3xl font-bold text-(--text-color) mb-3">
                    How can I help you today?
                  </h3>
                  <p className="text-(--text-p) text-lg">
                    Ask me anything about Somrit's work, skills, or background
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {PROMPT_CARDS.map((card, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => handleSend(card.query)}
                      className="p-5 bg-(--card-bg) border-2 border-callout rounded-2xl hover:shadow-xl hover:scale-105 hover:border-bronzer transition-all text-left group nav-shimmer"
                    >
                      <p className="text-sm font-semibold text-(--text-color) group-hover:text-(--bronzer) transition-colors">
                        {card.text}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            <div className="space-y-6">
              {messages.map((msg, idx) => (
                <div key={idx} className="space-y-4">
                  {msg.role === "user" && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex justify-end"
                    >
                      <div className="max-w-[75%] nav-shimmer bg-bronzer border-2 border-bronzer text-(--bg-color) rounded-2xl px-5 py-3 shadow-md">
                        <p className="text-sm font-medium">{msg.content}</p>
                      </div>
                    </motion.div>
                  )}

                  {msg.role === "assistant" && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <div className="max-w-[75%] bg-(--card-bg) rounded-2xl px-5 py-3 shadow-sm nav-shimmer">
                        <p className="text-sm text-(--text-color) whitespace-pre-line">
                          {msg.content}
                        </p>
                      </div>

                      {msg.card === "profile" && <ProfileCard />}
                      {msg.card === "projects" && msg.data && (
                        <ProjectsCard projects={msg.data} />
                      )}
                      {msg.card === "blog" && msg.data && (
                        <BlogCard posts={msg.data} />
                      )}

                      {msg.data?.navigate && (
                        <Link
                          href={msg.data.navigate}
                          onClick={onClose}
                          className="nav-shimmer inline-block px-5 py-2.5 bg-bronzer border-2 border-bronzer text-(--bg-color) rounded-xl hover:scale-105 transition-transform text-sm font-semibold shadow-lg"
                        >
                          Go to Page →
                        </Link>
                      )}

                      {msg.data?.postSlug && (
                        <Link
                          href={`/blog/${msg.data.postSlug}`}
                          onClick={onClose}
                          className="nav-shimmer inline-block px-5 py-2.5 bg-bronzer border-2 border-bronzer text-(--bg-color) rounded-xl hover:scale-105 transition-transform text-sm font-semibold shadow-lg"
                        >
                          Read Full Article →
                        </Link>
                      )}

                      {msg.data?.link && (
                        <Link
                          href={msg.data.link}
                          onClick={onClose}
                          className="nav-shimmer inline-block px-5 py-2.5 bg-bronzer border-2 border-bronzer text-(--bg-color) rounded-xl hover:scale-105 transition-transform text-sm font-semibold shadow-lg"
                        >
                          View Page →
                        </Link>
                      )}

                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {msg.suggestions.map((suggestion, i) => (
                            <button
                              key={i}
                              onClick={() => handleSend(suggestion)}
                              className="nav-shimmer px-3 py-1.5 bg-(--callout-bg) border-2 border-callout text-(--text-color) rounded-lg hover:bg-bronzer/20 hover:border-bronzer hover:scale-105 transition-all text-xs font-semibold shadow-sm"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-(--card-bg) rounded-2xl px-5 py-3 shadow-sm nav-shimmer">
                    <div className="flex gap-1.5">
                      <span
                        className="w-2 h-2 bg-(--text-p) rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-(--text-p) rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-(--text-p) rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="nav-shimmer bg-(--card-bg)/80 backdrop-blur-xl shadow-lg">
          <div className="max-w-5xl mx-auto px-6 py-5">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything about Somrit..."
                className="flex-1 px-5 py-3 nav-shimmer bg-(--callout-bg) border-2 border-callout rounded-xl text-(--text-color) placeholder:text-(--text-p)/50 focus:outline-none focus:ring-2 focus:ring-(--bronzer)/50 focus:border-bronzer transition-all text-sm"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="nav-shimmer w-12 h-12 bg-bronzer border-2 border-bronzer text-(--bg-color) rounded-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-transform shadow-lg flex items-center justify-center"
                title="Send message"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="nav-shimmer w-12 h-12 bg-(--callout-bg) border-2 border-callout text-(--text-color) rounded-xl hover:scale-105 hover:border-bronzer hover:text-(--bronzer) transition-all shadow-md flex items-center justify-center"
                title="Close chat"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile View - Bottom Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="md:hidden fixed inset-0 z-100 flex flex-col"
        style={{ top: "10%" }}
      >
        <div className="flex-1 bg-(--bg-color)/95 backdrop-blur-2xl rounded-t-3xl overflow-hidden shadow-2xl flex flex-col">
          {/* Drag Handle */}
          <div className="pt-3 pb-2 flex justify-center">
            <div className="w-12 h-1 bg-(--text-p)/30 rounded-full"></div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4">
            <div className="max-w-5xl mx-auto py-4">
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-6 py-8"
                >
                  <div>
                    <h3 className="text-2xl font-bold text-(--text-color) mb-2">
                      How can I help you today?
                    </h3>
                    <p className="text-(--text-p) text-sm">
                      Ask me anything about Somrit's work, skills, or background
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {PROMPT_CARDS.map((card, idx) => (
                      <motion.button
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => handleSend(card.query)}
                        className="p-4 bg-(--card-bg) border-2 border-callout rounded-2xl hover:shadow-xl hover:scale-105 hover:border-bronzer transition-all text-left group nav-shimmer"
                      >
                        <p className="text-sm font-semibold text-(--text-color) group-hover:text-(--bronzer) transition-colors">
                          {card.text}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="space-y-6">
                {messages.map((msg, idx) => (
                  <div key={idx} className="space-y-4">
                    {msg.role === "user" && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex justify-end"
                      >
                        <div className="max-w-[75%] nav-shimmer bg-bronzer border-2 border-bronzer text-(--bg-color) rounded-2xl px-5 py-3 shadow-md">
                          <p className="text-sm font-medium">{msg.content}</p>
                        </div>
                      </motion.div>
                    )}

                    {msg.role === "assistant" && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                      >
                        <div className="max-w-[75%] bg-(--card-bg) border-2 border-callout rounded-2xl px-5 py-3 shadow-sm nav-shimmer">
                          <p className="text-sm text-(--text-color) whitespace-pre-line">
                            {msg.content}
                          </p>
                        </div>

                        {msg.card === "profile" && <ProfileCard />}
                        {msg.card === "projects" && msg.data && (
                          <ProjectsCard projects={msg.data} />
                        )}
                        {msg.card === "blog" && msg.data && (
                          <BlogCard posts={msg.data} />
                        )}

                        {msg.data?.link && (
                          <Link
                            href={msg.data.link}
                            onClick={onClose}
                            className="nav-shimmer inline-block px-5 py-2.5 bg-bronzer border-2 border-bronzer text-(--bg-color) rounded-xl hover:scale-105 transition-transform text-sm font-semibold shadow-lg"
                          >
                            View Page →
                          </Link>
                        )}

                        {msg.suggestions && msg.suggestions.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {msg.suggestions.map((suggestion, i) => (
                              <button
                                key={i}
                                onClick={() => handleSend(suggestion)}
                                className="nav-shimmer px-3 py-1.5 bg-(--callout-bg) border-2 border-callout text-(--text-color) rounded-lg hover:bg-bronzer/20 hover:border-bronzer hover:scale-105 transition-all text-xs font-semibold shadow-sm"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-(--card-bg) border-2 border-callout rounded-2xl px-5 py-3 shadow-sm nav-shimmer">
                      <div className="flex gap-1.5">
                        <span
                          className="w-2 h-2 bg-(--text-p) rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <span
                          className="w-2 h-2 bg-(--text-p) rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <span
                          className="w-2 h-2 bg-(--text-p) rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="nav-shimmer bg-(--card-bg)/95 backdrop-blur-xl shadow-lg">
            <div className="px-4 py-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-3 nav-shimmer bg-(--callout-bg) border-2 border-callout rounded-xl text-(--text-color) placeholder:text-(--text-p)/50 focus:outline-none focus:ring-2 focus:ring-(--bronzer)/50 focus:border-bronzer transition-all text-sm"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="nav-shimmer w-12 h-12 bg-bronzer border-2 border-bronzer text-(--bg-color) rounded-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-transform shadow-lg flex items-center justify-center"
                  title="Send message"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
                <button
                  onClick={onClose}
                  className="nav-shimmer w-12 h-12 bg-(--callout-bg) border-2 border-callout text-(--text-color) rounded-xl hover:scale-105 hover:border-bronzer hover:text-(--bronzer) transition-all shadow-md flex items-center justify-center"
                  title="Close chat"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
