import Link from "next/link";
import React from "react";

interface TagsProps {
  tags: string[];
  tagsCounts: { [key: string]: number };
  selectedTags: string | null;
  onTagsSelect: (tags: string | null) => void;
}

const Tags: React.FC<TagsProps> = ({
  tags,
  tagsCounts,
  selectedTags,
  onTagsSelect,
}) => {
  return (
    <div className="flex flex-wrap gap-2 py-2 px-0 mb-4">
      <Link
        href="/blog"
        className={`custom-topic-pill hover:!bg-slate-500/25 transition-colors ease ${
          selectedTags !== null ? "custom-skill-pill" : ""
        }`}
        onClick={(e) => {
          e.preventDefault();
          onTagsSelect(null);
        }}
      >
        All
      </Link>
      {tags.map((tag) => {
        const count = tagsCounts[tag] || 0;
        return (
          <Link
            key={tag}
            href={`/blog?tag=${encodeURIComponent(tag)}`}
            className={`custom-topic-pill hover:!bg-violet-500/25 transition-colors ease ${
              selectedTags === tag ? "custom-skill-pill" : ""
            }`}
            onClick={(e) => {
              e.preventDefault();
              onTagsSelect(tag);
            }}
          >
            {tag} {count > 0 && `(${count})`}
          </Link>
        );
      })}
    </div>
  );
};

export default Tags;
