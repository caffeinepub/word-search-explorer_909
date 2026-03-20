import { useRef, type RefObject, type DOMAttributes } from "react";
import { cn } from "../lib/utils";
import { LetterCell } from "./LetterCell";
import { SelectionTrail } from "./SelectionTrail";

interface FoundWord {
  word: string;
  cells: { row: number; col: number }[];
  color?: string;
}

interface LetterGridProps {
  grid: string[][];
  selectedCells?: { row: number; col: number }[];
  foundWords?: FoundWord[];
  hintedCells?: { row: number; col: number }[] | null;
  gridRef?: RefObject<HTMLDivElement | null>;
  gridEventHandlers?: Pick<
    DOMAttributes<HTMLDivElement>,
    "onPointerDown" | "onPointerMove" | "onPointerUp"
  >;
}

export function LetterGrid({
  grid,
  selectedCells = [],
  foundWords = [],
  hintedCells,
  gridRef: externalGridRef,
  gridEventHandlers,
}: LetterGridProps) {
  const internalGridRef = useRef<HTMLDivElement>(null);
  const gridRef = externalGridRef ?? internalGridRef;
  const size = grid.length;

  const isSelected = (row: number, col: number) =>
    selectedCells.some((cell) => cell.row === row && cell.col === col);

  const getFoundInfo = (row: number, col: number) => {
    for (const found of foundWords) {
      if (found.cells.some((cell) => cell.row === row && cell.col === col)) {
        return { isFound: true, color: found.color };
      }
    }
    return { isFound: false, color: undefined };
  };

  const isHinted = (row: number, col: number) =>
    hintedCells?.some((cell) => cell.row === row && cell.col === col) ?? false;

  const isLargeGrid = size > 9;

  return (
    <div
      ref={gridRef}
      className={cn(
        "relative bg-muted rounded-xl shadow-lg touch-none",
        isLargeGrid ? "p-2" : "p-3",
      )}
      {...gridEventHandlers}
    >
      <SelectionTrail selectedCells={selectedCells} gridRef={gridRef} />
      <div
        className={cn("relative z-[1] grid", isLargeGrid ? "gap-0.5" : "gap-1")}
        style={{
          gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((letter, colIndex) => {
            const { isFound, color } = getFoundInfo(rowIndex, colIndex);
            return (
              <LetterCell
                key={`${rowIndex}-${colIndex}`}
                letter={letter}
                row={rowIndex}
                col={colIndex}
                gridSize={size}
                isSelected={isSelected(rowIndex, colIndex)}
                isFound={isFound}
                isHinted={isHinted(rowIndex, colIndex)}
                foundColor={color}
              />
            );
          }),
        )}
      </div>
    </div>
  );
}
