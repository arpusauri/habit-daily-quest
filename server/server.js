require("dotenv").config(); // This loads your .env file
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg"); // The Postgres connection tool

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      "http://localhost:5173", // Untuk testing di komputer lokal
      "http://localhost:3000", // Barangkali lokalmu pakai port 3000
      "https://habit-daily-quest.vercel.app", // URL Live Vercel milikmu
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
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

// 1. Get current data from PostgreSQL with Auto-Daily-Reset
// 1. GET DASHBOARD DATA (With Bulletproof Sleep-Proof Daily Reset)
app.get('/api/dashboard', async (req, res) => {
  try {
    const userId = 1; // Hardcoded user for now

    // 1. Fetch user data from Neon
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = userResult.rows[0];

    // 2. Get today's date string (YYYY-MM-DD) based on server time
    const todayStr = new Date().toISOString().split('T')[0];

    // 3. CHECK IF WE NEED TO RESET: Has the date changed since the last reset?
    if (user.last_reset !== todayStr) {
      console.log(`[RESET] New day detected! Resetting quests for user ${userId}.`);
      
      // A. Set all habits back to uncompleted for this user
      await pool.query('UPDATE habits SET is_completed = false WHERE user_id = $1', [userId]);
      
      // B. CRITICAL STEP: Update the user's last_reset date to TODAY so this doesn't run again on refresh!
      await pool.query('UPDATE users SET last_reset = $1 WHERE id = $2', [todayStr, userId]);
      
      // C. Update our local variable so the response has the correct date
      user.last_reset = todayStr;
    }

    // 4. Fetch the habits and inventory
    const habitsResult = await pool.query('SELECT * FROM habits WHERE user_id = $1 ORDER BY id ASC', [userId]);
    const inventoryResult = await pool.query('SELECT item_id FROM inventory WHERE user_id = $1', [userId]);
    const inventory = inventoryResult.rows.map(row => row.item_id);

    // 5. Send everything back to React
    res.json({
      user: {
        id: user.id,
        username: user.username,
        gems: user.gems,
        level: user.level,
        exp: user.exp,
        equipped_border: user.equipped_border,
        equipped_font: user.equipped_font,
        equipped_theme: user.equipped_theme,
        inventory: inventory
      },
      habits: habitsResult.rows
    });

  } catch (err) {
    console.error("Dashboard error:", err.message);
    res.status(500).json({ error: "Server error loading dashboard" });
  }
});

// 2. Complete a habit and earn gems (Database Version)
// 2. Complete a habit and earn gems + EXP (Database Version)
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
    
    // --- LEVEL UP LOGIC ---
    // 1. Get current user stats
    const userCheck = await pool.query('SELECT gems, level, exp FROM users WHERE id = $1', [userId]);
    let { gems, level, exp } = userCheck.rows[0];

    // 2. Add rewards
    gems += 30;
    exp += 50;

    // 3. Check for Level Up! (Let's say it takes 100 EXP to level up)
    const EXP_NEEDED = 100;
    while (exp >= EXP_NEEDED) {
      level += 1;
      exp -= EXP_NEEDED; // Carry over leftover EXP
    }

    // 4. Save new stats to the database
    await pool.query(
      'UPDATE users SET gems = $1, level = $2, exp = $3 WHERE id = $4',
      [gems, level, exp, userId]
    );
    // ----------------------

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

// 4. CREATE A NEW HABIT (Database Version)
app.post('/api/habits', async (req, res) => {
  try {
    const { name } = req.body;
    const userId = 1; // Hardcoding user 1 for now

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Habit name cannot be empty!" });
    }

    // Insert the new habit into the database
    // Defaulting is_completed to false and streak to 0
    await pool.query(
      'INSERT INTO habits (user_id, name, is_completed, streak) VALUES ($1, $2, false, 0)',
      [userId, name.trim()]
    );

    // Fetch the updated habits list to send back to React so it refreshes instantly
    const updatedHabits = await pool.query(
      'SELECT * FROM habits WHERE user_id = $1 ORDER BY id ASC', 
      [userId]
    );

    res.json({ habits: updatedHabits.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error creating habit" });
  }
});

// 5. EQUIP A COSMETIC ITEM
app.post('/api/gacha/equip', async (req, res) => {
  try {
    const { itemId } = req.body;
    const userId = 1;

    // 1. Double check they actually own this item
    const checkOwn = await pool.query('SELECT * FROM inventory WHERE user_id = $1 AND item_id = $2', [userId, itemId]);
    if (checkOwn.rows.length === 0) {
      return res.status(400).json({ error: "You don't own this item yet!" });
    }

    // 2. Determine which slot it goes into based on its ID prefix
    let columnToUpdate = '';
    if (itemId.startsWith('r_blue')) columnToUpdate = 'equipped_border';
    else if (itemId.startsWith('r_pink')) columnToUpdate = 'equipped_font';
    else if (itemId.startsWith('sr_dark')) columnToUpdate = 'equipped_theme';
    else if (itemId.startsWith('sr_gold')) columnToUpdate = 'equipped_font'; // Username tags fall under font styling
    else if (itemId.startsWith('ssr_matrix')) columnToUpdate = 'equipped_theme';

    // 3. Update that specific slot in the database
    if (columnToUpdate) {
      await pool.query(`UPDATE users SET ${columnToUpdate} = $1 WHERE id = $2`, [itemId, userId]);
    }

    // 4. Fetch updated user state to send back to React
    const updatedUser = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const inventoryResult = await pool.query('SELECT item_id FROM inventory WHERE user_id = $1', [userId]);

    // Format including the new equipped slots
    const formattedUser = {
      id: updatedUser.rows[0].id,
      username: updatedUser.rows[0].username,
      gems: updatedUser.rows[0].gems,
      equipped_border: updatedUser.rows[0].equipped_border,
      equipped_font: updatedUser.rows[0].equipped_font,
      equipped_theme: updatedUser.rows[0].equipped_theme,
      inventory: inventoryResult.rows.map(row => row.item_id)
    };

    res.json({ user: formattedUser });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error equipping item" });
  }
});

// 6. DELETE A HABIT
app.delete('/api/habits/:id', async (req, res) => {
  try {
    const habitId = parseInt(req.params.id);
    const userId = 1; // Hardcoded for now

    // Delete the habit from the database
    await pool.query('DELETE FROM habits WHERE id = $1 AND user_id = $2', [habitId, userId]);

    // Fetch the updated habits list to send back to React
    const updatedHabits = await pool.query(
      'SELECT * FROM habits WHERE user_id = $1 ORDER BY id ASC', 
      [userId]
    );

    res.json({ habits: updatedHabits.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error deleting habit" });
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
