import { useState } from "react";
import { ArrowLeft, Share2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { useTranslation } from "../locales";
import { useAudio } from "../hooks/useAudio";
import { THEME_ORDER, getCollectedPostcards } from "../utils/progressHelpers";
import { PostcardCard } from "./PostcardCard";
import { SharePostcardDialog } from "./SharePostcardDialog";
import { ShareCollectionDialog } from "./ShareCollectionDialog";
import type { ThemeId } from "../utils/themes";

interface CollectionAlbumProps {
  themeProgress: Array<[string, number]>;
  onBack: () => void;
}

export function CollectionAlbum({
  themeProgress,
  onBack,
}: CollectionAlbumProps) {
  const { t } = useTranslation();
  const { playBack, playTap } = useAudio();
  const collected = getCollectedPostcards(themeProgress);
  const collectedSet = new Set<ThemeId>(collected);

  const [sharePostcardTheme, setSharePostcardTheme] = useState<ThemeId | null>(
    null,
  );
  const [showShareCollection, setShowShareCollection] = useState(false);

  return (
    <main className="flex-1 flex flex-col min-h-0 px-4 sm:px-0 py-4 relative z-10">
      <div className="w-full max-w-md mx-auto mb-4 flex items-center justify-between bg-card rounded-lg border border-border px-2 py-1.5 shadow-sm">
        <Button
          variant="ghost"
          className="gap-2 px-2"
          onClick={() => {
            playBack();
            onBack();
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          {t("common.back")}
        </Button>
        <h2 className="text-sm font-semibold pr-2">{t("collection.title")}</h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-4 flex items-center justify-between">
            <div className="w-8" />
            <span className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-sm font-medium text-primary">
              {t("collection.postcardCount", {
                count: collected.length,
                total: THEME_ORDER.length,
              })}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="p-1.5 h-auto"
              onClick={() => {
                playTap();
                setShowShareCollection(true);
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {collected.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">
              {t("collection.emptyState")}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-hidden">
            {THEME_ORDER.map((themeId, index) => (
              <div
                key={themeId}
                className="animate-letter-pop"
                style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}
              >
                <PostcardCard
                  themeId={themeId}
                  unlocked={collectedSet.has(themeId)}
                  onShare={
                    collectedSet.has(themeId)
                      ? () => setSharePostcardTheme(themeId)
                      : undefined
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {sharePostcardTheme && (
        <SharePostcardDialog
          open={!!sharePostcardTheme}
          onOpenChange={(open) => !open && setSharePostcardTheme(null)}
          themeId={sharePostcardTheme}
        />
      )}

      <ShareCollectionDialog
        open={showShareCollection}
        onOpenChange={setShowShareCollection}
        themeProgress={themeProgress}
      />
    </main>
  );
}
