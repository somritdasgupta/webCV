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
      <button
        onClick={() => onTagsSelect(null)}
        className={`custom-topic-pill ${
          selectedTags === null ? "custom-skill-pill" : ""
        }`}
      >
        All
      </button>
      {tags.map((tag) => {
        const count = tagsCounts[tag] || 0;
        return (
          <button
            key={tag}
            onClick={() => onTagsSelect(tag)}
            className={`custom-topic-pill ${
              selectedTags === tag ? "custom-skill-pill" : ""
            }`}
          >
            {tag} {count > 0 && `(${count})`}
          </button>
        );
      })}
    </div>
  );
};

export default Tags;
