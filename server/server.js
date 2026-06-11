require("dotenv").config(); // This loads your .env file
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg"); // The Postgres connection tool

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for most cloud databases
  },
});

// Test the connection when the server starts
pool.connect((err, client, release) => {
  if (err) {
    return console.error("Error acquiring client", err.stack);
  }
  console.log("✅ Connected to PostgreSQL database successfully!");
  release();
});

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
// 1. Get current data from PostgreSQL
app.get('/api/dashboard', async (req, res) => {
  try {
    // Fetch the first user (id = 1)
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [1]);
    const user = userResult.rows[0];

    // Fetch their habits
    const habitsResult = await pool.query('SELECT * FROM habits WHERE user_id = $1 ORDER BY id ASC', [1]);
    const habits = habitsResult.rows;

    // Fetch their inventory and map it into a simple array of item_ids
    const inventoryResult = await pool.query('SELECT item_id FROM inventory WHERE user_id = $1', [1]);
    const inventory = inventoryResult.rows.map(row => row.item_id);

    // Format the data to look exactly how our React frontend expects it
    const formattedUser = {
      id: user.id,
      username: user.username,
      gems: user.gems,
      inventory: inventory
    };

    res.json({ user: formattedUser, habits: habits, cosmetics: COSMETIC_POOL });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error fetching dashboard" });
  }
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
