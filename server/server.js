const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Mock Database
let userProfile = {
  username: "GachaMaster",
  gems: 0,
  inventory: [], // Track unlocked item IDs here
};

let habits = [
  { id: 1, name: "Write 50 words in Diary", isCompleted: false, streak: 0 },
  { id: 2, name: "Read for 15 minutes", isCompleted: false, streak: 0 },
];

// The Gacha Pool (Cosmetics)
const COSMETIC_POOL = [
  { id: "r_blue", name: "🔵 Cyan Border", rarity: "R", chance: 0.7 },
  { id: "r_pink", name: "🌸 Pink Text Font", rarity: "R", chance: 0.7 },
  {
    id: "sr_dark",
    name: "🌙 Obsidian Dark Mode Theme",
    rarity: "SR",
    chance: 0.25,
  },
  { id: "sr_gold", name: "👑 Golden Name Tag", rarity: "SR", chance: 0.25 },
  {
    id: "ssr_matrix",
    name: "👾 Animated Cyberpunk Matrix BG",
    rarity: "SSR",
    chance: 0.05,
  },
];

// 1. Get current data (Updated to include inventory)
app.get("/api/dashboard", (req, res) => {
  res.json({ user: userProfile, habits: habits, cosmetics: COSMETIC_POOL });
});

// 2. Complete a habit and earn gems
app.post("/api/habits/:id/complete", (req, res) => {
  const habitId = parseInt(req.params.id);
  const habit = habits.find((h) => h.id === habitId);

  if (!habit) return res.status(404).json({ error: "Habit not found" });

  if (!habit.isCompleted) {
    habit.isCompleted = true;
    habit.streak += 1;
    userProfile.gems += 30;
    res.json({ user: userProfile, habits: habits });
  } else {
    res.status(400).json({ error: "Habit already completed today!" });
  }
});

// 3. THE GACHA PULL ROUTE (Costs 50 Gems)
app.post("/api/gacha/pull", (req, res) => {
  if (userProfile.gems < 50) {
    return res
      .status(400)
      .json({ error: "Not enough gems! Go do your habits! 😤" });
  }

  // Deduct Currency
  userProfile.gems -= 50;

  // RNG Math Logic
  const roll = Math.random(); // Generates a number between 0.0 and 1.0
  let selectedRarity = "R";

  if (roll < 0.05) {
    selectedRarity = "SSR"; // 5% chance
  } else if (roll < 0.3) {
    selectedRarity = "SR"; // 25% chance (0.05 + 0.25)
  } else {
    selectedRarity = "R"; // 70% chance
  }

  // Filter pool to items matching the rolled rarity, then pick a random one
  const availableItems = COSMETIC_POOL.filter(
    (item) => item.rarity === selectedRarity,
  );
  const pulledItem =
    availableItems[Math.floor(Math.random() * availableItems.length)];

  // Add to inventory if they don't already have it
  if (!userProfile.inventory.includes(pulledItem.id)) {
    userProfile.inventory.push(pulledItem.id);
  }

  res.json({
    user: userProfile,
    pulledItem: pulledItem,
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
