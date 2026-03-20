# Word Search Explorer

## Overview

Word Search Explorer is a relaxing word search puzzle game built on the Internet Computer. Players solve themed word search puzzles by swiping across letter grids to find hidden words. The game features 50 themed chapters, a postcard collection system, daily puzzles, and an optional timed challenge mode. Authentication is handled via Internet Identity, with all game progress stored on-chain.

## Authentication

- Requires Internet Identity authentication to play
- Anonymous access is not permitted for any game functionality
- All player data (progress, coins, hints, profiles) is isolated by principal
- Users can optionally set a display name after authentication

## Core Features

### Word Search Gameplay

- Swipe/drag across letters to select words
- Words can be hidden in 8 directions: horizontal, vertical, and diagonal (forwards and backwards)
- Valid word selections highlight permanently with distinct colors
- Invalid selections clear without penalty
- Visual trail follows finger/cursor during selection
- Current word being spelled displays above the grid

### Level Configuration

Each theme has 5 levels with increasing difficulty:

| Level | Grid Size | Word Count | Word Length Range |
| ----- | --------- | ---------- | ----------------- |
| 1     | 8×8       | 5 words    | 3-5 letters       |
| 2     | 9×9       | 6 words    | 3-6 letters       |
| 3     | 10×10     | 6 words    | 4-7 letters       |
| 4     | 11×11     | 7 words    | 5-8 letters       |
| 5     | 12×12     | 8 words    | 5-9 letters       |

### Themed Puzzles

50 themes organized in a journey map progression:

- Animals, Food, Fruits, Colors, Body, Family, Clothing, Kitchen, School, Garden
- Birds, Insects, Weather, Ocean, Sports, Music, Travel, Space, Tools, Countries
- Vehicles, Flowers, Desserts, Jobs, Furniture, Drinks, Gems, Dance, Trees, Reptiles
- Seasons, Cinema, Farm, Toys, Spices, Metals, Accessories, Shapes, Feelings, Water
- Mountains, Seafood, Camping, Circus, Pirates, Castle, Jungle, Desert, Arctic, Carnival

Each theme includes:

- Unique gradient background colors
- Theme-specific icon
- Collectible postcard with title, description, and stamp emoji
- Themed word list in 5 languages

### Theme Progression

- First theme (Animals) is unlocked by default
- Themes unlock sequentially by completing all 5 levels of the previous theme
- Journey map visualizes progress with completed, current, and locked states
- Players can replay completed levels but only earn rewards on first completion

### Coin Economy

Coins are earned for completing puzzles:

- Base reward: 10 coins per puzzle completion
- No hints used bonus: +10 coins (20 total)
- Timed completion bonus: +10 coins (when enabled)
- Chapter completion bonus: +50 coins (when completing level 5 for first time)
- Daily puzzle: 2× rewards (20 base, 40 with no hints)

Starting balance: 0

### Hint System

Hints reveal the starting position of one unfound word for 3 seconds.

Hint economy:

- Starting hints: 3
- Maximum hints: 5
- Hints regenerate: 1 hint every 2 hours
- Purchase price: 100 coins per hint
- Cannot purchase if already at max hints
- Chapter completion bonus: +1 hint (+2 if no hints used)

### Timed Mode

Optional challenge mode toggled in settings:

- Timer based on grid size:
  - 8×8: 60 seconds
  - 9×9: 75 seconds
  - 10×10: 90 seconds
  - 11×11: 105 seconds
  - 12×12: 120 seconds
- Warning at 30 seconds (visual indicator)
- Critical warning at 10 seconds (visual indicator)
- Completing within time: +10 coin bonus
- Time expiring: Puzzle can still be completed but no time bonus
- Not available for daily puzzles
- Progress not saved in timed mode (prevents timer exploit)

### Daily Puzzle

- One puzzle per day, same for all players
- Theme and level rotate deterministically based on day number
- Seeded puzzle generation ensures identical grid for all players
- 2× coin rewards
- Tracks completion to prevent replaying same day
- Available from home menu

### Postcard Collection

- One postcard per theme, unlocked by completing all 5 levels
- Postcards revealed via animation dialog on first chapter completion
- Collection album shows all postcards with locked/unlocked states
- Each postcard displays:
  - Theme gradient background
  - Stamp emoji
  - Localized title and description
- Shareable as images (individual postcards or full collection)

## Backend Data Storage

### User Profile

- `name`: Text - Optional display name

### User Progress

