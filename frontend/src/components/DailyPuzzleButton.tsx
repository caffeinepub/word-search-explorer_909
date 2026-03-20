import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { Calendar, Check, Loader2 } from "lucide-react";
import { useTranslation } from "../locales";
import { useDailyPuzzle } from "../hooks/useQueries";

interface DailyPuzzleButtonProps {
  onClick: () => void;
}

function getTimeUntilMidnightUTC(): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);

  const diff = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function DailyPuzzleButton({ onClick }: DailyPuzzleButtonProps) {
  const { t } = useTranslation();
  const { data: dailyInfo, isLoading, isError } = useDailyPuzzle();
  const [countdown, setCountdown] = useState(getTimeUntilMidnightUTC);
  const isCompleted = dailyInfo?.alreadyCompleted ?? false;

  useEffect(() => {
    if (isError) {
      toast.error(t("errors.loadDaily"));
    }
  }, [isError, t]);

  useEffect(() => {
    if (!isCompleted) return;

    const interval = setInterval(() => {
      setCountdown(getTimeUntilMidnightUTC());
    }, 60_000);

    return () => clearInterval(interval);
  }, [isCompleted]);

  if (isLoading) {
    return (
      <Button
        size="lg"
        variant="outline"
        className="w-full h-12 text-base font-semibold gap-2.5 rounded-xl bg-card border-border"
        disabled
      >
        <Loader2 className="w-5 h-5 animate-spin" />
        {t("daily.loading")}
      </Button>
    );
  }

  if (isCompleted) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="lg"
            variant="outline"
            className="w-full h-12 text-base font-semibold gap-2.5 rounded-xl bg-card border-border opacity-75 cursor-default"
            onClick={(e) => e.preventDefault()}
          >
            <Check className="w-5 h-5 text-green-500" />
            {t("daily.completed")}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {t("daily.nextIn", { time: countdown })}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Button
      size="lg"
      variant="outline"
      className="w-full h-12 text-base font-semibold gap-2.5 rounded-xl bg-card border-border hover:bg-accent hover:text-accent-foreground"
      onClick={onClick}
    >
      <Calendar className="w-5 h-5" />
      {t("daily.title")}
    </Button>
  );
}
