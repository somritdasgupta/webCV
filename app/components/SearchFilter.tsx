"use client";

import React, { useState, useEffect } from "react";
import { RiSearchLine, RiCloseLine } from "react-icons/ri";
import { useRouter, useSearchParams } from "next/navigation";

export function SearchFilter() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const search = searchParams.get("search") || "";
    setSearchTerm(search);
  }, [searchParams]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);

    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.replace(newUrl);
  };

  const clearSearch = () => {
    handleSearch("");
  };

  return (
    <div className="relative mb-6">
      <div className="relative">
        <RiSearchLine
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-p)]"
          size={20}
        />
        <input
          type="text"
          placeholder="Search posts..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-10 py-3 bg-[var(--card-bg)] border border-[var(--callout-border)] rounded-lg text-[var(--text-color)] placeholder-[var(--text-p)] focus:outline-none focus:ring-2 focus:ring-[var(--bronzer)] focus:border-transparent transition-all duration-300"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-p)] hover:text-[var(--text-color)] transition-colors duration-200"
            aria-label="Clear search"
          >
            <RiCloseLine size={20} />
          </button>
        )}
      </div>
      {searchTerm && (
        <p className="mt-2 text-sm text-[var(--text-p)]">
          Searching for:{" "}
          <span className="font-medium text-[var(--bronzer)]">
            "{searchTerm}"
          </span>
        </p>
      )}
    </div>
  );
}
