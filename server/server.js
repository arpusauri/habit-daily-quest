require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// 1. MIDDLEWARE CONFIGURATION
// ==========================================

// Trust the Back4App reverse proxy (crucial for secure cookies and headers)
app.set("trust proxy", 1); 

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://habit-daily-quest.vercel.app",
  "https://habit-daily-quest.vercel.app/" // Added trailing slash just in case
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman/cURL) or if it matches our list
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Explicitly handle pre-flight requests for all routes
// Explicitly handle pre-flight requests for all routes
app.options(/.*/, cors());
app.use(express.json());

// ==========================================
// 2. DATABASE CONFIGURATION & CONNECTION
// ==========================================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Test koneksi database saat server pertama kali menyala
pool.connect((err, client, release) => {
  if (err) {
    return console.error("❌ Error acquiring client", err.stack);
  }
  console.log("✅ Connected to PostgreSQL database successfully!");
  release();
});

// Gacha Pool Data (Cosmetics)
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

app.get("/", (req, res) => {
  res.status(200).json({ message: "🚀 Backend is alive and running!" });
});

// ==========================================
// 3. API ROUTES
// ==========================================

// [GET] Dashboard Data (With Daily Reset)
app.get("/api/dashboard", async (req, res) => {
  try {
    const userId = 1;

    const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = userResult.rows[0];
    const todayStr = new Date().toISOString().split("T")[0];

    if (user.last_reset !== todayStr) {
      console.log(
        `[RESET] New day detected! Resetting quests for user ${userId}.`,
      );
      await pool.query(
        "UPDATE habits SET is_completed = false WHERE user_id = $1",
        [userId],
      );
      await pool.query("UPDATE users SET last_reset = $1 WHERE id = $2", [
        todayStr,
        userId,
      ]);
      user.last_reset = todayStr;
    }

    const habitsResult = await pool.query(
      "SELECT * FROM habits WHERE user_id = $1 ORDER BY id ASC",
      [userId],
    );
    const inventoryResult = await pool.query(
      "SELECT item_id FROM inventory WHERE user_id = $1",
      [userId],
    );
    const inventory = inventoryResult.rows.map((row) => row.item_id);

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
        inventory: inventory,
      },
      habits: habitsResult.rows,
    });
  } catch (err) {
    console.error("Dashboard error:", err.message);
    res.status(500).json({ error: "Server error loading dashboard" });
  }
});

