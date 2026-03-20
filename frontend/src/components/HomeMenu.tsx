import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Coins,
  Lightbulb,
  Trophy,
  Map,
  BookOpen,
  Settings,
} from "lucide-react";
import { useTranslation } from "../locales";
import { SettingsDialog } from "./SettingsDialog";
import { useAudio } from "../hooks/useAudio";
import { DailyPuzzleButton } from "./DailyPuzzleButton";

interface HomeMenuProps {
  onNavigate: (screen: "play" | "collection") => void;
  onDailyPuzzle: () => void;
  stats?: {
    coins: number;
    hints: number;
    puzzlesCompleted: number;
  };
}

export function HomeMenu({ onNavigate, onDailyPuzzle, stats }: HomeMenuProps) {
  const { coins = 0, hints = 3, puzzlesCompleted = 0 } = stats ?? {};
  const { t } = useTranslation();
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const { playNavigate, playTap } = useAudio();

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
      {/* Logo / Title */}
      <div className="text-center mb-10 select-none">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-none bg-gradient-to-br from-primary via-chart-5 to-secondary bg-clip-text text-transparent drop-shadow-md">
          {t("home.wordSearch")}
        </h1>
        <p className="text-2xl sm:text-3xl font-semibold text-secondary mt-1 tracking-wide drop-shadow">
          {t("home.explorer")}
        </p>
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {["W", "O", "R", "D", "S"].map((letter, i) => (
            <span
              key={i}
              className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-card border border-border text-sm font-bold text-foreground shadow-sm animate-float"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              {letter}
            </span>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col gap-3 w-full max-w-xs mb-10">
        <Button
          size="lg"
          className="w-full h-14 text-lg font-semibold animate-glow gap-2.5 rounded-xl"
          onClick={() => {
            playNavigate();
            onNavigate("play");
          }}
        >
          <Map className="w-5 h-5" />
          {t("home.play")}
        </Button>

        <DailyPuzzleButton
          onClick={() => {
            playNavigate();
            onDailyPuzzle();
          }}
        />

        <Button
          size="lg"
          variant="outline"
          className="w-full h-12 text-base font-semibold gap-2.5 rounded-xl bg-card border-border hover:bg-accent hover:text-accent-foreground"
          onClick={() => {
            playNavigate();
            onNavigate("collection");
          }}
        >
          <BookOpen className="w-5 h-5" />
          {t("home.collection")}
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="w-full h-12 text-base font-semibold gap-2.5 rounded-xl bg-card border-border hover:bg-accent hover:text-accent-foreground"
          onClick={() => {
            playTap();
            setSettingsDialogOpen(true);
          }}
        >
          <Settings className="w-5 h-5" />
          {t("settings.title")}
        </Button>
        <SettingsDialog
          open={settingsDialogOpen}
          onOpenChange={setSettingsDialogOpen}
        />
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-5 px-5 py-3 bg-card rounded-xl border border-border shadow-sm mb-4">
        <div className="flex items-center gap-1.5" title="Coins">
          <Coins className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground tabular-nums">
            {coins}
          </span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-1.5" title="Hints">
          <Lightbulb className="w-4 h-4 text-secondary" />
          <span className="text-sm font-semibold text-foreground tabular-nums">
            {hints}
          </span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-1.5" title="Puzzles completed">
          <Trophy className="w-4 h-4 text-chart-5" />
          <span className="text-sm font-semibold text-foreground tabular-nums">
            {puzzlesCompleted}
          </span>
        </div>
      </div>
    </main>
  );
}
