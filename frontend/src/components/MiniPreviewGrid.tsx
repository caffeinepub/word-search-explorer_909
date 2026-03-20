import { cn } from "../lib/utils";

export function MiniPreviewGrid() {
  const grid = [
    ["P", "L", "A", "Y"],
    ["R", "E", "X", "K"],
    ["M", "N", "S", "T"],
    ["G", "H", "I", "J"],
  ];

  return (
    <div className="grid grid-cols-4 gap-1 p-3 bg-muted/50 rounded-lg shadow-sm">
      {grid.map((row, rowIndex) =>
        row.map((letter, colIndex) => {
          const isHighlighted = rowIndex === 0;
          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={cn(
                "w-10 h-10 flex items-center justify-center font-bold text-lg rounded-md transition-all",
                isHighlighted
                  ? "bg-secondary text-secondary-foreground animate-highlight-pulse"
                  : "bg-card text-card-foreground",
              )}
              style={{
                animationDelay: isHighlighted
                  ? `${colIndex * 0.1}s`
                  : undefined,
              }}
            >
              {letter}
            </div>
          );
        }),
      )}
    </div>
  );
}
