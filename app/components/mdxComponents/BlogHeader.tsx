"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FiList,
  FiChevronDown,
  FiPlay,
  FiPause,
  FiShare2,
} from "react-icons/fi";
import { TbRewindBackward10, TbRewindForward10 } from "react-icons/tb";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function BlogHeader() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [pitch, setPitch] = useState(1);
  const utteranceRef = useRef<{
    utterance: SpeechSynthesisUtterance;
    text: string;
    position: number;
  } | null>(null);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [readingTime, setReadingTime] = useState("");
  const keepAliveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // For AI-powered voices (optional upgrade):
  // Consider using ElevenLabs, PlayHT, or Google Cloud TTS for more natural reading
  // These services offer emotion-aware, context-sensitive speech synthesis

  // Extract only readable content from article, excluding metadata and schema
  const extractReadableContent = (): string => {
    const article = document.querySelector("article");
    if (!article) return "";

    const articleClone = article.cloneNode(true) as HTMLElement;

    // Remove all metadata, schema, and non-readable elements
    const selectorsToRemove = [
      "script",
      "style",
      "noscript",
      "iframe",
      "object",
      "embed",
      "svg",
      '[type="application/ld+json"]',
      "[itemtype]",
      "[itemscope]",
      "meta",
      "link",
      "head",
      "nav",
      'header[role="banner"]',
      "aside",
      "button",
      '[aria-hidden="true"]',
      "[data-schema]",
      '[class*="schema"]',
      '[class*="metadata"]',
      '[class*="hidden"]',
      "time[datetime]",
      "[data-nosnippet]",
      ".sr-only",
      "[hidden]",
    ];

    selectorsToRemove.forEach((selector) => {
      try {
        articleClone.querySelectorAll(selector).forEach((el) => el.remove());
      } catch (e) {
        // Ignore selector errors
      }
    });

    // Get text only from content paragraphs, headings, and lists
    const readableElements = articleClone.querySelectorAll(
      "p, h1, h2, h3, h4, h5, h6, li, blockquote, td, th, figcaption, dd, dt"
    );

    let content = "";
    readableElements.forEach((el) => {
      const text = el.textContent || "";
      const trimmed = text.trim();
      // Skip very short text that might be labels or metadata
      if (trimmed && trimmed.length > 3) {
        content += trimmed + " ";
      }
    });

    // Fallback to full article text if no content found
    return content.trim() || article.textContent || "";
  };

  useEffect(() => {
    const initVoices = () => {
      const voices = window.speechSynthesis.getVoices();

      // Prioritize high-quality, natural-sounding voices
      const preferredVoice =
        // First preference: Premium/Natural voices
        voices.find(
          (v) =>
            v.lang.startsWith("en") &&
            (v.name.includes("Premium") ||
              v.name.includes("Natural") ||
              v.name.includes("Neural") ||
              v.name.includes("Enhanced"))
        ) ||
        // Second preference: Specific high-quality voices
        voices.find(
          (v) =>
            v.lang.startsWith("en") &&
            (v.name.includes("Samantha") ||
              v.name.includes("Daniel") ||
              v.name.includes("Karen") ||
              v.name.includes("Alex"))
        ) ||
        // Third preference: Any US English voice
        voices.find((v) => v.lang === "en-US") ||
        // Fallback: Any English voice
        voices.find((v) => v.lang.startsWith("en")) ||
        // Last resort: First available voice
        voices[0];

      setVoice(preferredVoice);
    };

    if (typeof speechSynthesis !== "undefined") {
      initVoices();
      speechSynthesis.onvoiceschanged = initVoices;
    }

    return () => {
      if (typeof speechSynthesis !== "undefined") {
        speechSynthesis.cancel();
      }
      if (keepAliveIntervalRef.current) {
        clearInterval(keepAliveIntervalRef.current);
      }
    };
  }, []);

  const processTextForSpeech = (text: string): string => {
    let processed = text;

    // Remove schema.org and metadata patterns
    processed = processed
      .replace(/https?:\/\/schema\.org\/\w+/gi, " ") // Remove schema.org URLs
      .replace(
        /\b(context|type|itemtype|itemprop|itemscope|headline|datePublished|author|creator)\b/gi,
        " "
      ) // Remove schema keywords
      .replace(/BlogPosting|Article|Person|Organization|WebPage/gi, " "); // Remove schema types

    // Remove code blocks and inline code
    processed = processed
      .replace(/```[\s\S]*?```/g, " ") // Remove code blocks
      .replace(/`[^`]+`/g, " "); // Remove inline code

    // Remove HTML tags and entities
    processed = processed
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ") // Remove scripts
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ") // Remove styles
      .replace(/<[^>]+>/g, " ") // Remove all HTML tags
      .replace(/&nbsp;/gi, " ") // Replace non-breaking spaces
      .replace(/&quot;/gi, '"') // Replace quotes
      .replace(/&apos;/gi, "'") // Replace apostrophes
      .replace(/&amp;/gi, "and") // Replace ampersands
      .replace(/&lt;/gi, "") // Remove less than
      .replace(/&gt;/gi, "") // Remove greater than
      .replace(/&[a-z]+;/gi, " "); // Remove other entities

    // Remove markdown syntax
    processed = processed
      .replace(/^#+\s+/gm, "") // Remove heading markers
      .replace(/\*\*([^*]+)\*\*/g, "$1") // Remove bold
      .replace(/\*([^*]+)\*/g, "$1") // Remove italic
      .replace(/~~([^~]+)~~/g, "$1") // Remove strikethrough
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Keep link text only
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "") // Remove images
      .replace(/^[*-]\s+/gm, "") // Remove list markers
      .replace(/^\d+\.\s+/gm, ""); // Remove numbered list markers

    // Remove URLs
    processed = processed
      .replace(/https?:\/\/[^\s]+/gi, " ") // Remove all URLs
      .replace(/www\.[^\s]+/gi, " "); // Remove www URLs

    // Remove special characters and symbols
    processed = processed
      .replace(/[#*`~|<>{}\[\]\\\/]/g, " ") // Remove special chars
      .replace(/[_]/g, " "); // Remove underscores

    // Handle punctuation for natural pauses
    processed = processed
      .replace(/([.!?])\s*/g, "$1 ") // Space after sentence endings
      .replace(/([,;:])\s*/g, "$1 ") // Space after commas, semicolons, colons
      .replace(/\.\.\./g, "...") // Preserve ellipsis
      .replace(/([.!?])\1+/g, "$1") // Remove duplicate punctuation
      .replace(/\s*-\s*/g, " ") // Replace dashes with spaces
      .replace(/\s*—\s*/g, ". ") // Replace em-dashes with period for pause
      .replace(/\s*–\s*/g, ". "); // Replace en-dashes with period for pause

    // Clean up parentheses and brackets
    processed = processed
      .replace(/\([^)]*\)/g, "") // Remove parenthetical content
      .replace(/\[[^\]]*\]/g, ""); // Remove bracketed content

    // Normalize whitespace and newlines
    processed = processed
      .replace(/\n{3,}/g, ". ") // Multiple newlines = pause
      .replace(/\n{2}/g, ". ") // Double newline = sentence break
      .replace(/\n/g, " ") // Single newline = space
      .replace(/\s{2,}/g, " ") // Multiple spaces to single
      .replace(/\s+([.!?,;:])/g, "$1") // Remove space before punctuation
      .trim();

    // Remove any remaining unwanted characters
    processed = processed
      .replace(/[^\w\s.!?,;:'"()-]/g, " ") // Keep only alphanumeric and basic punctuation
      .replace(/\s+/g, " ") // Final whitespace cleanup
      .trim();

    return processed;
  };

  useEffect(() => {
    const article = document.querySelector("article");
    if (!article) return;

    const elements = Array.from(article.querySelectorAll("h2, h3, h4"));
    const headingItems = elements.map((element) => ({
      id: element.id,
      text: element.textContent?.replace(/^#+\s*/, "") || "",
      level: Number(element.tagName.charAt(1)),
    }));

    setHeadings(headingItems);

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          const mostVisible = visibleEntries.reduce((prev, current) => {
            return current.intersectionRatio > prev.intersectionRatio
              ? current
              : prev;
          });
          setActiveId(mostVisible.target.id);
        }
      },
      {
        rootMargin: "-10% 0px -80% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    elements.forEach((elem) => observer.observe(elem));

    const text = processTextForSpeech(extractReadableContent());

    // Split text into sentences for dynamic speech variation
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

    // Analyze sentence and determine natural speech parameters
    const analyzeSentence = (sentence: string, index: number) => {
      const trimmed = sentence.trim();
      let pitch = 1.0;
      let rate = 1; // Fixed normal speed
      let pauseAfter = 200; // ms

      // Add micro-variation to avoid monotony
      const microVariation = (Math.random() - 0.5) * 0.06; // ±0.03
      pitch += microVariation;
      rate += microVariation * 0.1;

      // Questions: Rising intonation
      if (trimmed.includes("?")) {
        pitch += 0.15;
        rate *= 0.92;
        pauseAfter = 350;
      }
      // Exclamations: Emphasis and energy
      else if (trimmed.includes("!")) {
        pitch += 0.18;
        rate *= 1.05;
        pauseAfter = 400;
      }
      // Commas or lists: Brief pauses
      else if ((trimmed.match(/,/g) || []).length > 2) {
        rate *= 0.94;
        pauseAfter = 250;
      }
      // Parenthetical remarks: Lower tone
      else if (trimmed.includes("(") || trimmed.includes("—")) {
        pitch -= 0.08;
        rate *= 0.96;
      }
      // Quotes: Character voice variation
      else if (trimmed.includes('"') || trimmed.includes("'")) {
        pitch += 0.1;
        rate *= 0.98;
      }
      // ALL CAPS words: Emphasis
      else if (trimmed.match(/\b[A-Z]{3,}\b/)) {
        pitch += 0.12;
        rate *= 0.9;
        pauseAfter = 300;
      }
      // Numbers or technical terms: Clarity
      else if (
        trimmed.match(/\d+|[A-Z]{2,}[a-z]+/) ||
        trimmed.includes("API") ||
        trimmed.includes("HTTP")
      ) {
        rate *= 0.88;
        pauseAfter = 280;
      }
      // Long sentences: Slower for comprehension
      else if (trimmed.length > 120) {
        rate *= 0.92;
        pauseAfter = 320;
      }
      // Short sentences: Crisp delivery
      else if (trimmed.length < 40) {
        rate *= 1.02;
        pauseAfter = 180;
      }

      // Paragraph rhythm: Fresh tone every few sentences
      if (index % 4 === 0 && index > 0) {
        pitch += 0.05;
        pauseAfter = 450; // Breathing pause
      }

      // Sentence endings: Natural falling pitch
      if (trimmed.endsWith(".") && !trimmed.endsWith("...")) {
        pitch -= 0.03;
      }

      // Constrain values to reasonable ranges
      pitch = Math.max(0.8, Math.min(1.3, pitch));
      rate = Math.max(0.5, Math.min(2.0, rate));
      pauseAfter = Math.max(100, Math.min(600, pauseAfter));

      return { pitch, rate, pauseAfter };
    };

    // Create utterance queue with analyzed parameters
    const utteranceQueue = sentences.map((sentence, index) => ({
      text: sentence,
      params: analyzeSentence(sentence, index),
    }));

    // Start with first sentence
    const firstUtterance = new SpeechSynthesisUtterance(utteranceQueue[0].text);
    const firstParams = utteranceQueue[0].params;
    firstUtterance.rate = firstParams.rate;
    firstUtterance.pitch = firstParams.pitch;
    firstUtterance.volume = 1.0;
    firstUtterance.lang = "en-US";
    if (voice) firstUtterance.voice = voice;

    let currentSentenceIndex = 0;
    let charOffset = 0;

    firstUtterance.onboundary = (event) => {
      if (event.name === "word") {
        charOffset =
          utteranceQueue
            .slice(0, currentSentenceIndex)
            .reduce((sum, u) => sum + u.text.length, 0) + event.charIndex;
      }
    };

    firstUtterance.onend = () => {
      currentSentenceIndex++;

      if (currentSentenceIndex < utteranceQueue.length && !isPaused) {
        // Natural pause between sentences
        setTimeout(
          () => {
            if (!isPaused) {
              const nextUtterance = new SpeechSynthesisUtterance(
                utteranceQueue[currentSentenceIndex].text
              );
              const params = utteranceQueue[currentSentenceIndex].params;

              nextUtterance.rate = params.rate;
              nextUtterance.pitch = params.pitch;
              nextUtterance.volume = 1.0;
              nextUtterance.lang = "en-US";
              if (voice) nextUtterance.voice = voice;

              nextUtterance.onboundary = firstUtterance.onboundary;
              nextUtterance.onend = firstUtterance.onend;

              speechSynthesis.speak(nextUtterance);
            }
          },
          utteranceQueue[currentSentenceIndex - 1].params.pauseAfter
        );
      } else {
        setIsPlaying(false);
        setIsPaused(false);
        setCharIndex(0);
      }
    };

    utteranceRef.current = {
      utterance: firstUtterance,
      text,
      position: 0,
    };

    return () => {
      observer.disconnect();
      speechSynthesis.cancel();
      if (keepAliveIntervalRef.current) {
        clearInterval(keepAliveIntervalRef.current);
      }
    };
  }, [voice]);

  useEffect(() => {
    const article = document.querySelector("article");
    if (article) {
      const words = article.textContent?.split(/\s+/).length || 0;
      const minutes = Math.ceil(words / 180);
      setReadingTime(`${minutes} min read`);
    }
  }, []);

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Handle pause - use cancel for instant stop
    if (isPlaying && speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(true);
      if (keepAliveIntervalRef.current) {
        clearInterval(keepAliveIntervalRef.current);
      }
      return;
    }

    // Handle play/resume
    if (utteranceRef.current && voice) {
      try {
        speechSynthesis.cancel();

        const textToRead =
          isPaused && charIndex > 0
            ? utteranceRef.current.text.slice(charIndex)
            : utteranceRef.current.text;

        const utterance = new SpeechSynthesisUtterance(textToRead);

        // Configure for natural speech (fixed rate since speed control removed)
        utterance.rate = 0.95;
        utterance.pitch = 1.05;
        utterance.voice = voice;
        utterance.volume = 1.0;
        utterance.lang = "en-US";

        // Track position for resume functionality
        utterance.onboundary = (event) => {
          if (event.name === "word") {
            setCharIndex(
              isPaused && charIndex > 0
                ? charIndex + event.charIndex
                : event.charIndex
            );
          }
        };

        // Keep-alive for longer texts
        keepAliveIntervalRef.current = setInterval(() => {
          if (speechSynthesis.speaking && !speechSynthesis.paused) {
            speechSynthesis.pause();
            speechSynthesis.resume();
          } else if (!speechSynthesis.speaking) {
            if (keepAliveIntervalRef.current) {
              clearInterval(keepAliveIntervalRef.current);
            }
          }
        }, 14000);

        utterance.onend = () => {
          if (keepAliveIntervalRef.current) {
            clearInterval(keepAliveIntervalRef.current);
          }
          setIsPlaying(false);
          setIsPaused(false);
          setCharIndex(0);
        };

        utterance.onerror = (event) => {
          console.error("Speech synthesis error:", event);
          if (keepAliveIntervalRef.current) {
            clearInterval(keepAliveIntervalRef.current);
          }
          setIsPlaying(false);
          setIsPaused(false);
        };

        speechSynthesis.speak(utterance);
        setIsPlaying(true);
        setIsPaused(false);
      } catch (error) {
        console.error("Error starting speech:", error);
        setIsPlaying(false);
        setIsPaused(false);
      }
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: document.title,
        url: window.location.href,
      });
    } catch (err) {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const scrollToHeading = (headingId: string) => {
    const element = document.getElementById(headingId);
    if (element) {
      const top =
        element.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveId(headingId);
    }
  };

  if (headings.length === 0) return null;

  return (
    <div className="my-4 sm:my-6 rounded-xl bg-gradient-to-br from-[var(--card-bg)]/40 via-[var(--card-bg)]/30 to-[var(--card-bg)]/20 border border-[var(--bronzer)]/10 backdrop-blur-sm overflow-hidden shadow-sm">
      <div className="flex items-center justify-between p-2 sm:p-4 border-b border-[var(--bronzer)]/10">
        <div className="flex items-center gap-2">
          {/* Play button */}
          <button
            onClick={handlePlayPause}
            className="p-2 bg-[var(--bronzer)]/5 hover:bg-[var(--bronzer)]/10 rounded-full transition-all duration-300 text-[var(--bronzer)]"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <FiPause size={16} /> : <FiPlay size={16} />}
          </button>

          <span className="inline text-xs text-[var(--text-p)]/80">
            {readingTime}
          </span>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 hover:bg-[var(--bronzer)]/10 rounded-full transition-all duration-300"
          >
            <FiShare2 size={16} />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-[var(--bronzer)]/10 rounded-full transition-all duration-300"
          >
            <FiChevronDown
              className={`transition-transform duration-300 ${
                isExpanded ? "rotate-180" : ""
              }`}
              size={14}
            />
          </button>
        </div>
      </div>

      {/* Table of Contents */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded
            ? "max-h-[70vh] opacity-100 border-t border-[var(--bronzer)]/10"
            : "max-h-0 opacity-0"
        } overflow-hidden bg-[var(--bronzer)]/5`}
      >
        <ul className="p-4 space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {headings.map((heading) => (
            <li
              key={heading.id}
              style={{
                paddingLeft: `${(heading.level - 2) * 1}rem`,
              }}
            >
              <button
                onClick={() => scrollToHeading(heading.id)}
                className={`group w-full text-left py-1.5 px-3 text-sm rounded-lg transition-all duration-300
                  ${
                    activeId === heading.id
                      ? "bg-[var(--bronzer)]/10 text-[var(--bronzer)] font-medium"
                      : "hover:bg-[var(--bronzer)]/5 text-[var(--text-p)]"
                  }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`w-1 h-1 rounded-full transition-all duration-300
                    ${activeId === heading.id ? "bg-[var(--bronzer)]" : "bg-current opacity-0 group-hover:opacity-50"}`}
                  />
                  {heading.text}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
