'use client';

import { cn } from "@/lib/utils";

interface FlipTextProps {
  key?: React.Key;
  word: string;
  className?: string;
  delay?: number;
}

export default function FlipTextReveal({ word, className, delay = 0 }: FlipTextProps) {
  return (
    <span className={cn("flip-container", className)}>
      <span className="text-wrapper" aria-label={word}>
        {word.split("").map((char, i) => (
          <span
            key={i}
            className="char inline-block"
            style={{
              "--index": i,
              animationDelay: `calc(${delay}s + (0.06s * var(--index)))`
            } as React.CSSProperties}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </span>

      <style jsx>{`
        .flip-container {
          display: inline-flex;
          flex-wrap: wrap;
          perspective: 800px; 
        }

        .text-wrapper {
          display: inline-flex;
          flex-wrap: wrap;
          transform-style: preserve-3d;
        }

        .char {
          transform-origin: bottom center; 
          opacity: 0;
          transform: rotateX(-90deg) translateY(20px);
          animation: flip-up 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          will-change: transform, opacity;
        }

        @keyframes flip-up {
          0% {
            opacity: 0;
            transform: rotateX(-90deg) translateY(40px);
          }
          100% {
            opacity: 1;
            transform: rotateX(0deg) translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .char {
            opacity: 1 !important;
            transform: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </span>
  );
}
