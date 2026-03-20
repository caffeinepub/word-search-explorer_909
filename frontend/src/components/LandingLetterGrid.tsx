import { useMemo } from "react";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LETTER_COUNT = 20;

// Center exclusion zone (percentage-based) to keep the logo area clear
const EXCLUDE = { x1: 15, x2: 85, y1: 20, y2: 55 };

function isInExcludeZone(left: number, top: number) {
  return (
    left > EXCLUDE.x1 &&
    left < EXCLUDE.x2 &&
    top > EXCLUDE.y1 &&
    top < EXCLUDE.y2
  );
}

export function LetterGrid() {
  const letters = useMemo(() => {
    return Array.from({ length: LETTER_COUNT }, () => {
      let left: number, top: number;
      do {
        left = Math.random() * 100;
        top = Math.random() * 100;
      } while (isInExcludeZone(left, top));

      return {
        char: LETTERS[Math.floor(Math.random() * LETTERS.length)],
        left,
        top,
        delay: Math.random() * 3,
        size: 1 + Math.random() * 1.5,
      };
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {letters.map((letter, i) => (
        <span
          key={i}
          className="absolute font-bold text-primary/20 animate-float select-none"
          style={{
            left: `${letter.left}%`,
            top: `${letter.top}%`,
            animationDelay: `${letter.delay}s`,
            fontSize: `${letter.size}rem`,
          }}
        >
          {letter.char}
        </span>
      ))}
    </div>
  );
}
