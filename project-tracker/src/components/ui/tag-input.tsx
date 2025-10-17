"use client";

import { useState } from "react";
import { twMerge } from "tailwind-merge";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ value, onChange }: TagInputProps) {
  const [input, setInput] = useState("");

  function addTag(tag: string) {
    const normalized = tag.trim().toLowerCase();
    if (!normalized || value.includes(normalized)) return;
    onChange([...value, normalized]);
    setInput("");
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {value.map((tag, index) => (
        <button
          key={`${tag}-${index}`}
          onClick={() => onChange(value.filter((t) => t !== tag))}
          className="rounded-full bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
        >
          #{tag}
        </button>
      ))}
      <input
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            addTag(input);
          }
        }}
        placeholder="Add tag"
        className={twMerge(
          "rounded-full bg-white/5 px-3 py-1 text-xs text-white placeholder:text-slate-400 focus:outline-none"
        )}
      />
    </div>
  );
}
