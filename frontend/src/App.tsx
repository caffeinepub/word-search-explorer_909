import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useActor } from "./hooks/useActor";
import { Toaster } from "sonner";
import { LandingPage } from "./components/LandingPage";
import { LoadingScreen } from "./components/LoadingScreen";
import { GameApp } from "./components/GameApp";
import { useTranslation } from "./locales";
import { useBackgroundMusic } from "./hooks/useBackgroundMusic";
import { useSettingsStore } from "./stores/settingsStore";
import { ensureAudioContext, disposeSynths } from "./utils/sounds";

function useAudioContextInit() {
  const musicEnabled = useSettingsStore((s) => s.musicEnabled);
  const soundsEnabled = useSettingsStore((s) => s.soundsEnabled);
  const setAudioContextReady = useSettingsStore((s) => s.setAudioContextReady);

  useEffect(() => {
    if (!musicEnabled && !soundsEnabled) return;

    const handleInteraction = async () => {
      const ready = await ensureAudioContext();
      if (ready) {
        setAudioContextReady(true);
      }
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };

    document.addEventListener("click", handleInteraction);
    document.addEventListener("touchstart", handleInteraction);

    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };
  }, [musicEnabled, soundsEnabled, setAudioContextReady]);

  // Cleanup synths on page unload to prevent memory leaks
  useEffect(() => {
    const handleUnload = () => disposeSynths();
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      disposeSynths();
    };
  }, []);
}

function AuthenticatedApp() {
  useBackgroundMusic();
  return <GameApp />;
}

function AppContent() {
  const { identity, login, isInitializing, isLoggingIn } =
    useInternetIdentity();
  const { actor, isFetching } = useActor();
  const { t } = useTranslation();
  useAudioContextInit();

  if (isInitializing) {
    return <LoadingScreen message={t("loading.initializing")} />;
  }

  if (!identity) {
    return <LandingPage onLogin={login} isLoggingIn={isLoggingIn} />;
  }

  if (!actor || isFetching) {
    return <LoadingScreen message={t("loading.connectingBackend")} />;
  }

  return <AuthenticatedApp />;
}

const App = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AppContent />
      <Toaster position="bottom-right" />
    </ThemeProvider>
  );
};

export default App;
