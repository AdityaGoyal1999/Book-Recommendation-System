"use client";

import Image from "next/image";

type BookCoverThumbProps = {
  src: string | null;
  title: string;
};

export function BookCoverThumb({ src, title }: BookCoverThumbProps) {
  return (
    <div className="relative mt-0.5 h-14 w-10 shrink-0 overflow-hidden rounded-sm border border-border/60 bg-muted">
      {src ? (
        <Image src={src} alt={title} fill sizes="40px" className="object-cover" />
      ) : (
        <div className="h-full w-full" aria-hidden="true" />
      )}
    </div>
  );
}
