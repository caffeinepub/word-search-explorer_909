import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import {
  Coins,
  Lightbulb,
  Sparkles,
  Trophy,
  ArrowRight,
  Map,
  Timer,
} from "lucide-react";
import { useTranslation } from "../locales";
import { useAudio } from "../hooks/useAudio";
import { TIMED_COMPLETION_BONUS } from "../utils/themes";

const BASE_COINS = 10;
const NO_HINT_BONUS = 10;
const CHAPTER_BONUS = 50;

interface PuzzleCompleteProps {
  open: boolean;
  wordsFound: number;
  hintsUsed: number;
  isLastLevelInTheme: boolean;
  isLastTheme: boolean;
  timedCompletion?: boolean;
  onNextPuzzle: () => void;
  onBackToJourney: () => void;
}

export function PuzzleComplete({
  open,
  wordsFound,
  hintsUsed,
  isLastLevelInTheme,
  isLastTheme,
  timedCompletion = false,
  onNextPuzzle,
  onBackToJourney,
}: PuzzleCompleteProps) {
  const { t } = useTranslation();
  const { playNavigate, playBack, playModalOpen } = useAudio();

  useEffect(() => {
    if (open) {
      playModalOpen();
    }
  }, [open, playModalOpen]);
  const noHintBonus = hintsUsed === 0 ? NO_HINT_BONUS : 0;
  const timedBonus = timedCompletion ? TIMED_COMPLETION_BONUS : 0;
  const totalCoins = BASE_COINS + noHintBonus + timedBonus;
  const hintBonus = isLastLevelInTheme ? (hintsUsed === 0 ? 2 : 1) : 0;

  const title = isLastLevelInTheme
    ? t("game.chapterComplete")
    : t("game.puzzleComplete");

  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false} className="sm:max-w-sm">
        <DialogHeader className="items-center text-center">
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
            {isLastLevelInTheme ? (
              <Trophy className="h-8 w-8 text-primary" />
            ) : (
              <Sparkles className="h-8 w-8 text-primary" />
            )}
          </div>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription>
            {t("game.puzzleCompleteDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
            <span className="text-sm text-muted-foreground">
              {t("game.wordsFound")}
            </span>
            <span className="font-semibold">{wordsFound}</span>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
            <span className="text-sm text-muted-foreground">
              {t("game.hintsUsed")}
            </span>
            <span className="font-semibold">{hintsUsed}</span>
          </div>

          <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  {t("game.coinsEarned")}
                </span>
              </div>
              <span className="text-lg font-bold text-primary">
                +{totalCoins}
              </span>
            </div>
            {noHintBonus > 0 && (
              <p className="mt-1 text-xs text-primary/70">
                {t("game.noHintBonus", { bonus: noHintBonus })}
              </p>
            )}
            {timedBonus > 0 && (
              <p className="mt-1 text-xs text-primary/70">
                {t("game.timerBonus", { bonus: timedBonus })}
              </p>
            )}
          </div>

          {timedCompletion && (
            <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    {t("game.completedInTime")}
                  </span>
                </div>
              </div>
            </div>
          )}

          {isLastLevelInTheme && (
            <div className="rounded-lg border border-secondary/30 bg-secondary/10 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-secondary" />
                  <span className="text-sm font-medium">
                    {t("game.chapterBonus", { bonus: CHAPTER_BONUS })}
                  </span>
                </div>
                <span className="text-lg font-bold text-secondary">
                  +{CHAPTER_BONUS}
                </span>
              </div>
            </div>
          )}

          {hintBonus > 0 && (
            <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    {t("game.hintBonusChapter", { count: hintBonus })}
                  </span>
                </div>
                <span className="text-lg font-bold text-primary">
                  +{hintBonus}
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-center">
          {isLastLevelInTheme && isLastTheme ? (
            <Button
              onClick={() => {
                playBack();
                onBackToJourney();
              }}
              className="w-full rounded-full gap-2"
            >
              <Map className="h-4 w-4" />
              {t("game.backToJourney")}
            </Button>
          ) : isLastLevelInTheme ? (
            <Button
              onClick={() => {
                playNavigate();
                onNextPuzzle();
              }}
              className="w-full rounded-full gap-2"
            >
              {t("game.nextTheme")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => {
                playNavigate();
                onNextPuzzle();
              }}
              className="w-full rounded-full gap-2"
            >
              {t("game.nextPuzzle")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
