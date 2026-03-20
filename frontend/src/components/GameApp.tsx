import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { GameBoard } from "./GameBoard";
import { type ThemeId } from "../utils/themes";
import { useProfile, useProgress, useDailyPuzzle } from "../hooks/useQueries";
import { LoadingScreen } from "./LoadingScreen";
import { ProfileSetupDialog } from "./ProfileSetupDialog";
import { Header } from "./Header";
import { Button } from "../components/ui/button";
import { LetterGrid as AnimatedLetterGrid } from "./LandingLetterGrid";
import { HomeMenu } from "./HomeMenu";
import { JourneyMap } from "./JourneyMap";
import { LevelMap } from "./LevelMap";
import { CollectionAlbum } from "./CollectionAlbum";
import { useTranslation } from "../locales";
import { useAudio } from "../hooks/useAudio";
import { toast } from "sonner";
import {
  getNextPuzzle,
  MAX_LEVEL,
  THEME_ORDER,
} from "../utils/progressHelpers";

type Screen = "home" | "journey" | "levels" | "play" | "collection" | "daily";

export function GameApp() {
  const {
    data: profile,
    isLoading: isLoadingProfile,
    isError: isProfileError,
  } = useProfile();
  const { data: progress, isError: isProgressError } = useProgress();
  const { data: dailyInfo, isError: isDailyError } = useDailyPuzzle();
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedTheme, setSelectedTheme] = useState<ThemeId | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [puzzleKey, setPuzzleKey] = useState(0);
  const hasProfile = profile && profile.name;
  const { t } = useTranslation();
  const { playBack } = useAudio();

  useEffect(() => {
    if (isProfileError) {
      toast.error(t("errors.loadProfile"));
    }
  }, [isProfileError, t]);

  useEffect(() => {
    if (isProgressError) {
      toast.error(t("errors.loadProgress"));
    }
  }, [isProgressError, t]);

  useEffect(() => {
    if (isDailyError) {
      toast.error(t("errors.loadDaily"));
    }
  }, [isDailyError, t]);

  if (isLoadingProfile) {
    return <LoadingScreen message={t("loading.loadingProfile")} />;
  }

  const themeProgress = progress?.themeProgress ?? [];

  const handleNavigate = (target: "play" | "collection") => {
    if (target === "play") {
      setScreen("journey");
    } else {
      setScreen(target);
    }
  };

  const handleSelectTheme = (themeId: ThemeId) => {
    setSelectedTheme(themeId);
    setScreen("levels");
  };

  const handleSelectLevel = (level: number) => {
    setSelectedLevel(level);
    setPuzzleKey((k) => k + 1);
    setScreen("play");
  };

  const handleNextPuzzle = () => {
    if (!selectedTheme || !selectedLevel) return;
    const next = getNextPuzzle(selectedTheme, selectedLevel);
    if (next && next.themeId === selectedTheme) {
      setSelectedLevel(next.level);
      setPuzzleKey((k) => k + 1);
    } else if (next) {
      // Different theme — go to journey to show the newly unlocked theme
      setScreen("journey");
    } else {
      // All done
      setScreen("journey");
    }
  };

  const handleBackToJourney = () => {
    setScreen("journey");
  };

  const handleDailyPuzzle = () => {
    if (dailyInfo && !dailyInfo.alreadyCompleted) {
      setPuzzleKey((k) => k + 1);
      setScreen("daily");
    }
  };

  const handleDailyComplete = () => {
    setScreen("home");
  };

  const stats = {
    coins: progress?.coins ?? 0,
    hints: progress?.hints ?? 3,
    puzzlesCompleted: themeProgress.reduce((sum, [, level]) => sum + level, 0),
  };

  const isLastLevelInTheme = selectedLevel === MAX_LEVEL;
  const isLastTheme = selectedTheme === THEME_ORDER[THEME_ORDER.length - 1];

  return (
    <div className="h-screen bg-background relative flex flex-col overflow-hidden">
      <AnimatedLetterGrid />
      <ProfileSetupDialog open={!hasProfile} />
      {hasProfile && (
        <>
          <Header
            userName={profile.name}
            variant={screen === "home" ? "menu" : "default"}
            coins={stats.coins}
          />

          {screen === "home" && (
            <HomeMenu
              onNavigate={handleNavigate}
              onDailyPuzzle={handleDailyPuzzle}
              stats={stats}
            />
          )}

          {screen === "journey" && (
            <JourneyMap
              themeProgress={themeProgress}
              onSelectTheme={handleSelectTheme}
              onBack={() => setScreen("home")}
            />
          )}

          {screen === "levels" && selectedTheme && (
            <LevelMap
              themeId={selectedTheme}
              themeProgress={themeProgress}
              onSelectLevel={handleSelectLevel}
              onBack={() => setScreen("journey")}
            />
          )}

          {screen === "play" && selectedTheme && selectedLevel && (
            <main className="flex-1 flex flex-col items-center sm:justify-center px-4 sm:px-0 py-2 relative z-10 overflow-y-auto">
              <div className="w-full max-w-md mb-2 flex items-center justify-between">
                <Button
                  variant="ghost"
                  className="gap-2 px-2"
                  onClick={() => {
                    playBack();
                    setScreen("levels");
                  }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t("common.back")}
                </Button>
                <div className="flex items-center gap-2 bg-card rounded-lg border border-border px-3 py-1.5 shadow-sm">
                  <span className="text-sm font-semibold text-secondary">
                    {t(`themes.${selectedTheme}`)}
                  </span>
                  <span className="w-px h-3.5 bg-border" />
                  <span className="text-sm font-semibold text-chart-5">
                    {t("game.level", { level: selectedLevel })}
                  </span>
                </div>
              </div>
              <div className="max-w-md mx-auto w-full">
                <GameBoard
                  key={puzzleKey}
                  themeId={selectedTheme}
                  level={selectedLevel}
                  savedPuzzle={progress?.currentPuzzle ?? null}
                  isLastLevelInTheme={isLastLevelInTheme}
                  isLastTheme={isLastTheme}
                  hints={progress?.hints ?? 3}
                  lastHintRegenTime={progress?.lastHintRegenTime ?? 0}
                  coins={progress?.coins ?? 0}
                  onNextPuzzle={handleNextPuzzle}
                  onBackToJourney={handleBackToJourney}
                  onViewCollection={() => setScreen("collection")}
                />
              </div>
            </main>
          )}

          {screen === "collection" && (
            <CollectionAlbum
              themeProgress={themeProgress}
              onBack={() => setScreen("home")}
            />
          )}

          {screen === "daily" && dailyInfo && (
            <main className="flex-1 flex flex-col items-center sm:justify-center px-4 sm:px-0 py-2 relative z-10 overflow-y-auto">
              <div className="w-full max-w-md mb-2 flex items-center justify-between">
                <Button
                  variant="ghost"
                  className="gap-2 px-2"
                  onClick={() => {
                    playBack();
                    setScreen("home");
                  }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t("common.back")}
                </Button>
                <div className="flex items-center gap-2 bg-card rounded-lg border border-border px-3 py-1.5 shadow-sm">
                  <span className="text-sm font-semibold text-secondary">
                    {t("daily.title")}
                  </span>
                </div>
              </div>
              <div className="max-w-md mx-auto w-full">
                <GameBoard
                  key={puzzleKey}
                  themeId={dailyInfo.themeId as ThemeId}
                  level={dailyInfo.level}
                  savedPuzzle={null}
                  isLastLevelInTheme={false}
                  isLastTheme={false}
                  hints={progress?.hints ?? 3}
                  lastHintRegenTime={progress?.lastHintRegenTime ?? 0}
                  coins={progress?.coins ?? 0}
                  onBackToJourney={handleDailyComplete}
                  onViewCollection={() => setScreen("collection")}
                  isDailyMode
                  dailySeed={dailyInfo.seed}
                  onDailyComplete={handleDailyComplete}
                />
              </div>
            </main>
          )}
        </>
      )}
    </div>
  );
}
