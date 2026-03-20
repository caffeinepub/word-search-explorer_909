export interface PostcardData {
  titleKey: string;
  descriptionKey: string;
  stamp: string;
}

export interface ThemeConfig {
  name: string;
  gradient: [string, string];
  accent: string;
  icon: string;
  postcard: PostcardData;
}

export interface LevelConfig {
  gridSize: number;
  wordCount: number;
  wordLengthRange: [number, number];
}

export const LEVEL_CONFIG: Record<number, LevelConfig> = {
  1: { gridSize: 8, wordCount: 5, wordLengthRange: [3, 5] },
  2: { gridSize: 9, wordCount: 6, wordLengthRange: [3, 6] },
  3: { gridSize: 10, wordCount: 6, wordLengthRange: [4, 7] },
  4: { gridSize: 11, wordCount: 7, wordLengthRange: [5, 8] },
  5: { gridSize: 12, wordCount: 8, wordLengthRange: [5, 9] },
};

// Timer durations in seconds, indexed by grid size
export const TIMED_MODE_SECONDS: Record<number, number> = {
  8: 60,
  9: 75,
  10: 90,
  11: 105,
  12: 120,
};

export const TIMER_WARNING_THRESHOLD = 30;
export const TIMER_CRITICAL_THRESHOLD = 10;
export const TIMED_COMPLETION_BONUS = 10;

