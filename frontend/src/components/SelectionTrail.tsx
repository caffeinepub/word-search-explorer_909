import { type RefObject } from "react";
import { type CellPosition } from "../hooks/useSwipeSelection";

interface SelectionTrailProps {
  selectedCells: CellPosition[];
  gridRef: RefObject<HTMLDivElement | null>;
}

export function SelectionTrail({
  selectedCells,
  gridRef,
}: SelectionTrailProps) {
  if (selectedCells.length === 0 || !gridRef.current) return null;

  const gridEl = gridRef.current;
  const gridRect = gridEl.getBoundingClientRect();
  const points: { x: number; y: number }[] = [];
  let cellSize = 0;

  for (const cell of selectedCells) {
    const el = gridEl.querySelector<HTMLElement>(
      `[data-row="${cell.row}"][data-col="${cell.col}"]`,
    );
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    cellSize = rect.width;
    points.push({
      x: rect.left - gridRect.left + rect.width / 2,
      y: rect.top - gridRect.top + rect.height / 2,
    });
  }

  if (points.length === 0) return null;

  const pathData =
    points.length === 1
      ? `M ${points[0].x} ${points[0].y} l 0.01 0`
      : points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <svg
      className="absolute inset-0 z-0 pointer-events-none"
      width={gridRect.width}
      height={gridRect.height}
    >
      <path
        d={pathData}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={cellSize * 0.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.35}
      />
    </svg>
  );
}
