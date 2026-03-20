import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Check } from "lucide-react";
import { cn } from "../lib/utils";
import { useTranslation } from "../locales";
import { useAudio } from "../hooks/useAudio";
import {
  useSettingsStore,
  LANGUAGES,
  type Language,
} from "../stores/settingsStore";
import { useClearCurrentPuzzle } from "../hooks/useQueries";

interface LanguageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LanguageDialog({ open, onOpenChange }: LanguageDialogProps) {
  const { t } = useTranslation();
  const { playTap, playModalOpen } = useAudio();
  const { language, setLanguage } = useSettingsStore();
  const { mutate: clearCurrentPuzzle } = useClearCurrentPuzzle();

  useEffect(() => {
    if (open) {
      playModalOpen();
    }
  }, [open, playModalOpen]);

  const handleSelect = (code: Language) => {
    playTap();
    if (code !== language) {
      clearCurrentPuzzle();
    }
    setLanguage(code);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("settings.selectLanguage")}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-2">
          {(
            Object.entries(LANGUAGES) as [
              Language,
              (typeof LANGUAGES)[Language],
            ][]
          ).map(([code, { label, flag }]) => {
            const isSelected = code === language;
            return (
              <button
                key={code}
                onClick={() => handleSelect(code)}
                className={cn(
                  "relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors",
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/50 hover:bg-accent",
                )}
              >
                {isSelected && (
                  <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </span>
                )}
                <span className="text-3xl">{flag}</span>
                <span className="text-sm font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