- `coins`: Nat - Currency balance
- `hints`: Nat - Current available hints (max 5)
- `lastHintRegenTime`: Int - Timestamp for hint regeneration calculation
- `themeProgress`: [(ThemeId, Nat)] - Completed level per theme (1-5)
- `currentPuzzle`: Optional saved puzzle state
- `lastDailyCompletion`: Int - Timestamp of last daily puzzle completion

### Current Puzzle (when active)

- `themeId`: Text - Current theme
- `puzzleIndex`: Nat - Level index (0-4)
- `grid`: [[Text]] - Letter grid
- `words`: [Text] - Words to find
- `foundWords`: [Text] - Words already found
- `hintsUsed`: Nat - Server-tracked hint usage for this puzzle

## Backend Operations

### Authentication

- All endpoints require authenticated principal (non-anonymous)
- `Runtime.trap("Not authenticated")` on anonymous access

### Profile Operations

- `getProfile()`: Returns user profile or null
- `setProfile(name)`: Sets display name (cannot be empty)

### Game Operations

- `getProgress()`: Returns full user progress
- `startPuzzle(themeId, puzzleIndex, grid, words)`: Saves new puzzle state with validation (grid max 20 rows, max 20 words, puzzleIndex 0-4)
- `saveFoundWord(word)`: Records found word (validates word is in puzzle and not already found)
- `completePuzzle(hintsUsed, timedCompletion)`: Finalizes puzzle, awards coins based on hintsUsed parameter, returns whether first-time completion
- `clearCurrentPuzzle()`: Removes saved puzzle state

### Hint Operations

- `useHint()`: Decrements hint count (with regeneration calculation), increments hintsUsed in current puzzle
- `buyHint()`: Exchanges 100 coins for 1 hint (max 5)

### Daily Puzzle

- `getDailyPuzzle()`: Returns theme, level, seed, and completion status for today
- `completeDailyPuzzle()`: Validates all words found, awards 2× coins using server-tracked hintsUsed, marks day as completed

## User Interface

### Screens

1. **Landing Page** - Pre-authentication with animated letter grid background and login button
2. **Home Menu** - Main navigation with Play, Daily Puzzle, Collection, and Settings buttons; displays stats (coins, hints, completed puzzles)
3. **Journey Map** - Vertical scrolling map of all 50 themes showing completion status
4. **Level Map** - 5-level chapter view for selected theme
5. **Game Board** - Active puzzle with letter grid, word list, timer (if enabled), hint button
6. **Collection Album** - Grid of all 50 postcards with locked/unlocked states

### Dialogs

- **Profile Setup** - Name entry on first login
- **Edit Name** - Change display name
- **Settings** - Music, sounds, language toggles
- **Language Selection** - Choose from 5 supported languages
- **Puzzle Complete** - Results with coin rewards and next action
- **Daily Puzzle Complete** - Daily-specific completion with 2× rewards
- **Postcard Reveal** - Animated reveal on chapter completion
- **Share Postcard** - Export single postcard as image
- **Share Collection** - Export collection summary as image

### Audio

- Background music (toggleable)
- Sound effects (toggleable)
- Both controlled via Settings dialog and persisted in Zustand store

## Sound System (Tone.js)

All audio is synthesized in real-time using Tone.js. No audio files are used.

### File Structure

```
src/
├── utils/sounds.ts        # Sound effect functions and synth management
├── hooks/useAudio.ts      # Hook wrapping sound functions with settings check
├── hooks/useBackgroundMusic.ts  # Background music sequencer
└── types/tone.d.ts        # Tone.js type declarations
```

### Audio Context Management

Located in `utils/sounds.ts`:

- `ensureAudioContext()` - Starts Tone.js audio context (requires user interaction)
- `isAudioContextReady()` - Checks if audio context is running
- `disposeSynths()` - Cleans up all synths on page unload

Audio context is initialized on first user click/touch in `App.tsx`.

### Synthesizer Types

Five lazy-loaded synths are cached and reused:

| Synth           | Type                    | Volume | Use Case                           |
| --------------- | ----------------------- | ------ | ---------------------------------- |
| `sineSynth`     | `Tone.Synth` (sine)     | -12dB  | UI taps, navigation, letter swipes |
| `triangleSynth` | `Tone.Synth` (triangle) | -10dB  | Word found melody                  |
| `squareSynth`   | `Tone.Synth` (square)   | -20dB  | Invalid selection, locked, timer   |
| `fmSynth`       | `Tone.FMSynth`          | -10dB  | Hint used, modal open swoosh       |
| `polySynth`     | `Tone.PolySynth`        | -8dB   | Puzzle complete chord              |

### Sound Effects

All functions in `utils/sounds.ts`:

