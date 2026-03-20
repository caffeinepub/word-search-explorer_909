import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Sparkles, BookOpen, ArrowRight, Share2 } from "lucide-react";
import { useTranslation } from "../locales";
import { useAudio } from "../hooks/useAudio";
import { PostcardCard } from "./PostcardCard";
import { SharePostcardDialog } from "./SharePostcardDialog";
import type { ThemeId } from "../utils/themes";

interface PostcardRevealDialogProps {
  open: boolean;
  themeId: ThemeId;
  onContinue: () => void;
  onViewCollection: () => void;
}

export function PostcardRevealDialog({
  open,
  themeId,
  onContinue,
  onViewCollection,
}: PostcardRevealDialogProps) {
  const { t } = useTranslation();
  const { playNavigate, playTap, playModalOpen } = useAudio();
  const [showShareDialog, setShowShareDialog] = useState(false);

  useEffect(() => {
    if (open) {
      playModalOpen();
      setShowShareDialog(false);
    }
  }, [open, playModalOpen]);

  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false} className="sm:max-w-sm">
        <DialogHeader className="items-center text-center">
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-xl">
            {t("postcards.newPostcard")}
          </DialogTitle>
          <DialogDescription>{t("postcards.earned")}</DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <div className="animate-postcard-flip">
            <PostcardCard themeId={themeId} unlocked />
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={() => {
              playTap();
              setShowShareDialog(true);
            }}
            variant="outline"
            className="w-full rounded-full gap-2"
          >
            <Share2 className="h-4 w-4" />
            {t("share.share")}
          </Button>
          <Button
            onClick={() => {
              playTap();
              onViewCollection();
            }}
            variant="outline"
            className="w-full rounded-full gap-2"
          >
            <BookOpen className="h-4 w-4" />
            {t("postcards.viewCollection")}
          </Button>
          <Button
            onClick={() => {
              playNavigate();
              onContinue();
            }}
            className="w-full rounded-full gap-2"
          >
            {t("postcards.continue")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>

      <SharePostcardDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        themeId={themeId}
      />
    </Dialog>
  );
}
