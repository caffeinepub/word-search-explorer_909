import { Timer } from "lucide-react";
import { Switch } from "../components/ui/switch";
import { useSettingsStore } from "../stores/settingsStore";
import { useAudio } from "../hooks/useAudio";
import { useTranslation } from "../locales";

export function TimedModeToggle() {
  const { t } = useTranslation();
  const { playToggle } = useAudio();
  const timedModeEnabled = useSettingsStore((s) => s.timedModeEnabled);
  const setTimedModeEnabled = useSettingsStore((s) => s.setTimedModeEnabled);

  const handleToggle = (checked: boolean) => {
    playToggle();
    setTimedModeEnabled(checked);
  };

  return (
    <div className="w-full max-w-md mx-auto mb-4 flex items-center justify-between bg-card rounded-lg border border-border px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <Timer className="w-5 h-5 text-primary" />
        <div>
          <p className="text-sm font-medium text-foreground">
            {t("game.timedMode")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("game.timedModeDescription")}
          </p>
        </div>
      </div>
      <Switch checked={timedModeEnabled} onCheckedChange={handleToggle} />
    </div>
  );
}
