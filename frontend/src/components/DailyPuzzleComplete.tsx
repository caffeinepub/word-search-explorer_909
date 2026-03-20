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
import { Coins, Lightbulb, Sparkles, Home } from "lucide-react";
import { useTranslation } from "../locales";
import { useAudio } from "../hooks/useAudio";

const BASE_COINS = 20;
const NO_HINT_BONUS = 20;

interface DailyPuzzleCompleteProps {
  open: boolean;
  wordsFound: number;
  hintsUsed: number;
  onBackToHome: () => void;
}

export function DailyPuzzleComplete({
  open,
  wordsFound,
  hintsUsed,
  onBackToHome,
}: DailyPuzzleCompleteProps) {
  const { t } = useTranslation();
  const { playBack, playModalOpen } = useAudio();

  useEffect(() => {
    if (open) {
      playModalOpen();
    }
  }, [open, playModalOpen]);

  const noHintBonus = hintsUsed === 0 ? NO_HINT_BONUS : 0;
  const totalCoins = BASE_COINS + noHintBonus;

  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false} className="sm:max-w-sm">
        <DialogHeader className="items-center text-center">
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-xl">
            {t("daily.completeTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("daily.completeDescription")}
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
                  {t("daily.dailyBonus")}
                </span>
              </div>
              <span className="text-lg font-bold text-primary">
                +{totalCoins}
              </span>
            </div>
            <div className="mt-2 space-y-1 text-xs text-primary/70">
              <div className="flex justify-between">
                <span>{t("daily.baseReward")}</span>
                <span>+{BASE_COINS}</span>
              </div>
              {noHintBonus > 0 && (
                <div className="flex justify-between">
                  <span>{t("daily.noHintBonus")}</span>
                  <span>+{noHintBonus}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
            <Lightbulb className="h-4 w-4" />
            {t("daily.comeBackTomorrow")}
          </div>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button
            onClick={() => {
              playBack();
              onBackToHome();
            }}
            className="w-full rounded-full gap-2"
          >
            <Home className="h-4 w-4" />
            {t("daily.backToHome")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
