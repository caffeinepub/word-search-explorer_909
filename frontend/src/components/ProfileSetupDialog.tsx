import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Loader2 } from "lucide-react";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useSetProfile } from "../hooks/useQueries";
import { useTranslation } from "../locales";
import { useAudio } from "../hooks/useAudio";

interface ProfileSetupDialogProps {
  open: boolean;
}

export function ProfileSetupDialog({ open }: ProfileSetupDialogProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { mutate: setProfile, isPending } = useSetProfile();
  const { t } = useTranslation();
  const { playModalOpen } = useAudio();

  useEffect(() => {
    if (open) {
      playModalOpen();
    }
  }, [open, playModalOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    setProfile(
      { name: name.trim() },
      {
        onError: (err: unknown) => {
          setError(
            err instanceof Error ? err.message : t("profile.failedToSave"),
          );
        },
      },
    );
  };

  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t("profile.setupTitle")}</DialogTitle>
            <DialogDescription>
              {t("profile.setupDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t("common.name")}</Label>
              <Input
                id="name"
                placeholder={t("common.enterYourName")}
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
                maxLength={100}
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={!name.trim() || isPending}
              className="rounded-full"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? t("common.saving") : t("profile.getStarted")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
