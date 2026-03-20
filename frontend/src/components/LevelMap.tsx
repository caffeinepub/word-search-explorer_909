import { forwardRef, useEffect, useRef } from "react";
import {
  PawPrint,
  UtensilsCrossed,
  Globe,
  Apple,
  Palette,
  Heart,
  Users,
  Shirt,
  ChefHat,
  GraduationCap,
  Flower2,
  Bird,
  Bug,
  Cloud,
  Waves,
  Trophy,
  Music,
  Plane,
  Rocket,
  Wrench,
  Car,
  Flower,
  Cake,
  Briefcase,
  Armchair,
  Wine,
  Gem,
  PartyPopper,
  TreePine,
  Turtle,
  Calendar,
  Clapperboard,
  Tractor,
  Blocks,
  Flame,
  Cog,
  Watch,
  Shapes,
  HeartHandshake,
  Droplet,
  Mountain,
  Fish,
  Tent,
  FerrisWheel,
  Skull,
  Castle,
  TreePalm,
  Sun,
  Snowflake,
  Sparkles,
  ArrowLeft,
  Check,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import { THEMES, type ThemeId } from "../utils/themes";
import {
  MAX_LEVEL,
  isLevelCompleted,
  isLevelUnlocked,
} from "../utils/progressHelpers";
import { useTranslation } from "../locales";
import { useAudio } from "../hooks/useAudio";
import { TimedModeToggle } from "./TimedModeToggle";

const ICON_MAP: Record<string, LucideIcon> = {
  PawPrint,
  UtensilsCrossed,
  Globe,
  Apple,
  Palette,
  Heart,
  Users,
  Shirt,
  ChefHat,
  GraduationCap,
  Flower2,
  Bird,
  Bug,
  Cloud,
  Waves,
  Trophy,
  Music,
  Plane,
  Rocket,
  Wrench,
  Car,
  Flower,
  Cake,
  Briefcase,
  Armchair,
  Wine,
  Gem,
  PartyPopper,
  TreePine,
  Turtle,
  Calendar,
  Clapperboard,
  Tractor,
  Blocks,
  Flame,
  Cog,
  Watch,
  Shapes,
  HeartHandshake,
  Droplet,
  Mountain,
  Fish,
  Tent,
  FerrisWheel,
  Skull,
  Castle,
  TreePalm,
  Sun,
  Snowflake,
  Sparkles,
};

type LevelState = "completed" | "current" | "locked";

interface LevelMapProps {
  themeId: ThemeId;
  themeProgress: Array<[string, number]>;
  onSelectLevel: (level: number) => void;
  onBack: () => void;
}

export function LevelMap({
  themeId,
  themeProgress,
  onSelectLevel,
  onBack,
}: LevelMapProps) {
  const theme = THEMES[themeId];
  const Icon = ICON_MAP[theme.icon];
  const { t } = useTranslation();
  const { playBack, playNavigate, playLocked } = useAudio();
  const levels = Array.from({ length: MAX_LEVEL }, (_, i) => i + 1);
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
        <div className="flex items-center gap-2 pr-2">
          {Icon && <Icon className="w-5 h-5" style={{ color: theme.accent }} />}
          <h2 className="text-lg font-semibold text-foreground">
            {t(`themes.${themeId}`)}
          </h2>
        </div>
      </div>

      <TimedModeToggle />

      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Themed card background */}
        <div
          className="relative w-full max-w-md mx-auto rounded-2xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
          }}
        >
          {Icon && (
            <>
              <Icon className="absolute top-4 right-4 w-12 h-12 opacity-[0.08]" />
              <Icon className="absolute bottom-4 left-4 w-12 h-12 opacity-[0.08]" />
            </>
          )}

          <div className="relative py-8">
            {/* Dashed center line */}
            <div
              className="absolute left-1/2 top-0 bottom-0 -translate-x-px border-l-2 border-dashed"
              style={{ borderColor: theme.accent, opacity: 0.3 }}
            />

            <div className="relative flex flex-col items-center gap-10">
              {levels.map((level, index) => {
                const completed = isLevelCompleted(
                  themeId,
                  level,
                  themeProgress,
                );
                const unlocked = isLevelUnlocked(themeId, level, themeProgress);

                let state: LevelState;
                if (completed) {
                  state = "completed";
                } else if (unlocked) {
                  state = "current";
                } else {
                  state = "locked";
                }

                const isCurrentLevel = state === "current" && !currentFound;
                if (isCurrentLevel) currentFound = true;

                const isLeft = index % 2 === 0;

                return (
                  <LevelNode
                    key={level}
                    ref={isCurrentLevel ? currentRef : undefined}
                    level={level}
                    state={state}
                    isLeft={isLeft}
                    accent={theme.accent}
                    onSelect={() => {
                      if (state === "locked") {
                        playLocked();
                      } else {
                        playNavigate();
                        onSelectLevel(level);
                      }
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

interface LevelNodeProps {
  level: number;
  state: LevelState;
  isLeft: boolean;
  accent: string;
  onSelect: () => void;
}

const LevelNode = forwardRef<HTMLDivElement, LevelNodeProps>(function LevelNode(
  { level, state, isLeft, accent, onSelect },
  ref,
) {
  const { t } = useTranslation();

  const borderColor = cn(
    state === "completed" && "border-secondary",
    state === "current" && "border-primary",
    state === "locked" && "border-muted",
  );

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex items-center",
        isLeft ? "-translate-x-6 flex-row" : "translate-x-6 flex-row-reverse",
      )}
    >
      {/* Level circle */}
      <button
        onClick={onSelect}
        className={cn(
          "relative z-10 w-16 h-16 rounded-full bg-card shadow-md shrink-0 transition-all",
          state !== "locked" && "cursor-pointer active:scale-95",
        )}
      >
        <div
          className={cn(
            "absolute inset-1 rounded-full border-[3px] flex items-center justify-center",
            borderColor,
            state === "current" && "animate-pulse-ring",
          )}
        >
          {state === "locked" ? (
            <Lock className="w-5 h-5 text-muted-foreground" />
          ) : state === "completed" ? (
            <Check className="w-6 h-6 text-secondary" />
          ) : (
            <span className="text-lg font-bold" style={{ color: accent }}>
              {level}
            </span>
          )}
        </div>
      </button>

      {/* Label pill */}
      <div
        className={cn(
          "bg-card py-1.5 shadow-md",
          isLeft
            ? "-ml-3 pl-5 pr-3 rounded-r-xl"
            : "-mr-3 pr-5 pl-3 rounded-l-xl",
        )}
      >
        <p className="text-sm font-semibold text-foreground">
          {t("journey.level")} {level}
        </p>
      </div>
    </div>
  );
});
