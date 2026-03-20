import { cn } from "../lib/utils";
import type { CellPosition } from "../hooks/useSwipeSelection";

interface CurrentWordOverlayProps {
  grid: string[][];
  selectedCells: CellPosition[];
}

export function CurrentWordOverlay({
  grid,
  selectedCells,
}: CurrentWordOverlayProps) {
  if (selectedCells.length === 0) return null;

  const letters = selectedCells.map((c) => grid[c.row][c.col]);

  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-0 -translate-y-1/2 z-10 pointer-events-none">
      <div
        className={cn(
          "flex items-center gap-0.5 px-3 py-1.5",
          "bg-card rounded-full",
          "shadow-lg border border-border",
        )}
      >
        {letters.map((letter, i) => (
          <span
            key={`${i}-${letter}-${selectedCells[i].row}-${selectedCells[i].col}`}
            className={cn(
              "inline-flex items-center justify-center",
              "w-7 h-7 rounded-md",
              "text-sm font-bold font-sans",
              "bg-primary/15 text-primary",
              "animate-letter-pop",
            )}
          >
            {letter}
          </span>
        ))}
      </div>
    </div>
  );
}
