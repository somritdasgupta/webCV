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
  const handleClick =
    (tag: string | null) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      onTagsSelect(tag);
    };

  // Determine if "All" should be selected
  const isAllSelected = selectedTags === null || selectedTags === "";

  return (
    <div className="flex flex-wrap gap-2 py-2 px-0 mb-4">
      <Link
        href="/blog"
        className={`text-xs px-3 py-1 rounded-md transition-all ease ${
          isAllSelected ? "bg-[var(--bronzer)]/30" : "bg-[#6169793f]"
        } transition-colors ease cursor-pointer`}
        onClick={handleClick(null)}
      >
        All
      </Link>
      {tags.map((tag) => {
        const count = tagsCounts[tag] || 0;
        return (
          <Link
            key={tag}
            href={`/blog?tag=${encodeURIComponent(tag)}`}
            className={`text-xs px-2 py-1 rounded-md transition-all ease ${
              selectedTags === tag ? "bg-[var(--bronzer)]/30" : "bg-[#6169793f]"
            } transition-colors ease cursor-pointer`}
            onClick={handleClick(tag)}
          >
            {tag} {count > 0 && `(${count})`}
          </Link>
        );
      })}
    </div>
  );
};

export default Tags;