| Function                 | Synth     | Notes                | Duration | Trigger                        |
| ------------------------ | --------- | -------------------- | -------- | ------------------------------ |
| `playLetterSelect()`     | sine      | C6                   | 32n      | Single letter tap              |
| `playLetterSwipe(index)` | sine      | C5-E6 scale          | 64n      | Each letter added to selection |
| `playWordFound()`        | triangle  | C5→E5→G5→C6 arpeggio | 16n-8n   | Valid word found               |
| `playPuzzleComplete()`   | poly      | C4→E4→G4→C5 + chord  | 8n-4n    | All words found                |
| `playHintUsed()`         | FM        | A5                   | 8n       | Hint activated                 |
| `playInvalidSelection()` | square    | G2                   | 16n      | Invalid word attempt           |
| `playTap()`              | sine      | G5                   | 64n      | Generic button tap             |
| `playNavigate()`         | sine      | E6                   | 32n      | Screen navigation              |
| `playBack()`             | sine      | A4                   | 32n      | Back button                    |
| `playLocked()`           | square    | D3                   | 32n      | Locked theme clicked           |
| `playToggle()`           | sine      | B5                   | 64n      | Toggle switch                  |
| `playModalOpen()`        | FM + sine | D4, then A5          | 32n      | Dialog opens                   |
| `playTimerTick()`        | square    | A4                   | 32n      | Timer warning tick             |
| `playTimeUp()`           | square    | E4→C4→A3             | 16n-8n   | Timer expired                  |

### Letter Swipe Scale

Ascending pentatonic scale for melodic swiping:

```typescript
const SWIPE_NOTES = [
  "C5",
  "D5",
  "E5",
  "F5",
  "G5",
  "A5",
  "B5",
  "C6",
  "D6",
  "E6",
];
```

Index wraps with modulo for selections longer than 10 letters.

### Background Music

Located in `hooks/useBackgroundMusic.ts`:

- Uses `Tone.AMSynth` at -18dB volume
- C major pentatonic scale: C4, D4, E4, G4, A4, C5, D5, E5
- 16-note arpeggio pattern with rests (null values)
- Loops continuously via `Tone.Sequence`
- Tempo: 70 BPM
- Auto-starts when `musicEnabled && audioContextReady`
- Properly disposes sequence and synth on stop

### useAudio Hook

Located in `hooks/useAudio.ts`:

Wraps all sound functions to check `soundsEnabled` setting before playing:

```typescript
const { playWordFound, playNavigate, ... } = useAudio();
```

Returns memoized callbacks that no-op when sounds are disabled.

### Adding New Sounds

1. Create function in `utils/sounds.ts`:

   ```typescript
   export function playNewSound(): void {
     if (!isAudioContextReady()) return;
     const synth = getSineSynth(); // or appropriate synth
     synth.triggerAttackRelease("C5", "8n");
   }
   ```

2. Add to `hooks/useAudio.ts`:
   - Import the function
   - Create wrapped callback in hook
   - Add to return object

3. Use in components:
   ```typescript
   const { playNewSound } = useAudio();
   ```

## Design System

### Visual Approach

- Colorful gradient backgrounds per theme
- Card-based UI with rounded corners and subtle shadows
- Clean, readable typography for letter grids
- Distinct colors for found words (8-color rotation)
- Light/dark theme support

### Animations

- Letter pop-in effect on grid reveal
- Floating animation on home screen letters
- Glow effect on primary action buttons
- Smooth selection trail during swipe

### Responsive Design

- Mobile-first layout optimized for touch
- Desktop support with mouse interaction
- Maximum content width of 448px (max-w-md)

## Localization

5 supported languages:

- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Portuguese (pt)

Each language includes:

- Full UI translation
- Theme-specific word lists
- Postcard titles and descriptions

Settings persisted locally via Zustand store.

## Error Handling

### Authentication Errors

- "Not authenticated" - Attempting any operation without Internet Identity

### Validation Errors

- "Name cannot be empty" - Empty profile name
- "No active puzzle" - Operations on non-existent puzzle
- "Word not in puzzle" - Saving invalid found word
- "Word already found" - Duplicate found word
- "Grid too large" - Grid exceeds 20 rows
- "Too many words" - More than 20 words in puzzle
- "Invalid puzzle index" - Puzzle index >= 5

### Resource Errors

- "No hints available" - Using hint with 0 hints
- "Not enough coins" - Purchasing hint without sufficient coins
- "Already at max hints" - Purchasing hint at 5/5
- "Daily puzzle already completed today" - Replaying daily puzzle
