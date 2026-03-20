import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Share2, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "../locales";
import { useAudio } from "../hooks/useAudio";
import {
  generateCollectionImage,
  canUseWebShare,
  shareViaWebShare,
  downloadImage,
} from "../utils/shareUtils";
import { getCollectedPostcards, THEME_ORDER } from "../utils/progressHelpers";

interface ShareCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  themeProgress: Array<[string, number]>;
}

export function ShareCollectionDialog({
  open,
  onOpenChange,
  themeProgress,
}: ShareCollectionDialogProps) {
  const { t } = useTranslation();
  const { playTap } = useAudio();
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const collected = getCollectedPostcards(themeProgress);

  useEffect(() => {
    if (open && !imageBlob) {
      setIsGenerating(true);
      generateCollectionImage(
        collected.length,
        THEME_ORDER.length,
        collected,
        t,
      )
        .then((blob) => {
          setImageBlob(blob);
          setImageUrl(URL.createObjectURL(blob));
        })
        .catch(() => {
          toast.error("Failed to generate image");
          onOpenChange(false);
        })
        .finally(() => setIsGenerating(false));
    }
  }, [open, collected, t, imageBlob, onOpenChange]);

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
      setImageBlob(null);
      setImageUrl(null);
    }
    onOpenChange(newOpen);
  };

  const handleShare = async () => {
    if (!imageBlob) return;
    playTap();
    setIsSharing(true);
    const success = await shareViaWebShare(
      t("share.shareCollection"),
      t("share.collectionShareText", {
        count: collected.length,
        total: THEME_ORDER.length,
      }),
      imageBlob,
      "collection.png",
    );
    setIsSharing(false);
    if (success) {
      handleOpenChange(false);
    }
  };

  const handleDownload = () => {
    if (!imageBlob) return;
    playTap();
    downloadImage(imageBlob, "collection.png");
    toast.success("Image downloaded!");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("share.shareCollection")}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {isGenerating ? (
            <div className="aspect-[9/16] rounded-lg bg-muted flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {t("share.generating")}
              </span>
            </div>
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt="Collection preview"
              className="w-full rounded-lg shadow-md"
            />
          ) : null}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          {canUseWebShare() && (
            <Button
              onClick={handleShare}
              disabled={!imageBlob || isSharing}
              className="w-full gap-2"
            >
              {isSharing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Share2 className="h-4 w-4" />
              )}
              {t("share.share")}
            </Button>
          )}
          <Button
            onClick={handleDownload}
            disabled={!imageBlob}
            variant={canUseWebShare() ? "outline" : "default"}
            className="w-full gap-2"
          >
            <Download className="h-4 w-4" />
            {t("share.download")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
