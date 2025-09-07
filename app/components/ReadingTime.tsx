"use client";

import React, { useEffect, useState } from "react";
import { RiTimeLine, RiEyeLine } from "react-icons/ri";

interface ReadingTimeProps {
  content: string;
}

export function ReadingTime({ content }: ReadingTimeProps) {
  const [readingTime, setReadingTime] = useState(0);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    // Remove MDX/HTML tags and calculate word count
    const plainText = content.replace(/<[^>]*>/g, "").replace(/\n/g, " ");
    const words = plainText
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    const count = words.length;

    // Average reading speed is 200-250 words per minute
    const avgWordsPerMinute = 225;
    const time = Math.ceil(count / avgWordsPerMinute);

    setWordCount(count);
    setReadingTime(time);
  }, [content]);

  return (
    <div className="flex items-center gap-4 text-sm text-[var(--text-p)] mb-4">
      <div className="flex items-center gap-1">
        <RiTimeLine size={16} />
        <span>{readingTime} min read</span>
      </div>
      <div className="flex items-center gap-1">
        <RiEyeLine size={16} />
        <span>{wordCount.toLocaleString()} words</span>
      </div>
    </div>
  );
}
