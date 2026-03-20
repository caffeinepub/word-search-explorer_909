// Language-specific word lists for puzzle generation.
//
// Each language has its own independent word pools per theme — these are NOT
// translations of each other. English "animals" has CAT, DOG, LION, while
// Spanish "animals" would have its own thematic words in Spanish.
//
// Adding word lists for a new language:
// 1. Create a new file (e.g., src/utils/wordLists/es.ts)
//    - Export a Record<ThemeId, string[]> matching the shape of en.ts
//    - Words should be uppercase, common words in that language per theme
// 2. Import it here and add it to the `wordLists` record
// 3. Ensure the language code is already registered in stores/settingsStore.ts
//    and locales/ (see locales/index.ts for UI translation instructions)

import type { Language } from "../../stores/settingsStore";
import type { ThemeId } from "../../utils/themes";
import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { de } from "./de";
import { pt } from "./pt";

const wordLists: Record<Language, Record<ThemeId, string[]>> = {
  en,
  es,
  fr,
  de,
  pt,
};

export function getWordList(language: Language, theme: ThemeId): string[] {
  return wordLists[language]?.[theme] ?? wordLists.en[theme];
}
