import { useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { JourneyNode, type NodeState } from "./JourneyNode";
import {
  THEME_ORDER,
  isThemeCompleted,
  isThemeUnlocked,
  getThemeCompletedLevel,
} from "../utils/progressHelpers";
import { useTranslation } from "../locales";
import { useAudio } from "../hooks/useAudio";
import type { ThemeId } from "../utils/themes";

interface JourneyMapProps {
  themeProgress: Array<[string, number]>;
  onSelectTheme: (themeId: ThemeId) => void;
  onBack: () => void;
}

export function JourneyMap({
  themeProgress,
  onSelectTheme,
  onBack,
}: JourneyMapProps) {
  const { t } = useTranslation();
  const { playBack, playNavigate, playLocked } = useAudio();
  const currentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentRef.current) {
      currentRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, []);

  let currentFound = false;

  return (
    <main className="flex-1 flex flex-col min-h-0 px-4 sm:px-0 py-4 relative z-10">
      <div className="w-full max-w-md mx-auto mb-4 flex items-center justify-between bg-card rounded-lg border border-border px-2 py-1.5 shadow-sm">
        <Button
          variant="ghost"
          className="gap-2 px-2"
          onClick={() => {
            playBack();
            onBack();
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          {t("common.back")}
        </Button>
        <h2 className="text-lg font-semibold text-foreground pr-2">
          {t("journey.title")}
        </h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="relative w-full max-w-md mx-auto py-8">
          {/* Dashed center line */}
          <div className="absolute left-1/2 top-0 bottom-0 -translate-x-px border-l-2 border-dashed border-border" />

          <div className="relative flex flex-col items-center gap-12">
            {THEME_ORDER.map((themeId, index) => {
              const completed = isThemeCompleted(themeId, themeProgress);
              const unlocked = isThemeUnlocked(themeId, themeProgress);
              let state: NodeState;
              if (completed) {
                state = "completed";
              } else if (unlocked) {
                state = "current";
              } else {
                state = "locked";
              }

              const isCurrent = state === "current" && !currentFound;
              if (isCurrent) currentFound = true;

              return (
                <JourneyNode
                  key={themeId}
                  ref={isCurrent ? currentRef : undefined}
                  themeId={themeId}
                  index={index}
                  state={state}
                  completedLevels={getThemeCompletedLevel(
                    themeId,
                    themeProgress,
                  )}
                  onSelect={() => {
                    if (state === "locked") {
                      playLocked();
                    } else {
                      playNavigate();
                      onSelectTheme(themeId);
                    }
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
