import { type ReactNode } from "react";
import {
  PawPrint,
  UtensilsCrossed,
  Globe,
  type LucideIcon,
} from "lucide-react";
import { THEMES, type ThemeId } from "../utils/themes";

const ICON_MAP: Record<string, LucideIcon> = {
  PawPrint,
  UtensilsCrossed,
  Globe,
};

interface ThemedBackgroundProps {
  themeId: ThemeId;
  children: ReactNode;
}

export function ThemedBackground({ themeId, children }: ThemedBackgroundProps) {
  const theme = THEMES[themeId];
  const Icon = ICON_MAP[theme.icon];

  return (
    <div
      className="relative rounded-2xl p-3 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
      }}
    >
      {Icon && (
        <>
          <Icon className="absolute top-4 right-4 w-10 h-10 opacity-[0.08]" />
          <Icon className="absolute bottom-4 left-4 w-10 h-10 opacity-[0.08]" />
        </>
      )}
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
