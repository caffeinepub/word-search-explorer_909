import {
  PawPrint,
  UtensilsCrossed,
  Globe,
  Lock,
  Share2,
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
  type LucideIcon,
} from "lucide-react";
import { cn } from "../lib/utils";
import { THEMES, type ThemeId } from "../utils/themes";
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

interface PostcardCardProps {
  themeId: ThemeId;
  unlocked: boolean;
  className?: string;
  onShare?: () => void;
}

export function PostcardCard({
  themeId,
  unlocked,
  className,
  onShare,
}: PostcardCardProps) {
  const theme = THEMES[themeId];
  const Icon = ICON_MAP[theme.icon];
  const { t } = useTranslation();

  if (!unlocked) {
    return (
      <div
        className={cn(
          "aspect-[3/2] rounded-xl bg-muted border border-border flex flex-col items-center justify-center gap-2 opacity-60",
          className,
        )}
      >
        <Lock className="h-8 w-8 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {t(`themes.${themeId}`)}
        </span>
        <span className="text-xs text-muted-foreground/70">
          {t("collection.locked")}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "aspect-[3/2] rounded-xl border-2 border-dashed overflow-hidden relative group",
        className,
      )}
      style={{
        borderColor: theme.accent,
        background: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
      }}
    >
      {/* Share button */}
      {onShare && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShare();
          }}
          className="absolute top-2 left-2 p-1.5 rounded-full bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-white"
          style={{ color: theme.accent }}
        >
          <Share2 className="h-4 w-4" />
        </button>
      )}

      {/* Stamp area */}
      <div
        className="absolute top-2 right-2 w-10 h-10 border-2 border-dashed rounded flex items-center justify-center rotate-6"
        style={{ borderColor: theme.accent }}
      >
        <span className="text-lg">{theme.postcard.stamp}</span>
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-4">
        {/* Decorative divider */}
        <div
          className="w-12 border-t-2 border-dashed mb-2"
          style={{ borderColor: theme.accent }}
        />
        <h3
          className="font-serif text-lg font-bold leading-tight"
          style={{ color: theme.accent }}
        >
          {t(theme.postcard.titleKey)}
        </h3>
        <p className="text-xs mt-1 opacity-80" style={{ color: theme.accent }}>
          {t(theme.postcard.descriptionKey)}
        </p>
      </div>

      {/* Theme icon watermark */}
      {Icon && (
        <Icon
          className="absolute top-4 left-4 h-10 w-10 opacity-15"
          style={{ color: theme.accent }}
        />
      )}
    </div>
  );
}