export const THEMES = {
  animals: {
    name: "Animals",
    gradient: ["#fef3c7", "#fde68a"],
    accent: "#f59e0b",
    icon: "PawPrint",
    postcard: {
      titleKey: "postcards.animals.title",
      descriptionKey: "postcards.animals.description",
      stamp: "🐾",
    },
  },
  food: {
    name: "Food",
    gradient: ["#fce7f3", "#fbcfe8"],
    accent: "#ec4899",
    icon: "UtensilsCrossed",
    postcard: {
      titleKey: "postcards.food.title",
      descriptionKey: "postcards.food.description",
      stamp: "🍽️",
    },
  },
  fruits: {
    name: "Fruits",
    gradient: ["#ffedd5", "#fed7aa"],
    accent: "#f97316",
    icon: "Apple",
    postcard: {
      titleKey: "postcards.fruits.title",
      descriptionKey: "postcards.fruits.description",
      stamp: "🍎",
    },
  },
  colors: {
    name: "Colors",
    gradient: ["#f5d0fe", "#e9d5ff"],
    accent: "#a855f7",
    icon: "Palette",
    postcard: {
      titleKey: "postcards.colors.title",
      descriptionKey: "postcards.colors.description",
      stamp: "🎨",
    },
  },
  body: {
    name: "Body",
    gradient: ["#ffe4e6", "#fecdd3"],
    accent: "#f43f5e",
    icon: "Heart",
    postcard: {
      titleKey: "postcards.body.title",
      descriptionKey: "postcards.body.description",
      stamp: "❤️",
    },
  },
  family: {
    name: "Family",
    gradient: ["#fdf2f8", "#fce7f3"],
    accent: "#db2777",
    icon: "Users",
    postcard: {
      titleKey: "postcards.family.title",
      descriptionKey: "postcards.family.description",
      stamp: "👨‍👩‍👧‍👦",
    },
  },
  clothing: {
    name: "Clothing",
    gradient: ["#e0e7ff", "#c7d2fe"],
    accent: "#6366f1",
    icon: "Shirt",
    postcard: {
      titleKey: "postcards.clothing.title",
      descriptionKey: "postcards.clothing.description",
      stamp: "👕",
    },
  },
  kitchen: {
    name: "Kitchen",
    gradient: ["#fed7aa", "#fdba74"],
    accent: "#ea580c",
    icon: "ChefHat",
    postcard: {
      titleKey: "postcards.kitchen.title",
      descriptionKey: "postcards.kitchen.description",
      stamp: "👨‍🍳",
    },
  },
  school: {
    name: "School",
    gradient: ["#e0f2fe", "#bae6fd"],
    accent: "#0ea5e9",
    icon: "GraduationCap",
    postcard: {
      titleKey: "postcards.school.title",
      descriptionKey: "postcards.school.description",
      stamp: "🎓",
    },
  },
  garden: {
    name: "Garden",
    gradient: ["#dcfce7", "#bbf7d0"],
    accent: "#22c55e",
    icon: "Flower2",
    postcard: {
      titleKey: "postcards.garden.title",
      descriptionKey: "postcards.garden.description",
      stamp: "🌸",
    },
  },
  birds: {
    name: "Birds",
    gradient: ["#cffafe", "#a5f3fc"],
    accent: "#06b6d4",
    icon: "Bird",
    postcard: {
      titleKey: "postcards.birds.title",
      descriptionKey: "postcards.birds.description",
      stamp: "🐦",
    },
  },
  insects: {
    name: "Insects",
    gradient: ["#ecfccb", "#d9f99d"],
    accent: "#84cc16",
    icon: "Bug",
    postcard: {
      titleKey: "postcards.insects.title",
      descriptionKey: "postcards.insects.description",
      stamp: "🐛",
    },
  },
  weather: {
    name: "Weather",
    gradient: ["#f1f5f9", "#e2e8f0"],
    accent: "#64748b",
    icon: "Cloud",
    postcard: {
      titleKey: "postcards.weather.title",
      descriptionKey: "postcards.weather.description",
      stamp: "⛅",
    },
  },
  ocean: {
    name: "Ocean",
    gradient: ["#ccfbf1", "#99f6e4"],
    accent: "#14b8a6",
    icon: "Waves",
    postcard: {
      titleKey: "postcards.ocean.title",
      descriptionKey: "postcards.ocean.description",
      stamp: "🌊",
    },
  },
  sports: {
    name: "Sports",
    gradient: ["#fee2e2", "#fecaca"],
    accent: "#ef4444",
    icon: "Trophy",
    postcard: {
      titleKey: "postcards.sports.title",
      descriptionKey: "postcards.sports.description",
      stamp: "🏆",
    },
  },
  music: {
    name: "Music",
    gradient: ["#ede9fe", "#ddd6fe"],
    accent: "#8b5cf6",
    icon: "Music",
    postcard: {
      titleKey: "postcards.music.title",
      descriptionKey: "postcards.music.description",
      stamp: "🎵",
    },
  },
  travel: {
    name: "Travel",
    gradient: ["#fef9c3", "#fef08a"],
    accent: "#eab308",
    icon: "Plane",
    postcard: {
      titleKey: "postcards.travel.title",
      descriptionKey: "postcards.travel.description",
      stamp: "✈️",
    },
  },
  space: {
    name: "Space",
    gradient: ["#eef2ff", "#e0e7ff"],
    accent: "#4f46e5",
    icon: "Rocket",
    postcard: {
      titleKey: "postcards.space.title",
      descriptionKey: "postcards.space.description",
      stamp: "🚀",
    },
  },
  tools: {
    name: "Tools",
    gradient: ["#f8fafc", "#f1f5f9"],
    accent: "#475569",
    icon: "Wrench",
    postcard: {
      titleKey: "postcards.tools.title",
      descriptionKey: "postcards.tools.description",
      stamp: "🔧",
    },
  },
  countries: {
    name: "Countries",
    gradient: ["#dbeafe", "#bfdbfe"],
    accent: "#3b82f6",
    icon: "Globe",
    postcard: {
      titleKey: "postcards.countries.title",
      descriptionKey: "postcards.countries.description",
      stamp: "🌍",
    },
  },
  vehicles: {
    name: "Vehicles",
    gradient: ["#e2e8f0", "#cbd5e1"],
    accent: "#475569",
    icon: "Car",
    postcard: {
      titleKey: "postcards.vehicles.title",
      descriptionKey: "postcards.vehicles.description",
      stamp: "🚗",
    },
  },
  flowers: {
    name: "Flowers",
    gradient: ["#fce7f3", "#f9a8d4"],
    accent: "#ec4899",
    icon: "Flower",
    postcard: {
      titleKey: "postcards.flowers.title",
      descriptionKey: "postcards.flowers.description",
      stamp: "🌺",
    },
  },
  desserts: {
    name: "Desserts",
    gradient: ["#fef3c7", "#fcd34d"],
    accent: "#d97706",
    icon: "Cake",
    postcard: {
      titleKey: "postcards.desserts.title",
      descriptionKey: "postcards.desserts.description",
      stamp: "🍰",
    },
  },
  jobs: {
    name: "Jobs",
    gradient: ["#e0e7ff", "#a5b4fc"],
    accent: "#4f46e5",
    icon: "Briefcase",
    postcard: {
      titleKey: "postcards.jobs.title",
      descriptionKey: "postcards.jobs.description",
      stamp: "💼",
    },
  },
  furniture: {
    name: "Furniture",
    gradient: ["#fef3c7", "#d6b88e"],
    accent: "#92400e",
    icon: "Armchair",
    postcard: {
      titleKey: "postcards.furniture.title",
      descriptionKey: "postcards.furniture.description",
      stamp: "🛋️",
    },
  },
  drinks: {
    name: "Drinks",
    gradient: ["#d1fae5", "#6ee7b7"],
    accent: "#059669",
    icon: "Wine",
    postcard: {
      titleKey: "postcards.drinks.title",
      descriptionKey: "postcards.drinks.description",
      stamp: "🍹",
    },
  },
  gems: {
    name: "Gems",
    gradient: ["#f3e8ff", "#c4b5fd"],
    accent: "#7c3aed",
    icon: "Gem",
    postcard: {
      titleKey: "postcards.gems.title",
      descriptionKey: "postcards.gems.description",
      stamp: "💎",
    },
  },
  dance: {
    name: "Dance",
    gradient: ["#ffe4e6", "#fda4af"],
    accent: "#e11d48",
    icon: "PartyPopper",
    postcard: {
      titleKey: "postcards.dance.title",
      descriptionKey: "postcards.dance.description",
      stamp: "💃",
    },
  },
  trees: {
    name: "Trees",
    gradient: ["#d1fae5", "#86efac"],
    accent: "#16a34a",
    icon: "TreePine",
    postcard: {
      titleKey: "postcards.trees.title",
      descriptionKey: "postcards.trees.description",
      stamp: "🌲",
    },
  },
  reptiles: {
    name: "Reptiles",
    gradient: ["#ecfccb", "#bef264"],
    accent: "#65a30d",
    icon: "Turtle",
    postcard: {
      titleKey: "postcards.reptiles.title",
      descriptionKey: "postcards.reptiles.description",
      stamp: "🦎",
    },
  },
  seasons: {
    name: "Seasons",
    gradient: ["#f0f9ff", "#bae6fd"],
    accent: "#0284c7",
    icon: "Calendar",
    postcard: {
      titleKey: "postcards.seasons.title",
      descriptionKey: "postcards.seasons.description",
      stamp: "🍂",
    },
  },
  cinema: {
    name: "Cinema",
    gradient: ["#fef2f2", "#fecaca"],
    accent: "#dc2626",
    icon: "Clapperboard",
    postcard: {
      titleKey: "postcards.cinema.title",
      descriptionKey: "postcards.cinema.description",
      stamp: "🎬",
    },
  },
  farm: {
    name: "Farm",
    gradient: ["#fefce8", "#fef08a"],
    accent: "#a16207",
    icon: "Tractor",
    postcard: {
      titleKey: "postcards.farm.title",
      descriptionKey: "postcards.farm.description",
      stamp: "🚜",
    },
  },
  toys: {
    name: "Toys",
    gradient: ["#fdf4ff", "#f5d0fe"],
    accent: "#c026d3",
    icon: "Blocks",
    postcard: {
      titleKey: "postcards.toys.title",
      descriptionKey: "postcards.toys.description",
      stamp: "🧸",
    },
  },
  spices: {
    name: "Spices",
    gradient: ["#fff7ed", "#fed7aa"],
    accent: "#c2410c",
    icon: "Flame",
    postcard: {
      titleKey: "postcards.spices.title",
      descriptionKey: "postcards.spices.description",
      stamp: "🌶️",
    },
  },
  metals: {
    name: "Metals",
    gradient: ["#f4f4f5", "#d4d4d8"],
    accent: "#52525b",
    icon: "Cog",
    postcard: {
      titleKey: "postcards.metals.title",
      descriptionKey: "postcards.metals.description",
      stamp: "⚙️",
    },
  },
  accessories: {
    name: "Accessories",
    gradient: ["#fdf2f8", "#fbcfe8"],
    accent: "#be185d",
    icon: "Watch",
    postcard: {
      titleKey: "postcards.accessories.title",
      descriptionKey: "postcards.accessories.description",
      stamp: "⌚",
    },
  },
  shapes: {
    name: "Shapes",
    gradient: ["#eff6ff", "#bfdbfe"],
    accent: "#2563eb",
    icon: "Shapes",
    postcard: {
      titleKey: "postcards.shapes.title",
      descriptionKey: "postcards.shapes.description",
      stamp: "🔷",
    },
  },
  feelings: {
    name: "Feelings",
    gradient: ["#fff1f2", "#fecdd3"],
    accent: "#be123c",
    icon: "HeartHandshake",
    postcard: {
      titleKey: "postcards.feelings.title",
      descriptionKey: "postcards.feelings.description",
      stamp: "💭",
    },
  },
  water: {
    name: "Water",
    gradient: ["#ecfeff", "#a5f3fc"],
    accent: "#0891b2",
    icon: "Droplet",
    postcard: {
      titleKey: "postcards.water.title",
      descriptionKey: "postcards.water.description",
      stamp: "💧",
    },
  },
  mountains: {
    name: "Mountains",
    gradient: ["#e4e4e7", "#a1a1aa"],
    accent: "#52525b",
    icon: "Mountain",
    postcard: {
      titleKey: "postcards.mountains.title",
      descriptionKey: "postcards.mountains.description",
      stamp: "🏔️",
    },
  },
  seafood: {
    name: "Seafood",
    gradient: ["#fef3c7", "#fde68a"],
    accent: "#d97706",
    icon: "Fish",
    postcard: {
      titleKey: "postcards.seafood.title",
      descriptionKey: "postcards.seafood.description",
      stamp: "🦐",
    },
  },
  camping: {
    name: "Camping",
    gradient: ["#dcfce7", "#86efac"],
    accent: "#15803d",
    icon: "Tent",
    postcard: {
      titleKey: "postcards.camping.title",
      descriptionKey: "postcards.camping.description",
      stamp: "⛺",
    },
  },
  circus: {
    name: "Circus",
    gradient: ["#fee2e2", "#fca5a5"],
    accent: "#dc2626",
    icon: "FerrisWheel",
    postcard: {
      titleKey: "postcards.circus.title",
      descriptionKey: "postcards.circus.description",
      stamp: "🎪",
    },
  },
  pirates: {
    name: "Pirates",
    gradient: ["#fef9c3", "#fde047"],
    accent: "#854d0e",
    icon: "Skull",
    postcard: {
      titleKey: "postcards.pirates.title",
      descriptionKey: "postcards.pirates.description",
      stamp: "🏴‍☠️",
    },
  },
  castle: {
    name: "Castle",
    gradient: ["#e0e7ff", "#a5b4fc"],
    accent: "#4338ca",
    icon: "Castle",
    postcard: {
      titleKey: "postcards.castle.title",
      descriptionKey: "postcards.castle.description",
      stamp: "🏰",
    },
  },
  jungle: {
    name: "Jungle",
    gradient: ["#d1fae5", "#6ee7b7"],
    accent: "#047857",
    icon: "TreePalm",
    postcard: {
      titleKey: "postcards.jungle.title",
      descriptionKey: "postcards.jungle.description",
      stamp: "🌴",
    },
  },
  desert: {
    name: "Desert",
    gradient: ["#fef3c7", "#fcd34d"],
    accent: "#b45309",
    icon: "Sun",
    postcard: {
      titleKey: "postcards.desert.title",
      descriptionKey: "postcards.desert.description",
      stamp: "🏜️",
    },
  },
  arctic: {
    name: "Arctic",
    gradient: ["#f0f9ff", "#e0f2fe"],
    accent: "#0369a1",
    icon: "Snowflake",
    postcard: {
      titleKey: "postcards.arctic.title",
      descriptionKey: "postcards.arctic.description",
      stamp: "❄️",
    },
  },
  carnival: {
    name: "Carnival",
    gradient: ["#fdf4ff", "#e879f9"],
    accent: "#a21caf",
    icon: "Sparkles",
    postcard: {
      titleKey: "postcards.carnival.title",
      descriptionKey: "postcards.carnival.description",
      stamp: "🎭",
    },
  },
} as const satisfies Record<string, ThemeConfig>;

export type ThemeId = keyof typeof THEMES;

export const FOUND_WORD_COLORS = [
  "#14b8a6",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#10b981",
  "#f97316",
  "#6366f1",
  "#eab308",
];

export const DEFAULT_THEME: ThemeId = "animals";
export const DEFAULT_LEVEL = 1;
