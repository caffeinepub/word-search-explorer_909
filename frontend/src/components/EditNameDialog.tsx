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

interface EditNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
}

export function EditNameDialog({
  open,
  onOpenChange,
  currentName,
}: EditNameDialogProps) {
  const [name, setName] = useState(currentName);
  const [error, setError] = useState<string | null>(null);
  const { mutate: setProfile, isPending } = useSetProfile();
  const { t } = useTranslation();
  const { playTap, playBack, playModalOpen } = useAudio();

  useEffect(() => {
    if (open) {
      setName(currentName);
      setError(null);
      playModalOpen();
    }
  }, [open, currentName, playModalOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    playTap();
    setError(null);
    setProfile(
      { name: name.trim() },
      {
        onSuccess: () => onOpenChange(false),
        onError: (err: unknown) => {
          setError(
            err instanceof Error ? err.message : t("profile.failedToUpdate"),
          );
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t("profile.editTitle")}</DialogTitle>
            <DialogDescription>
              {t("profile.editDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">{t("common.name")}</Label>
              <Input
                id="edit-name"
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
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                playBack();
                onOpenChange(false);
              }}
              disabled={isPending}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={!name.trim() || isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? t("common.saving") : t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
