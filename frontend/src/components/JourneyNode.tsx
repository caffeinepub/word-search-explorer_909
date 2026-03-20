import { forwardRef } from "react";
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
  Check,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../lib/utils";
import { THEMES, type ThemeId } from "../utils/themes";
import { MAX_LEVEL } from "../utils/progressHelpers";
import { useTranslation } from "../locales";

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

export type NodeState = "completed" | "current" | "locked";

interface JourneyNodeProps {
  themeId: ThemeId;
  index: number;
  state: NodeState;
  completedLevels: number;
  onSelect: () => void;
}

export const JourneyNode = forwardRef<HTMLDivElement, JourneyNodeProps>(
  function JourneyNode(
    { themeId, index, state, completedLevels, onSelect },
    ref,
  ) {
    const theme = THEMES[themeId];
    const Icon = ICON_MAP[theme.icon];
    const { t } = useTranslation();
    const isLeft = index % 2 === 0;

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
          isLeft ? "-translate-x-8 flex-row" : "translate-x-8 flex-row-reverse",
        )}
      >
        {/* Outer circle - bg-card base that connects seamlessly to pill */}
        <button
          onClick={onSelect}
          className={cn(
            "relative z-10 w-20 h-20 rounded-full bg-card shadow-md shrink-0 transition-all",
            state !== "locked" && "cursor-pointer active:scale-95",
          )}
        >
          {/* Inner circle - with colored border and icon */}
          <div
            className={cn(
              "absolute inset-1 rounded-full border-[3px] flex items-center justify-center",
              borderColor,
              state === "current" && "animate-pulse-ring",
            )}
          >
            {state === "locked" ? (
              <Lock className="w-7 h-7 text-muted-foreground" />
            ) : Icon ? (
              <Icon className="w-7 h-7" style={{ color: theme.accent }} />
            ) : null}
            {state === "completed" && (
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-secondary flex items-center justify-center shadow-sm">
                <Check className="w-3.5 h-3.5 text-secondary-foreground" />
              </div>
            )}
          </div>
        </button>

        {/* Label pill - no border, just bg-card */}
        <div
          className={cn(
            "bg-card py-2 shadow-md",
            isLeft
              ? "-ml-5 pl-7 pr-3 rounded-r-xl"
              : "-mr-5 pr-7 pl-3 rounded-l-xl",
          )}
        >
          <p className="text-sm font-semibold text-foreground">
            {t(`themes.${themeId}`)}
          </p>
          <p className="text-xs text-muted-foreground">
            {completedLevels}/{MAX_LEVEL} {t("journey.levels")}
          </p>
        </div>
      </div>
    );
  },
);