// [POST] Complete a habit (Earn gems + EXP & Level Up)
app.post("/api/habits/:id/complete", async (req, res) => {
  try {
    const habitId = parseInt(req.params.id);
    const userId = 1;

    const habitCheck = await pool.query("SELECT * FROM habits WHERE id = $1", [
      habitId,
    ]);
    if (habitCheck.rows.length === 0)
      return res.status(404).json({ error: "Habit not found" });
    if (habitCheck.rows[0].is_completed)
      return res.status(400).json({ error: "Habit already completed today!" });

    await pool.query(
      "UPDATE habits SET is_completed = true, streak = streak + 1 WHERE id = $1",
      [habitId],
    );

    const userCheck = await pool.query(
      "SELECT gems, level, exp FROM users WHERE id = $1",
      [userId],
    );
    let { gems, level, exp } = userCheck.rows[0];

    gems += 30;
    exp += 50;

    const EXP_NEEDED = 100;
    while (exp >= EXP_NEEDED) {
      level += 1;
      exp -= EXP_NEEDED;
    }

    await pool.query(
      "UPDATE users SET gems = $1, level = $2, exp = $3 WHERE id = $4",
      [gems, level, exp, userId],
    );

    const updatedUser = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    const updatedHabits = await pool.query(
      "SELECT * FROM habits WHERE user_id = $1 ORDER BY id ASC",
      [userId],
    );
    const inventoryResult = await pool.query(
      "SELECT item_id FROM inventory WHERE user_id = $1",
      [userId],
    );

    const formattedUser = {
      ...updatedUser.rows[0],
      inventory: inventoryResult.rows.map((row) => row.item_id),
    };

    res.json({ user: formattedUser, habits: updatedHabits.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// [POST] Create a new habit
app.post("/api/habits", async (req, res) => {
  try {
    const { name } = req.body;
    const userId = 1;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Habit name cannot be empty!" });
    }

    await pool.query(
      "INSERT INTO habits (user_id, name, is_completed, streak) VALUES ($1, $2, false, 0)",
      [userId, name.trim()],
    );
    const updatedHabits = await pool.query(
      "SELECT * FROM habits WHERE user_id = $1 ORDER BY id ASC",
      [userId],
    );

    res.json({ habits: updatedHabits.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error creating habit" });
  }
});

// [POST] Equip a cosmetic item
app.post("/api/gacha/equip", async (req, res) => {
  try {
    const { itemId } = req.body;
    const userId = 1;

    const checkOwn = await pool.query(
      "SELECT * FROM inventory WHERE user_id = $1 AND item_id = $2",
      [userId, itemId],
    );
    if (checkOwn.rows.length === 0) {
      return res.status(400).json({ error: "You don't own this item yet!" });
    }

    let columnToUpdate = "";
    if (itemId.startsWith("r_blue")) columnToUpdate = "equipped_border";
    else if (itemId.startsWith("r_pink")) columnToUpdate = "equipped_font";
    else if (itemId.startsWith("sr_dark")) columnToUpdate = "equipped_theme";
    else if (itemId.startsWith("sr_gold")) columnToUpdate = "equipped_font";
    else if (itemId.startsWith("ssr_matrix")) columnToUpdate = "equipped_theme";

    if (columnToUpdate) {
      await pool.query(
        `UPDATE users SET ${columnToUpdate} = $1 WHERE id = $2`,
        [itemId, userId],
      );
    }

    const updatedUser = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    const inventoryResult = await pool.query(
      "SELECT item_id FROM inventory WHERE user_id = $1",
      [userId],
    );

    const formattedUser = {
      id: updatedUser.rows[0].id,
      username: updatedUser.rows[0].username,
      gems: updatedUser.rows[0].gems,
      equipped_border: updatedUser.rows[0].equipped_border,
      equipped_font: updatedUser.rows[0].equipped_font,
      equipped_theme: updatedUser.rows[0].equipped_theme,
      inventory: inventoryResult.rows.map((row) => row.item_id),
    };

    res.json({ user: formattedUser });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error equipping item" });
  }
});

// [DELETE] Delete a habit
app.delete("/api/habits/:id", async (req, res) => {
  try {
    const habitId = parseInt(req.params.id);
    const userId = 1;

    await pool.query("DELETE FROM habits WHERE id = $1 AND user_id = $2", [
      habitId,
      userId,
    ]);
    const updatedHabits = await pool.query(
      "SELECT * FROM habits WHERE user_id = $1 ORDER BY id ASC",
      [userId],
    );

    res.json({ habits: updatedHabits.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error deleting habit" });
  }
});

// [POST] Gacha Pull Route
app.post("/api/gacha/pull", async (req, res) => {
  try {
    const userId = 1;

    const userCheck = await pool.query("SELECT gems FROM users WHERE id = $1", [
      userId,
    ]);
    if (userCheck.rows[0].gems < 50) {
      return res
        .status(400)
        .json({ error: "Not enough gems! Go do your habits! 😤" });
    }

    await pool.query("UPDATE users SET gems = gems - 50 WHERE id = $1", [
      userId,
    ]);

    const roll = Math.random();
    let selectedRarity = "R";
    if (roll < 0.05) selectedRarity = "SSR";
    else if (roll < 0.3) selectedRarity = "SR";

    const availableItems = COSMETIC_POOL.filter(
      (item) => item.rarity === selectedRarity,
    );
    const pulledItem =
      availableItems[Math.floor(Math.random() * availableItems.length)];

    const invCheck = await pool.query(
      "SELECT * FROM inventory WHERE user_id = $1 AND item_id = $2",
      [userId, pulledItem.id],
    );
    if (invCheck.rows.length === 0) {
      await pool.query(
        "INSERT INTO inventory (user_id, item_id) VALUES ($1, $2)",
        [userId, pulledItem.id],
      );
    }

    const updatedUser = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    const inventoryResult = await pool.query(
      "SELECT item_id FROM inventory WHERE user_id = $1",
      [userId],
    );

    const formattedUser = {
      ...updatedUser.rows[0],
      inventory: inventoryResult.rows.map((row) => row.item_id),
    };

    res.json({ user: formattedUser, pulledItem: pulledItem });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================================
// 4. SERVER INITIALIZATION 
// ==========================================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});
