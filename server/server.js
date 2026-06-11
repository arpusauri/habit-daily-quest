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

// 2. Complete a habit and earn gems (Database Version)
app.post('/api/habits/:id/complete', async (req, res) => {
  try {
    const habitId = parseInt(req.params.id);
    const userId = 1; // Hardcoding user 1 for now

    // Check if habit is already completed
    const habitCheck = await pool.query('SELECT * FROM habits WHERE id = $1', [habitId]);
    if (habitCheck.rows.length === 0) return res.status(404).json({ error: "Habit not found" });
    if (habitCheck.rows[0].is_completed) return res.status(400).json({ error: "Habit already completed today!" });

    // Mark habit complete and increase streak
    await pool.query('UPDATE habits SET is_completed = true, streak = streak + 1 WHERE id = $1', [habitId]);
    
    // Add 30 gems to user
    await pool.query('UPDATE users SET gems = gems + 30 WHERE id = $1', [userId]);

    // Fetch the updated data to send back to React
    const updatedUser = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const updatedHabits = await pool.query('SELECT * FROM habits WHERE user_id = $1 ORDER BY id ASC', [userId]);
    const inventoryResult = await pool.query('SELECT item_id FROM inventory WHERE user_id = $1', [userId]);

    const formattedUser = {
      ...updatedUser.rows[0],
      inventory: inventoryResult.rows.map(row => row.item_id)
    };

    res.json({ user: formattedUser, habits: updatedHabits.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// 3. THE GACHA PULL ROUTE (Database Version)
app.post('/api/gacha/pull', async (req, res) => {
  try {
    const userId = 1;

    // Check if user has enough gems
    const userCheck = await pool.query('SELECT gems FROM users WHERE id = $1', [userId]);
    if (userCheck.rows[0].gems < 50) {
      return res.status(400).json({ error: "Not enough gems! Go do your habits! 😤" });
    }

    // Deduct 50 gems
    await pool.query('UPDATE users SET gems = gems - 50 WHERE id = $1', [userId]);

    // RNG Math Logic
    const roll = Math.random();
    let selectedRarity = 'R';
    if (roll < 0.05) selectedRarity = 'SSR';
    else if (roll < 0.30) selectedRarity = 'SR';

    const availableItems = COSMETIC_POOL.filter(item => item.rarity === selectedRarity);
    const pulledItem = availableItems[Math.floor(Math.random() * availableItems.length)];

    // Check if they already own it; if not, add to inventory table
    const invCheck = await pool.query('SELECT * FROM inventory WHERE user_id = $1 AND item_id = $2', [userId, pulledItem.id]);
    if (invCheck.rows.length === 0) {
      await pool.query('INSERT INTO inventory (user_id, item_id) VALUES ($1, $2)', [userId, pulledItem.id]);
    }

    // Fetch updated user data to send back
    const updatedUser = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const inventoryResult = await pool.query('SELECT item_id FROM inventory WHERE user_id = $1', [userId]);

    const formattedUser = {
      ...updatedUser.rows[0],
      inventory: inventoryResult.rows.map(row => row.item_id)
    };

    res.json({ user: formattedUser, pulledItem: pulledItem });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
