import { useEffect, useState } from "react";
import { Lightbulb, Coins, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import {
  getEffectiveHints,
  getNextHintCountdownMs,
  formatCountdown,
} from "../utils/hintHelpers";
import { useTranslation } from "../locales";
import { useAudio } from "../hooks/useAudio";

interface HintButtonProps {
  storedHints: number;
  lastHintRegenTimeNs: number;
  coins: number;
  disabled?: boolean;
  isUsingHint?: boolean;
  isBuyingHint?: boolean;
  onUseHint: () => void;
  onBuyHint: () => void;
}

const MAX_HINTS = 5;
const HINT_COST = 100;

export function HintButton({
  storedHints,
  lastHintRegenTimeNs,
  coins,
  disabled = false,
  isUsingHint = false,
  isBuyingHint = false,
  onUseHint,
  onBuyHint,
}: HintButtonProps) {
  const { t } = useTranslation();
  const { playTap } = useAudio();
  const [countdown, setCountdown] = useState<string | null>(null);
  const availableHints = getEffectiveHints(storedHints, lastHintRegenTimeNs);

  useEffect(() => {
    function updateCountdown() {
      const ms = getNextHintCountdownMs(storedHints, lastHintRegenTimeNs);
      setCountdown(ms !== null ? formatCountdown(ms) : null);
    }
    updateCountdown();
    const interval = setInterval(updateCountdown, 60_000);
    return () => clearInterval(interval);
  }, [storedHints, lastHintRegenTimeNs]);

  const canBuy = coins >= HINT_COST && availableHints < MAX_HINTS;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "gap-1.5 relative",
          availableHints > 0 &&
            !disabled &&
            !isUsingHint &&
            "border-primary/40",
        )}
        disabled={disabled || availableHints === 0 || isUsingHint}
        onClick={onUseHint}
      >
        {isUsingHint ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        ) : (
          <Lightbulb
            className={cn(
              "h-4 w-4",
              availableHints > 0 ? "text-primary" : "text-muted-foreground",
            )}
          />
        )}
        <span className="font-semibold">{availableHints}</span>
        {countdown && (
          <span className="text-xs text-muted-foreground ml-0.5">
            +{countdown}
          </span>
        )}
      </Button>
      {canBuy && (
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-xs text-primary"
          disabled={isBuyingHint}
          onClick={() => {
            playTap();
            onBuyHint();
          }}
        >
          {isBuyingHint ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Coins className="h-3.5 w-3.5" />
          )}
          +{HINT_COST}
        </Button>
      )}
    </div>
  );
}
