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
import { RiSpeedLine } from "react-icons/ri";

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
  const [speed, setSpeed] = useState(1);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [pitch, setPitch] = useState(1);
  const utteranceRef = useRef<{
    utterance: SpeechSynthesisUtterance;
    text: string;
    position: number;
  } | null>(null);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [readingTime, setReadingTime] = useState("");

  useEffect(() => {
    const handleVoicesChanged = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) =>
          v.name.includes("Natural") ||
          v.name.includes("Neural") ||
          v.name.includes("Enhanced")
      );
      setVoice(preferredVoice || voices[0]);
    };

    speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);
    handleVoicesChanged();

    return () => {
      speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
    };
  }, []);

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

    const processTextForSpeech = (text: string) => {
      text = text.replace(/([.!?])\s+/g, "$1... ");
      text = text.replace(/"([^"]*)"/g, "... $1 ...");
      return text;
    };

    const text = processTextForSpeech(article.textContent || "");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speed;
    utterance.pitch = pitch;
    if (voice) utterance.voice = voice;
    utterance.onend = () => setIsPlaying(false);
    utterance.onboundary = (event) => {
      if (event.name === "sentence") {
        if (
          event.utterance.text.slice(event.charIndex).match(/^\s*[^.!?]*\?/)
        ) {
          event.utterance.pitch = pitch * 1.1;
        } else if (
          event.utterance.text.slice(event.charIndex).match(/^\s*[^.!?]*\./)
        ) {
          event.utterance.pitch = pitch * 0.9;
        }
      }
      setCurrentPosition(event.charIndex);
    };
    utteranceRef.current = {
      utterance,
      text,
      position: currentPosition,
    };

    if (isPlaying) {
      speechSynthesis.cancel();
      utterance.text = text.slice(currentPosition);
      speechSynthesis.speak(utterance);
    }

    return () => {
      observer.disconnect();
      speechSynthesis.cancel();
    };
  }, [speed, isPlaying, voice, pitch]);

  useEffect(() => {
    // Calculate reading time
    const article = document.querySelector("article");
    if (article) {
      const words = article.textContent?.split(/\s+/).length || 0;
      const minutes = Math.ceil(words / 180);
      setReadingTime(`${minutes} min read`);
    }
  }, []);

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      if (utteranceRef.current) {
        utteranceRef.current.utterance.rate = speed;
        speechSynthesis.speak(utteranceRef.current.utterance);
        setIsPlaying(true);
      }
    }
  };

  const handleSpeedChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    const speeds = [0.5, 1, 1.5, 2];
    const nextSpeed = speeds[(speeds.indexOf(speed) + 1) % speeds.length];

    if (utteranceRef.current) {
      const currentText = utteranceRef.current.text;
      const currentPos = utteranceRef.current.position;

      setSpeed(nextSpeed);

      if (isPlaying) {
        speechSynthesis.cancel();
        const newUtterance = new SpeechSynthesisUtterance(
          currentText.slice(currentPos)
        );
        newUtterance.rate = nextSpeed;
        newUtterance.onend = () => setIsPlaying(false);
        newUtterance.onboundary = (event) => {
          setCurrentPosition(currentPos + event.charIndex);
        };
        speechSynthesis.speak(newUtterance);
      }
    }
  };

  const handleSeek = (
    e: React.MouseEvent,
    direction: "forward" | "backward"
  ) => {
    e.stopPropagation();
    const offset = direction === "forward" ? 100 : -100;
    if (utteranceRef.current) {
      const newPosition = Math.max(0, currentPosition + offset);
      setCurrentPosition(newPosition);
      if (isPlaying) {
        speechSynthesis.cancel();
        utteranceRef.current.utterance.text =
          utteranceRef.current.text.slice(newPosition);
        speechSynthesis.speak(utteranceRef.current.utterance);
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
      // Fallback to copy to clipboard
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

          {/* Speed control */}
          <button
            onClick={handleSpeedChange}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--bronzer)]/5 hover:bg-[var(--bronzer)]/10 transition-all duration-300"
          >
            <RiSpeedLine size={14} />
            <span className="text-xs font-medium">{speed}x</span>
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
