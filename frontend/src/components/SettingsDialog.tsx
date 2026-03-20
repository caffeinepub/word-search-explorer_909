import { useState, useEffect } from "react";
import { Music, Volume2, Globe } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Switch } from "../components/ui/switch";
import { Button } from "../components/ui/button";
import { useSettingsStore, LANGUAGES } from "../stores/settingsStore";
import { LanguageDialog } from "./LanguageDialog";
import { useTranslation } from "../locales";
import { useAudio } from "../hooks/useAudio";
import { ensureAudioContext } from "../utils/sounds";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { t } = useTranslation();
  const { playModalOpen, playToggle } = useAudio();
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);

  const {
    musicEnabled,
    setMusicEnabled,
    soundsEnabled,
    setSoundsEnabled,
    setAudioContextReady,
    language,
  } = useSettingsStore();

  useEffect(() => {
    if (open) {
      playModalOpen();
    }
  }, [open, playModalOpen]);

  const handleMusicToggle = async (enabled: boolean) => {
    if (enabled) {
      const ready = await ensureAudioContext();
      if (ready) setAudioContextReady(true);
    }
    setMusicEnabled(enabled);
    playToggle();
  };

  const handleSoundsToggle = async (enabled: boolean) => {
    if (enabled) {
      const ready = await ensureAudioContext();
      if (ready) setAudioContextReady(true);
      setSoundsEnabled(true);
      playToggle();
    } else {
      setSoundsEnabled(false);
    }
  };

  const currentLanguage = LANGUAGES[language];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("settings.title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <Music className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{t("settings.music")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.musicDescription")}
                  </p>
                </div>
              </div>
              <Switch
                checked={musicEnabled}
                onCheckedChange={handleMusicToggle}
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <Volume2 className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{t("settings.sounds")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.soundsDescription")}
                  </p>
                </div>
              </div>
              <Switch
                checked={soundsEnabled}
                onCheckedChange={handleSoundsToggle}
              />
            </div>

            <Button
              variant="outline"
              className="w-full justify-between rounded-lg border border-border bg-card p-4 h-auto"
              onClick={() => {
                onOpenChange(false);
                setLanguageDialogOpen(true);
              }}
            >
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-primary" />
                <span className="font-medium">{t("settings.language")}</span>
              </div>
              <span className="text-muted-foreground">
                {currentLanguage.flag} {currentLanguage.label}
              </span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <LanguageDialog
        open={languageDialogOpen}
        onOpenChange={setLanguageDialogOpen}
      />
    </>
  );
}
