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
  const [thinkingStatus, setThinkingStatus] = useState<string>("");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [countdownDestination, setCountdownDestination] = useState<string>("");
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

  // Countdown timer effect
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

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
    blog: [
      "blog",
      "article",
      "post",
      "write",
      "written",
      "read",
      "latest",
      "author",
    ],
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

  // Smart fuzzy matching helper
  const fuzzyMatch = (text: string, patterns: string[]): boolean => {
    const cleanText = text.toLowerCase().replace(/[^a-z0-9\s]/g, "");
    const words = cleanText.split(/\s+/).filter((w) => w.length > 2);

    return patterns.some((pattern) => {
      const patternWords = pattern.toLowerCase().split(/\s+/);
      return patternWords.some((pw) =>
        words.some((w) => w.includes(pw) || pw.includes(w)),
      );
    });
  };

  // Extract meaningful keywords from query
  const extractKeywords = (query: string): string[] => {
    const stopWords = [
      "what",
      "does",
      "he",
      "she",
      "the",
      "a",
      "an",
      "is",
      "are",
      "can",
      "do",
      "did",
    ];
    return query
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.includes(word));
  };

  // Navigation helper with countdown
  const navigateWithCountdown = (path: string, description: string) => {
    setCountdownDestination(description);
    setCountdown(3);

    setTimeout(() => {
      onClose();
      router.push(path);
    }, 3000);
  };

  const getResponse = useCallback(
    async (query: string): Promise<Message> => {
      const lowerQuery = query.toLowerCase();

      // Greeting responses (check first)
      if (/^(hi|hello|hey|greetings|sup)(\s|$)/i.test(lowerQuery)) {
        const greetings = [
          "Hey! 👋 What would you like to know about me?",
          "Hi there! Feel free to ask me anything!",
          "Hello! What brings you here today?",
        ];
        return {
          role: "assistant",
          content: greetings[Math.floor(Math.random() * greetings.length)],
          suggestions: [
            "Who are you?",
            "Show your projects",
            "What do you write about?",
          ],
        };
      }

      // Thanks responses
      if (lowerQuery.includes("thanks") || lowerQuery.includes("thank you")) {
        return {
          role: "assistant",
          content: "You're welcome! Anything else you'd like to know? 😊",
          suggestions: [
            "Show your projects",
            "What do you write?",
            "Tell me about your skills",
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
        setThinkingStatus("Analyzing query and searching posts...");
        try {
          const response = await fetch("/api/blog-posts");
          const data = await response.json();
          const posts = data.posts || [];
          setThinkingStatus("Finding the best match...");

          // Extract the subject (remove question words)
          const subject = lowerQuery
            .replace(/what is (the |a )?/g, "")
            .replace(/tell me about (the |a )?/g, "")
            .replace(/summarize (the |a )?/g, "")
            .replace(/summary of (the |a )?/g, "")
            .replace(/explain (the |a )?/g, "")
            .trim();

          // Try to find matching post with improved fuzzy matching
          const matchingPost = posts.find((p: any) => {
            const slug = p.slug?.toLowerCase() || "";
            const title = p.metadata?.title?.toLowerCase() || "";
            const summary = p.metadata?.summary?.toLowerCase() || "";

            // Split slug and subject into words
            const slugWords = slug.split("-");
            const titleWords = title.split(/\s+/);
            const subjectWords = subject
              .split(/\s+/)
              .filter((w) => w.length > 2);

            // Single word matching - check if any subject word matches slug/title words
            const singleWordMatch = subjectWords.some(
              (sw) =>
                slugWords.some(
                  (slugWord) => slugWord.includes(sw) || sw.includes(slugWord),
                ) ||
                titleWords.some(
                  (titleWord) =>
                    titleWord.includes(sw) || sw.includes(titleWord),
                ),
            );

            // Count matching words for better scoring
            const matchCount = subjectWords.filter(
              (sw) =>
                slugWords.some(
                  (slugWord) => slugWord.includes(sw) || sw.includes(slugWord),
                ) ||
                titleWords.some(
                  (titleWord) =>
                    titleWord.includes(sw) || sw.includes(titleWord),
                ),
            ).length;

            return (
              matchCount >= 1 || // At least 1 word match (improved from 2)
              singleWordMatch || // Single word match
              slug.includes(subject.replace(/\s+/g, "-")) || // Direct slug match
              subject.includes(slug.replace(/-/g, " ")) || // Reverse match
              title.includes(subject) || // Title contains subject
              summary.includes(subject) // Summary contains subject
            );
          });

          if (matchingPost) {
            setThinkingStatus("");
            return {
              role: "assistant",
              content: `✨ **Found it!**\n\n**"${matchingPost.metadata?.title}"**\n\n📝 ${matchingPost.metadata?.summary || "An insightful article exploring this topic."}\n\n📅 Published: ${matchingPost.metadata?.publishedAt ? new Date(matchingPost.metadata.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Recently"}`,
              data: { postSlug: matchingPost.slug },
              suggestions: [
                "Read full article",
                "Show more posts",
                "What are your projects?",
              ],
            };
          } else {
            setThinkingStatus("");
            return {
              role: "assistant",
              content: `I couldn't find a specific post matching "${subject}", but here are all recent articles you might find interesting:`,
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
          setThinkingStatus("");
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

      // PRIORITY 2: Smart blog content detection - handles "what does he write" etc.
      const queryKeywords = extractKeywords(lowerQuery);
      const hasBlogIntent = fuzzyMatch(lowerQuery, [
        "write",
        "wrote",
        "writing",
        "author",
        "blog",
        "article",
        "post",
        "publish",
        "content",
        "topics",
      ]);

      // Check if query is asking about blog/writing content
      if (
        hasBlogIntent &&
        !lowerQuery.includes("what is") &&
        !lowerQuery.includes("summarize")
      ) {
        setThinkingStatus("Searching through blog posts...");
        try {
          const response = await fetch("/api/blog-posts");
          const data = await response.json();
          setThinkingStatus("");
          return {
            role: "assistant",
            content: "📝 Here's what I've been writing about:",
            card: "blog",
            data: data.posts?.slice(0, 4) || [],
            suggestions: [
              "Tell me about a specific post",
              "Show me your projects",
              "What skills do you have?",
            ],
          };
        } catch (error) {
          setThinkingStatus("");
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

      // PRIORITY: Specific project queries - check if asking about a particular project
      const projectKeywords = [
        "project",
        "repo",
        "repository",
        "code",
        "github",
      ];
      if (
        projectKeywords.some((kw) => lowerQuery.includes(kw)) &&
        (lowerQuery.includes("about") ||
          lowerQuery.includes("what is") ||
          lowerQuery.includes("tell me") ||
          lowerQuery.includes("explain") ||
          lowerQuery.includes("show me"))
      ) {
        setThinkingStatus("Searching through GitHub projects...");
        try {
          const response = await fetch("/api/github", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          });
          const projects = await response.json();
          setThinkingStatus("Finding the best match...");

          if (Array.isArray(projects)) {
            // Extract the project name from query
            const projectQuery = lowerQuery
              .replace(/what is (the |a )?/g, "")
              .replace(/tell me about (the |a )?/g, "")
              .replace(/explain (the |a )?/g, "")
              .replace(/show me (the |a )?/g, "")
              .replace(/project|repo|repository|code|github/g, "")
              .trim();

            // Find matching project
            const matchingProject = projects.find((p: any) => {
              const name = p.name?.toLowerCase() || "";
              const description = p.description?.toLowerCase() || "";
              const nameWords = name.split(/[-_\s]+/);
              const queryWords = projectQuery
                .split(/\s+/)
                .filter((w) => w.length > 2);

              // Single word or multi-word matching
              const wordMatch = queryWords.some((qw) =>
                nameWords.some((nw) => nw.includes(qw) || qw.includes(nw)),
              );

              return (
                wordMatch ||
                name.includes(projectQuery) ||
                projectQuery.includes(name) ||
                description.includes(projectQuery)
              );
            });

            if (matchingProject) {
              setThinkingStatus("");
              return {
                role: "assistant",
                content: `✨ **Found it!**\n\n**${matchingProject.name}**\n\n📝 ${matchingProject.description || "An interesting project exploring various technologies."}\n\n🌟 Stars: ${matchingProject.stargazers_count || 0}\n💻 Language: ${matchingProject.language || "Multiple"}\n\n${matchingProject.topics?.length ? `**Tech Stack:** ${matchingProject.topics.slice(0, 5).join(", ")}` : ""}`,
                data: { link: matchingProject.html_url },
                suggestions: [
                  "View on GitHub",
                  "Show more projects",
                  "What do you write about?",
                ],
              };
            }
          }

          setThinkingStatus("");
        } catch (error) {
          setThinkingStatus("");
        }
      }

      // Projects queries
      if (keywords.projects.some((kw) => lowerQuery.includes(kw))) {
        setThinkingStatus("Fetching projects from GitHub...");
        const response = await fetch("/api/github", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        })
          .then((r) => r.json())
          .catch(() => []);
        setThinkingStatus("");

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
            ? "💻 Here's what I've been working on recently:"
            : lowerQuery.includes("popular") || lowerQuery.includes("best")
              ? "🌟 Here are some of my featured projects:"
              : "🚀 Here are some projects I've built:";

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

      // PRIORITY: Specific skill queries - check if asking about a particular skill/technology
      const skillQueryTerms = [
        "skill",
        "technology",
        "tech",
        "language",
        "framework",
        "tool",
      ];
      if (
        skillQueryTerms.some((term) => lowerQuery.includes(term)) &&
        (lowerQuery.includes("about") ||
          lowerQuery.includes("with") ||
          lowerQuery.includes("use") ||
          lowerQuery.includes("know"))
      ) {
        setThinkingStatus("Analyzing technology expertise...");
        try {
          const projectsRes = await fetch("/api/github", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          });
          const projects = await projectsRes.json();

          if (Array.isArray(projects)) {
            // Extract the skill/tech name from query
            const skillQuery = lowerQuery
              .replace(
                /what|about|with|do you|know|use|skill|technology|tech|language|framework|tool/g,
                "",
              )
              .trim();

            // Find projects using that technology
            const relatedProjects = projects.filter((p: any) => {
              const topics = (p.topics || []).map((t: string) =>
                t.toLowerCase(),
              );
              const language = (p.language || "").toLowerCase();
              const name = (p.name || "").toLowerCase();
              const description = (p.description || "").toLowerCase();

              return (
                topics.some(
                  (t: string) =>
                    t.includes(skillQuery) || skillQuery.includes(t),
                ) ||
                language.includes(skillQuery) ||
                skillQuery.includes(language) ||
                name.includes(skillQuery) ||
                description.includes(skillQuery)
              );
            });

            if (relatedProjects.length > 0) {
              setThinkingStatus("");
              const skillName =
                skillQuery.charAt(0).toUpperCase() + skillQuery.slice(1);
              const projectList = relatedProjects
                .slice(0, 3)
                .map(
                  (p: any) =>
                    `• **${p.name}** - ${p.description || "Exploring this technology"}`,
                )
                .join("\n");

              return {
                role: "assistant",
                content: `💡 **Expertise in ${skillName}**\n\nI've worked with ${skillName} across ${relatedProjects.length} project${relatedProjects.length > 1 ? "s" : ""}:\n\n${projectList}\n\nThis technology is actively used in production projects.`,
                suggestions: [
                  "Show all projects",
                  "What else do you know?",
                  "Tell me about your work",
                ],
              };
            }
          }

          setThinkingStatus("");
        } catch (error) {
          setThinkingStatus("");
        }
      }

      // Skills with enhanced info
      if (keywords.skills.some((kw) => lowerQuery.includes(kw))) {
        setThinkingStatus("Analyzing skills from projects...");
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
            ? "🛠️ Here's my tech stack:"
            : lowerQuery.includes("all") || lowerQuery.includes("list")
              ? "📋 Here are the technologies I work with:"
              : "💡 I work with these technologies:";

          const skillsText =
            skills.length > 0
              ? `${context}\n\n${skills.map((s) => `• ${s}`).join("\n")}\n\nBased on my GitHub projects and real-world experience.`
              : "I specialize in web development, AI/ML, cloud technologies, and full-stack engineering. Check out my projects to see these technologies in action!";

          setThinkingStatus("");
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
          setThinkingStatus("");
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
          ? "📬 Great to hear! Here's how you can reach me:"
          : "💬 Let's connect! Here's how to reach out:";

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
          content: "👋 Let me introduce myself:",
          card: "profile",
          suggestions: [
            "Show your projects",
            "What do you write about?",
            "What are your skills?",
          ],
        };
      }

      // Activity queries
      if (
        lowerQuery.includes("activity") ||
        lowerQuery.includes("commit") ||
        lowerQuery.includes("recent work")
      ) {
        navigateWithCountdown("/activity", "GitHub Activity");
        return {
          role: "assistant",
          content: "📊 Taking you to my GitHub activity...",
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
        navigateWithCountdown("/bookmarks", "Bookmarks & Recommendations");
        return {
          role: "assistant",
          content:
            "🔖 Opening my curated bookmarks and tool recommendations...",
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
        const pageMap: Record<string, { path: string; label: string }> = {
          activity: { path: "/activity", label: "GitHub Activity" },
          bookmarks: { path: "/bookmarks", label: "Bookmarks" },
          projects: { path: "/projects", label: "Projects" },
          home: { path: "/", label: "Home" },
        };

        for (const [key, { path, label }] of Object.entries(pageMap)) {
          if (lowerQuery.includes(key)) {
            navigateWithCountdown(path, label);
            return {
              role: "assistant",
              content: `🚀 Taking you to ${label}...`,
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
          content: "🤔 I'd love to help! What would you like to know?",
          suggestions: [
            "Who are you?",
            "Show your projects",
            "What do you write about?",
            "What are your skills?",
            "How can I reach you?",
          ],
        };
      }

      // Default intelligent response with suggestions
      return {
        role: "assistant",
        content:
          "🤷 Hmm, I'm not sure what you're asking. Here's what I can help with:",
        suggestions: [
          "Who are you?",
          "Show your projects",
          "What do you write about?",
          "What's your tech stack?",
          "How can I reach you?",
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
          <Link
            href="/cv"
            className="nav-shimmer flex-1 text-center px-4 py-2.5 bg-(--callout-bg) border-2 border-callout text-(--text-color) rounded-xl hover:scale-105 hover:bg-bronzer/20 hover:border-bronzer transition-all text-sm font-semibold shadow-md"
          >
            View CV
          </Link>
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
                    👋 Hi, what do you want to know about me?
                  </h3>
                  <p className="text-(--text-p) text-lg">
                    Feel free to ask about my work, projects, or anything else!
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
                      <div className="max-w-[75%] bg-gradient-to-br from-bronzer to-bronzer/90 text-white rounded-[20px] rounded-tr-sm px-6 py-3.5 shadow-lg shadow-bronzer/20">
                        <p className="text-sm font-medium leading-relaxed">
                          {msg.content}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {msg.role === "assistant" && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-3 items-start"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-bronzer/20 mt-1"
                      >
                        <Image
                          src={profileData?.avatar || "/somritdasgupta.jpg"}
                          alt="Somrit"
                          fill
                          className="object-cover"
                        />
                      </motion.div>
                      <div className="flex-1 space-y-4">
                        <div className="max-w-[85%] bg-gradient-to-br from-(--card-bg) to-(--card-bg)/80 backdrop-blur-sm rounded-[20px] rounded-tl-sm px-6 py-3.5 shadow-lg shadow-black/5">
                          <p className="text-sm text-(--text-color) whitespace-pre-line leading-relaxed">
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
                          <button
                            onClick={() => {
                              const pageName =
                                msg.data.navigate.split("/").pop() || "Page";
                              navigateWithCountdown(
                                msg.data.navigate,
                                pageName.charAt(0).toUpperCase() +
                                  pageName.slice(1),
                              );
                            }}
                            className="nav-shimmer inline-block px-5 py-2.5 bg-bronzer border-2 border-bronzer text-(--bg-color) rounded-xl hover:scale-105 transition-transform text-sm font-semibold shadow-lg cursor-pointer"
                          >
                            Go to Page →
                          </button>
                        )}

                        {msg.data?.postSlug && (
                          <button
                            onClick={() => {
                              const postTitle =
                                messages
                                  .find(
                                    (m) =>
                                      m.data?.postSlug === msg.data.postSlug,
                                  )
                                  ?.content.match(/"([^"]+)"/)?.[1] ||
                                "Blog Post";
                              navigateWithCountdown(
                                `/blog/${msg.data.postSlug}`,
                                postTitle,
                              );
                            }}
                            className="nav-shimmer inline-block px-5 py-2.5 bg-bronzer border-2 border-bronzer text-(--bg-color) rounded-xl hover:scale-105 transition-transform text-sm font-semibold shadow-lg cursor-pointer"
                          >
                            Read Full Article →
                          </button>
                        )}

                        {msg.data?.link && (
                          <button
                            onClick={() => {
                              const isGitHub =
                                msg.data.link.includes("github.com");
                              if (isGitHub) {
                                window.open(msg.data.link, "_blank");
                              } else {
                                navigateWithCountdown(msg.data.link, "Page");
                              }
                            }}
                            className="nav-shimmer inline-block px-5 py-2.5 bg-bronzer border-2 border-bronzer text-(--bg-color) rounded-xl hover:scale-105 transition-transform text-sm font-semibold shadow-lg cursor-pointer"
                          >
                            {msg.data.link.includes("github.com")
                              ? "View on GitHub →"
                              : "View Page →"}
                          </button>
                        )}

                        {msg.suggestions && msg.suggestions.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {msg.suggestions.map((suggestion, i) => (
                              <button
                                key={i}
                                onClick={() => handleSend(suggestion)}
                                className="px-4 py-2 bg-(--callout-bg)/50 backdrop-blur-sm text-(--text-color) rounded-full hover:bg-bronzer/30 hover:scale-105 transition-all text-xs font-medium shadow-sm"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-3 items-start"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-bronzer/20 mt-1"
                  >
                    <Image
                      src={profileData?.avatar || "/somritdasgupta.jpg"}
                      alt="Somrit"
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                  <div className="flex-1 space-y-2">
                    <div className="max-w-[85%] bg-gradient-to-br from-(--card-bg) to-(--card-bg)/80 backdrop-blur-sm rounded-[20px] rounded-tl-sm px-6 py-3.5 shadow-lg shadow-black/5">
                      <div className="flex gap-1.5">
                        <span
                          className="w-2 h-2 bg-bronzer rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <span
                          className="w-2 h-2 bg-bronzer rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <span
                          className="w-2 h-2 bg-bronzer rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                    </div>
                    {thinkingStatus && (
                      <span className="text-xs text-(--text-p) italic animate-pulse ml-2">
                        {thinkingStatus}
                      </span>
                    )}
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
                      👋 Hi, what do you want to know?
                    </h3>
                    <p className="text-(--text-p) text-sm">
                      Ask me about my work, projects, or anything!
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
                        <div className="max-w-[75%] bg-gradient-to-br from-bronzer to-bronzer/90 text-white rounded-[20px] rounded-tr-sm px-5 py-3 shadow-lg shadow-bronzer/20">
                          <p className="text-sm font-medium leading-relaxed">
                            {msg.content}
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {msg.role === "assistant" && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-2.5 items-start"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.1 }}
                          className="relative w-7 h-7 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-bronzer/20 mt-0.5"
                        >
                          <Image
                            src={profileData?.avatar || "/somritdasgupta.jpg"}
                            alt="Somrit"
                            fill
                            className="object-cover"
                          />
                        </motion.div>
                        <div className="flex-1 space-y-4">
                          <div className="max-w-[90%] bg-gradient-to-br from-(--card-bg) to-(--card-bg)/80 backdrop-blur-sm rounded-[20px] rounded-tl-sm px-5 py-3 shadow-lg shadow-black/5">
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
                            <button
                              onClick={() => {
                                const isGitHub =
                                  msg.data.link.includes("github.com");
                                if (isGitHub) {
                                  window.open(msg.data.link, "_blank");
                                } else {
                                  navigateWithCountdown(msg.data.link, "Page");
                                }
                              }}
                              className="nav-shimmer inline-block px-5 py-2.5 bg-bronzer border-2 border-bronzer text-(--bg-color) rounded-xl hover:scale-105 transition-transform text-sm font-semibold shadow-lg cursor-pointer"
                            >
                              {msg.data.link.includes("github.com")
                                ? "View on GitHub →"
                                : "View Page →"}
                            </button>
                          )}

                          {msg.suggestions && msg.suggestions.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {msg.suggestions.map((suggestion, i) => (
                                <button
                                  key={i}
                                  onClick={() => handleSend(suggestion)}
                                  className="px-3 py-1.5 bg-(--callout-bg)/50 backdrop-blur-sm text-(--text-color) rounded-full hover:bg-bronzer/30 hover:scale-105 transition-all text-xs font-medium shadow-sm"
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
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
                    <div className="bg-gradient-to-br from-(--card-bg) to-(--card-bg)/80 backdrop-blur-sm rounded-[20px] rounded-tl-sm px-5 py-3 shadow-lg shadow-black/5">
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-1.5">
                          <span
                            className="w-2 h-2 bg-bronzer rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          />
                          <span
                            className="w-2 h-2 bg-bronzer rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          />
                          <span
                            className="w-2 h-2 bg-bronzer rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          />
                        </div>
                        {thinkingStatus && (
                          <span className="text-xs text-(--text-p) italic animate-pulse">
                            {thinkingStatus}
                          </span>
                        )}
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

      {/* Countdown Overlay */}
      <AnimatePresence>
        {countdown !== null && countdown > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-(--bg-color)/95 backdrop-blur-xl flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-6"
            >
              <motion.div
                key={countdown}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="text-8xl font-bold text-bronzer"
              >
                {countdown}
              </motion.div>
              <div className="space-y-2">
                <p className="text-2xl font-semibold text-(--text-color)">
                  Taking you to
                </p>
                <p className="text-xl text-bronzer font-bold">
                  {countdownDestination}
                </p>
              </div>
              <div className="flex gap-1.5 justify-center">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-2 h-2 bg-bronzer rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                  className="w-2 h-2 bg-bronzer rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                  className="w-2 h-2 bg-bronzer rounded-full"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
