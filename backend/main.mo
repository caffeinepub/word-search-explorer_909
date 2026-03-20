import Array "mo:core/Array";
import Int "mo:core/Int";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";

actor {
  type UserProfile = { name : Text };

  var userProfiles : Map.Map<Principal, UserProfile> = Map.empty();

  // Game types
  type ThemeId = Text;

  type CurrentPuzzle = {
    themeId : ThemeId;
    puzzleIndex : Nat;
    grid : [[Text]];
    words : [Text];
    foundWords : [Text];
    hintsUsed : Nat;
  };

  type UserProgress = {
    coins : Nat;
    hints : Nat;
    lastHintRegenTime : Int;
    themeProgress : [(ThemeId, Nat)];
    currentPuzzle : ?CurrentPuzzle;
    lastDailyCompletion : Int;
  };

  type DailyPuzzleInfo = {
    themeId : ThemeId;
    level : Nat;
    seed : Nat;
    alreadyCompleted : Bool;
  };

  let DAY_NANOS : Int = 86_400_000_000_000;
  let THEME_ORDER : [ThemeId] = [
    "animals",
    "food",
    "fruits",
    "colors",
    "body",
    "family",
    "clothing",
    "kitchen",
    "school",
    "garden",
    "birds",
    "insects",
    "weather",
    "ocean",
    "sports",
    "music",
    "travel",
    "space",
    "tools",
    "countries",
    "vehicles",
    "flowers",
    "desserts",
    "jobs",
    "furniture",
    "drinks",
    "gems",
    "dance",
    "trees",
    "reptiles",
    "seasons",
    "cinema",
    "farm",
    "toys",
    "spices",
    "metals",
    "accessories",
    "shapes",
    "feelings",
    "water",
    "mountains",
    "seafood",
    "camping",
    "circus",
    "pirates",
    "castle",
    "jungle",
    "desert",
    "arctic",
    "carnival",
  ];

  var gameProgress : Map.Map<Principal, UserProgress> = Map.empty();

  func requireAuth(caller : Principal) {
    if (caller.isAnonymous()) {
      Runtime.trap("Not authenticated");
    };
  };

  func defaultProgress() : UserProgress {
    {
      coins = 0;
      hints = 3;
      lastHintRegenTime = Time.now();
      themeProgress = [];
      currentPuzzle = null;
      lastDailyCompletion = 0;
    };
  };

  func getOrCreateProgress(caller : Principal) : UserProgress {
    switch (gameProgress.get(caller)) {
      case (?p) { p };
      case (null) {
        let p = defaultProgress();
        gameProgress.add(caller, p);
        p;
      };
    };
  };

  // Hint economy constants
  let TWO_HOURS : Nat = 7_200_000_000_000;
  let MAX_HINTS : Nat = 5;
  let HINT_COST : Nat = 100;

  // Materialize time-based hint regeneration
  func materializeHints(progress : UserProgress) : (Nat, Int) {
    let now = Time.now();
    let elapsed : Int = now - progress.lastHintRegenTime;
    let regenCount : Nat = if (elapsed > 0) { Int.abs(elapsed) / TWO_HOURS } else {
      0;
    };
    let currentHints = Nat.min(progress.hints + regenCount, MAX_HINTS);
    let regenNs : Int = regenCount * TWO_HOURS;
    let newRegenTime : Int = if (currentHints >= MAX_HINTS) {
      now;
    } else if (regenCount > 0) {
      progress.lastHintRegenTime + regenNs;
    } else {
      progress.lastHintRegenTime;
    };
    (currentHints, newRegenTime);
  };

  // Profile
  public query ({ caller }) func checkAuth() : async Bool {
    requireAuth(caller);
    true;
  };

  public query ({ caller }) func getProfile() : async ?UserProfile {
    requireAuth(caller);
    userProfiles.get(caller);
  };

  public shared ({ caller }) func setProfile(name : Text) : async () {
    requireAuth(caller);
    if (name == "") {
      Runtime.trap("Name cannot be empty");
    };
    userProfiles.add(caller, { name });
  };

  // Game state
  public query ({ caller }) func getProgress() : async UserProgress {
    requireAuth(caller);
    switch (gameProgress.get(caller)) {
      case (?p) { p };
      case (null) { defaultProgress() };
    };
  };

  public shared ({ caller }) func startPuzzle(themeId : ThemeId, puzzleIndex : Nat, grid : [[Text]], words : [Text]) : async () {
    requireAuth(caller);

    // Basic validation
    if (grid.size() > 20) { Runtime.trap("Grid too large") };
    if (words.size() > 20) { Runtime.trap("Too many words") };
    if (puzzleIndex >= 5) { Runtime.trap("Invalid puzzle index") };

    let progress = getOrCreateProgress(caller);
    gameProgress.add(
      caller,
      {
        coins = progress.coins;
        hints = progress.hints;
        lastHintRegenTime = progress.lastHintRegenTime;
        themeProgress = progress.themeProgress;
        currentPuzzle = ?{
          themeId;
          puzzleIndex;
          grid;
          words;
          foundWords = [] : [Text];
          hintsUsed = 0;
        };
        lastDailyCompletion = progress.lastDailyCompletion;
      },
    );
  };

  public shared ({ caller }) func saveFoundWord(word : Text) : async () {
    requireAuth(caller);
    let progress = getOrCreateProgress(caller);
    switch (progress.currentPuzzle) {
      case (null) { Runtime.trap("No active puzzle") };
      case (?puzzle) {
        if (not puzzle.words.any(func(w) { w == word })) {
          Runtime.trap("Word not in puzzle");
        };
        if (puzzle.foundWords.any(func(w) { w == word })) {
          Runtime.trap("Word already found");
        };
        gameProgress.add(
          caller,
          {
            coins = progress.coins;
            hints = progress.hints;
            lastHintRegenTime = progress.lastHintRegenTime;
            themeProgress = progress.themeProgress;
            currentPuzzle = ?{
              themeId = puzzle.themeId;
              puzzleIndex = puzzle.puzzleIndex;
              grid = puzzle.grid;
              words = puzzle.words;
              foundWords = puzzle.foundWords.concat([word]);
              hintsUsed = puzzle.hintsUsed;
            };
            lastDailyCompletion = progress.lastDailyCompletion;
          },
        );
      };
    };
  };

  public shared ({ caller }) func useHint() : async () {
    requireAuth(caller);
    let progress = getOrCreateProgress(caller);
    let (currentHints, newRegenTime) = materializeHints(progress);
    if (currentHints == 0) { Runtime.trap("No hints available") };

    // Increment hintsUsed in current puzzle if one exists
    let updatedPuzzle = switch (progress.currentPuzzle) {
      case (null) { null };
      case (?puzzle) {
        ?{
          themeId = puzzle.themeId;
          puzzleIndex = puzzle.puzzleIndex;
          grid = puzzle.grid;
          words = puzzle.words;
          foundWords = puzzle.foundWords;
          hintsUsed = puzzle.hintsUsed + 1;
        };
      };
    };

    gameProgress.add(
      caller,
      {
        coins = progress.coins;
        hints = currentHints - 1;
        lastHintRegenTime = newRegenTime;
        themeProgress = progress.themeProgress;
        currentPuzzle = updatedPuzzle;
        lastDailyCompletion = progress.lastDailyCompletion;
      },
    );
  };

  public shared ({ caller }) func buyHint() : async () {
    requireAuth(caller);
    let progress = getOrCreateProgress(caller);
    if (progress.coins < HINT_COST) { Runtime.trap("Not enough coins") };
    let (currentHints, newRegenTime) = materializeHints(progress);
    if (currentHints >= MAX_HINTS) { Runtime.trap("Already at max hints") };
    gameProgress.add(
      caller,
      {
        coins = progress.coins - HINT_COST;
        hints = currentHints + 1;
        lastHintRegenTime = newRegenTime;
        themeProgress = progress.themeProgress;
        currentPuzzle = progress.currentPuzzle;
        lastDailyCompletion = progress.lastDailyCompletion;
      },
    );
  };

  // Returns true if this was a first-time completion (not a replay)
  public shared ({ caller }) func completePuzzle(hintsUsed : Nat, timedCompletion : Bool) : async Bool {
    requireAuth(caller);
    let progress = getOrCreateProgress(caller);
    switch (progress.currentPuzzle) {
      case (null) { Runtime.trap("No active puzzle") };
      case (?puzzle) {
        // Check if this level was already completed (replay detection)
        let completedLevel = puzzle.puzzleIndex + 1;
        var previousLevel : Nat = 0;
        for ((id, level) in progress.themeProgress.vals()) {
          if (id == puzzle.themeId) {
            previousLevel := level;
          };
        };
        let isFirstTime = completedLevel > previousLevel;

        // Coins: 10 base, 20 if no hints used
        var earnedCoins = 10;
        if (hintsUsed == 0) {
          earnedCoins := 20;
        };

        // Timed completion bonus (+10 coins)
        if (timedCompletion) {
          earnedCoins += 10;
        };

        // Update theme progress (only advances if new high)
        var themeFound = false;
        let updatedThemeProgress = Array.tabulate(
          progress.themeProgress.size(),
          func(i) {
            let (id, level) = progress.themeProgress[i];
            if (id == puzzle.themeId) {
              themeFound := true;
              if (completedLevel > level) { (id, completedLevel) } else {
                (id, level);
              };
            } else {
              (id, level);
            };
          },
        );

        let finalThemeProgress = if (not themeFound) {
          updatedThemeProgress.concat([(puzzle.themeId, completedLevel)]);
        } else {
          updatedThemeProgress;
        };

        // Chapter completion bonus (all 5 levels) - only on first-time completion
        var hintBonus = 0;
        if (completedLevel == 5 and isFirstTime) {
          earnedCoins += 50;
          hintBonus := if (hintsUsed == 0) { 2 } else { 1 };
        };

        let (currentHints, newRegenTime) = materializeHints(progress);
        let finalHints = Nat.min(currentHints + hintBonus, MAX_HINTS);

        gameProgress.add(
          caller,
          {
            coins = progress.coins + earnedCoins;
            hints = finalHints;
            lastHintRegenTime = newRegenTime;
            themeProgress = finalThemeProgress;
            currentPuzzle = null;
            lastDailyCompletion = progress.lastDailyCompletion;
          },
        );

        isFirstTime;
      };
    };
  };

  public query ({ caller }) func getDailyPuzzle() : async DailyPuzzleInfo {
    requireAuth(caller);
    let progress = switch (gameProgress.get(caller)) {
      case (?p) { p };
      case (null) { defaultProgress() };
    };

    let now = Time.now();
    let dayNumber = Int.abs(now / DAY_NANOS);
    let themeIndex = dayNumber % THEME_ORDER.size();
    let level = (dayNumber / THEME_ORDER.size()) % 5 + 1;
    let seed = dayNumber * 1000 + themeIndex * 10 + level;

    let completedToday = if (progress.lastDailyCompletion > 0) {
      Int.abs(progress.lastDailyCompletion / DAY_NANOS) == dayNumber;
    } else { false };

    {
      themeId = THEME_ORDER[themeIndex];
      level;
      seed;
      alreadyCompleted = completedToday;
    };
  };

  public shared ({ caller }) func clearCurrentPuzzle() : async () {
    requireAuth(caller);
    let progress = getOrCreateProgress(caller);
    gameProgress.add(
      caller,
      {
        coins = progress.coins;
        hints = progress.hints;
        lastHintRegenTime = progress.lastHintRegenTime;
        themeProgress = progress.themeProgress;
        currentPuzzle = null;
        lastDailyCompletion = progress.lastDailyCompletion;
      },
    );
  };

  public shared ({ caller }) func completeDailyPuzzle(hintsUsed : Nat) : async Nat {
    requireAuth(caller);
    let progress = getOrCreateProgress(caller);

    let now = Time.now();
    let dayNumber = Int.abs(now / DAY_NANOS);
    if (progress.lastDailyCompletion > 0 and Int.abs(progress.lastDailyCompletion / DAY_NANOS) == dayNumber) {
      Runtime.trap("Daily puzzle already completed today");
    };

    // 2x coins: 20 base, 40 if no hints
    let earnedCoins = if (hintsUsed == 0) { 40 } else { 20 };

    let (currentHints, newRegenTime) = materializeHints(progress);

    gameProgress.add(
      caller,
      {
        coins = progress.coins + earnedCoins;
        hints = currentHints;
        lastHintRegenTime = newRegenTime;
        themeProgress = progress.themeProgress;
        currentPuzzle = null;
        lastDailyCompletion = now;
      },
    );

    earnedCoins;
  };
};
