import { memo } from "react";
import { cn } from "../lib/utils";

interface LetterCellProps {
  letter: string;
  row: number;
  col: number;
  gridSize?: number;
  isSelected?: boolean;
  isFound?: boolean;
  isHinted?: boolean;
  foundColor?: string;
}

function getFontClass(gridSize: number): string {
  if (gridSize <= 8) return "text-2xl";
  if (gridSize <= 10) return "text-xl";
  return "text-base";
}

export const LetterCell = memo(function LetterCell({
  letter,
  row,
  col,
  gridSize = 8,
  isSelected = false,
  isFound = false,
  isHinted = false,
  foundColor,
}: LetterCellProps) {
  return (
    <div
      data-row={row}
      data-col={col}
      className={cn(
        "aspect-square flex items-center justify-center min-w-0",
        getFontClass(gridSize),
        "font-bold font-sans select-none",
        "rounded-md border transition-all duration-150",
        // Default state
        "bg-card text-foreground border-border",
        // Selected state
        isSelected && "bg-primary text-primary-foreground border-primary",
        // Found state (when word is completed)
        isFound &&
          !isSelected &&
          "bg-secondary/20 text-secondary border-secondary/40",
        // Hinted state (pulse animation)
        isHinted &&
          !isFound &&
          !isSelected &&
          "ring-2 ring-primary animate-pulse bg-primary/20 border-primary",
      )}
      style={
        isFound && foundColor
          ? {
              backgroundColor: `${foundColor}20`,
              borderColor: `${foundColor}40`,
            }
          : undefined
      }
    >
      {letter}
    </div>
  );
});
