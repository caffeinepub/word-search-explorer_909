import { useState } from "react";
import { Search, Pencil, LogOut, Coins, Sun, Moon } from "lucide-react";
import { cn } from "../lib/utils";
import { useTheme } from "next-themes";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { EditNameDialog } from "./EditNameDialog";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useTranslation } from "../locales";
import { useAudio } from "../hooks/useAudio";

interface HeaderProps {
  userName: string;
  variant?: "menu" | "default";
  coins?: number;
}

export function Header({
  userName,
  variant = "default",
  coins = 0,
}: HeaderProps) {
  const queryClient = useQueryClient();
  const { clear } = useInternetIdentity();
  const [editNameDialogOpen, setEditNameDialogOpen] = useState(false);
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { playToggle, playTap } = useAudio();

  const isMenu = variant === "menu";

  const handleLogout = () => {
    playTap();
    queryClient.clear();
    clear();
  };

  return (
    <>
      <header className="px-3 py-3 relative z-20">
        <div
          className={cn(
            "flex items-center justify-between sm:bg-transparent sm:rounded-none sm:border-0 sm:shadow-none sm:p-0",
            !isMenu &&
              "bg-card rounded-lg border border-border px-1.5 py-1 shadow-sm",
          )}
        >
          {!isMenu && (
            <div className="flex items-center gap-1.5 whitespace-nowrap px-2 sm:bg-card sm:rounded-lg sm:border sm:border-border sm:px-2.5 sm:py-1.5 sm:shadow-sm">
              <Search className="w-4 h-4 text-primary shrink-0" />
              <span className="hidden sm:inline text-base font-semibold">
                {t("header.title")}
              </span>
            </div>
          )}

          <div
            className={cn(
              "flex items-center gap-1.5 ml-auto sm:bg-card sm:rounded-lg sm:border sm:border-border sm:px-1.5 sm:py-1 sm:shadow-sm",
              isMenu &&
                "bg-card rounded-lg border border-border px-1.5 py-1 shadow-sm",
            )}
          >
            <div className="flex items-center gap-1.5 px-2">
              <Coins className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground tabular-nums">
                {coins}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => {
                playToggle();
                setTheme(theme === "dark" ? "light" : "dark");
              }}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full p-0"
                >
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  {t("header.welcomeBack", { name: userName })}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    playTap();
                    setEditNameDialogOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                  {t("header.editName")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  {t("header.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <EditNameDialog
        open={editNameDialogOpen}
        onOpenChange={setEditNameDialogOpen}
        currentName={userName}
      />
    </>
  );
}
