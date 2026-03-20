import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Loader2, Sparkles, Trophy, Calendar } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { LetterGrid } from "./LandingLetterGrid";
import { MiniPreviewGrid } from "./MiniPreviewGrid";
import { useTranslation } from "../locales";

interface LandingPageProps {
  onLogin: () => void;
  isLoggingIn: boolean;
}

export function LandingPage({ onLogin, isLoggingIn }: LandingPageProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      <ThemeToggle />
      <LetterGrid />

      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="pt-8 pb-8 px-6 flex flex-col items-center gap-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-foreground">
                {t("landing.title")}
              </h1>
              <p className="text-muted-foreground">{t("landing.subtitle")}</p>
            </div>

            <MiniPreviewGrid />

            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="w-3 h-3" />
                {t("landing.themes")}
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Trophy className="w-3 h-3" />
                {t("landing.collectStamps")}
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Calendar className="w-3 h-3" />
                {t("landing.dailyPuzzles")}
              </Badge>
            </div>

            <Button
              size="lg"
              className="w-full animate-glow font-semibold"
              onClick={onLogin}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("landing.connecting")}
                </>
              ) : (
                t("landing.signIn")
              )}
            </Button>
          </CardContent>
        </Card>
      </main>

      <footer className="relative z-10 pb-4 text-center text-xs text-muted-foreground">
        © 2025. Built with ❤️ using{" "}
        <a
          href="https://caffeine.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
