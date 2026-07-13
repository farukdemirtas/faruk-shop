"use client";

export function CopyButton({ text }: { text: string }) {
  return (
    <button
      className="text-white/60 hover:text-white text-sm transition-colors"
      onClick={() => navigator?.clipboard?.writeText(text)}
    >
      Kopyala
    </button>
  );
}
