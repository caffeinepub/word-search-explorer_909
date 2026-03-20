import { cn } from "../lib/utils";
import { useTranslation } from "../locales";

interface WordListProps {
  words: string[];
  foundWords: Set<string>;
  foundWordColors?: Map<string, string>;
}

export function WordList({
  words,
  foundWords,
  foundWordColors,
}: WordListProps) {
  const { t } = useTranslation();

  return (
    <div className="mt-3 bg-card rounded-xl p-3 shadow-md">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-muted-foreground">
          {t("game.wordsToFind")}
        </h2>
        <span className="text-sm font-medium text-muted-foreground">
          {foundWords.size}/{words.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {words.map((word) => {
          const isFound = foundWords.has(word);
          const color = foundWordColors?.get(word);

          return (
            <span
              key={word}
              className={cn(
                "px-2 py-1 rounded-md text-sm font-medium border transition-all duration-300",
                isFound
                  ? "bg-secondary/20 text-secondary border-secondary/40 line-through opacity-75"
                  : "bg-muted text-foreground border-transparent",
              )}
              style={
                isFound && color
                  ? {
                      backgroundColor: `${color}20`,
                      borderColor: `${color}40`,
                      color: color,
                    }
                  : undefined
              }
            >
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
}
