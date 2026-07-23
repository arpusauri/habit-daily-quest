require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const { createClient } = require("@supabase/supabase-js"); // 1. Import Supabase SDK

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// 1. MIDDLEWARE CONFIGURATION
// ==========================================
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "https://gambit.arpusauri.my.id",
  "https://habit-daily-quest.vercel.app",
  "https://habit-daily-api.bonto.run",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Izinkan request tanpa origin (seperti Postman, Curl, atau server-to-server)
    if (!origin) return callback(null, true);

    // Cek apakah origin ada di daftar allowedOrigins
    if (
      allowedOrigins.indexOf(origin) !== -1 ||
      origin.endsWith(".arpusauri.my.id")
    ) {
      callback(null, true);
    } else {
      callback(new Error("CORS Policy: Origin ini tidak diizinkan."));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ], // 👈 Wajib untuk token Supabase!
  credentials: true,
  optionsSuccessStatus: 200, // Mencegah issue di beberapa proxy/browser lama yang choke di 204
};

// Pasang middleware CORS
app.use(cors(corsOptions));

app.use(express.json());

// ==========================================
// 2. DATABASE & SUPABASE AUTH CONFIGURATION
// ==========================================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Ambil token dengan fallback (jika pakai awalan VITE_ tetap terbaca)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Validasi manual sebelum crash agar ketahuan jika kosong
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "❌ ERROR: Supabase URL atau Anon Key tidak ditemukan di file .env!",
  );
  process.exit(1);
}

// Inisialisasi Klien Supabase Auth
const supabase = createClient(supabaseUrl, supabaseAnonKey);

pool.connect((err, client, release) => {
  if (err) {
    return console.error("❌ Error acquiring client", err.stack);
  }
  console.log("✅ Connected to PostgreSQL database successfully!");
  release();
});

// ==========================================
// 3. AUTHENTICATION MIDDLEWARE (Kunci Pengaman)
// ==========================================
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Akses ditolak. Token tidak ditemukan." });
    }

    const token = authHeader.split(" ")[1];

    // Verifikasi token langsung ke Supabase Auth
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res
        .status(401)
        .json({ error: "Sesi kedaluwarsa atau token tidak valid." });
    }

    // Cari ID integer user berdasarkan UUID Supabase Auth
    const dbUser = await pool.query(
      "SELECT id FROM users WHERE supabase_uid = $1",
      [user.id],
    );

    if (dbUser.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Profil pemain tidak ditemukan di database game." });
    }

    // Mengikat ID asli database ke request agar bisa dipakai oleh endpoint di bawahnya
    req.userId = dbUser.rows[0].id;
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    res.status(500).json({ error: "Sistem otentikasi internal error." });
  }
};

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
// 4. AUTH ROUTES (Register & Login)
// ==========================================

// [POST] Register Akun Baru
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, username } = req.body;
    if (!email || !password || !username) {
      return res
        .status(400)
        .json({ error: "Email, password, dan username wajib diisi!" });
    }

    // 1. Daftarkan akun kredensial ke sistem Supabase Auth
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return res.status(400).json({ error: error.message });
    if (!data.user)
      return res.status(400).json({ error: "Registrasi gagal dilakukan." });

    // 2. Masukkan profil ke tabel game umum kita menggunakan UUID jembatan
    await pool.query(
      `INSERT INTO "users" (username, gems, level, exp, supabase_uid) 
       VALUES ($1, 1000, 1, 0, $2)`,
      [username.trim(), data.user.id],
    );

    res.status(201).json({
      message:
        "Registrasi berhasil! Silakan cek email untuk verifikasi jika diaktifkan.",
      session: data.session,
    });
  } catch (err) {
    console.error("Register Error:", err.message);
    res.status(500).json({ error: "Server error saat mendaftarkan user." });
  }
});

// [POST] Login Akun
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email dan password wajib diisi!" });
    }

    // Login ke Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return res.status(400).json({ error: error.message });

    res.json({
      message: "Login sukses!",
      session: data.session, // Kirim data session (mengandung access_token) ke frontend
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ error: "Server error saat login." });
  }
});

// ==========================================
// 5. SECURE GAME ROUTES (Diproteksi Token)
// ==========================================

// [GET] Dashboard Data (Diubah dari ID=1 ke Dinamis req.userId)
app.get("/api/dashboard", authenticateUser, async (req, res) => {
  try {
    const userId = req.userId; // Dapatkan ID dari middleware aman

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

// [POST] Complete a habit (Dengan Diminishing Returns & Heatmap Tracker)
app.post("/api/habits/:id/complete", authenticateUser, async (req, res) => {
  try {
    const habitId = parseInt(req.params.id);
    const userId = req.userId;

    const habitCheck = await pool.query(
      "SELECT * FROM habits WHERE id = $1 AND user_id = $2",
      [habitId, userId],
    );
    if (habitCheck.rows.length === 0)
      return res.status(404).json({ error: "Habit not found" });
    if (habitCheck.rows[0].is_completed)
      return res.status(400).json({ error: "Habit already completed today!" });

    // 1. Cek berapa banyak quest yang SUDAH selesai hari ini untuk menentukan Diminishing Returns
    const completedTodayResult = await pool.query(
      "SELECT COUNT(*) FROM habits WHERE user_id = $1 AND is_completed = true",
      [userId],
    );
    const completedToday = parseInt(completedTodayResult.rows[0].count);

    // 2. Hitung EXP & Gems berdasarkan tier Diminishing Returns
    let earnedExp = 50;
    let earnedGems = 30;

    if (completedToday >= 10) {
      earnedExp = 5; // Tier 10%
      earnedGems = 3;
    } else if (completedToday >= 5) {
      earnedExp = 25; // Tier 50%
      earnedGems = 15;
    }

    // 3. Tandai quest selesai & tambah streak
    await pool.query(
      "UPDATE habits SET is_completed = true, streak = streak + 1 WHERE id = $1",
      [habitId],
    );

    // 🔥 3.5 UPSERT DATA KE DAILY_ACTIVITY (UNTUK HEATMAP) 🔥
    await pool.query(
      `INSERT INTO daily_activity (user_id, activity_date, completed_count)
       VALUES ($1, CURRENT_DATE, 1)
       ON CONFLICT (user_id, activity_date)
       DO UPDATE SET completed_count = daily_activity.completed_count + 1`,
      [userId],
    );

    // 4. Update data User (Gems, EXP, Level Up)
    const userCheck = await pool.query(
      "SELECT gems, level, exp FROM users WHERE id = $1",
      [userId],
    );
    let { gems, level, exp } = userCheck.rows[0];

    gems += earnedGems;
    exp += earnedExp;

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

    // Kirim juga info berapa EXP & Gems yang baru saja didapatkan
    res.json({
      user: formattedUser,
      habits: updatedHabits.rows,
      rewardInfo: {
        earnedExp,
        earnedGems,
        tier:
          completedToday >= 10 ? "10%" : completedToday >= 5 ? "50%" : "100%",
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// [GET] Ambil Histori Aktivitas untuk Heatmap
app.get("/api/activity-history", authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT TO_CHAR(activity_date, 'YYYY-MM-DD') AS date, completed_count
       FROM daily_activity
       WHERE user_id = $1
       ORDER BY activity_date ASC`,
      [userId],
    );

    // Format output sesuai kebutuhan react-activity-calendar
    const formattedData = result.rows.map((row) => {
      const count = parseInt(row.completed_count);
      let level = 0;
      if (count >= 10) level = 4;
      else if (count >= 5) level = 3;
      else if (count >= 3) level = 2;
      else if (count >= 1) level = 1;

      return {
        date: row.date,
        count: count,
        level: level,
      };
    });

    res.json(formattedData);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// [GET] Leaderboard Top Level
app.get("/api/leaderboard/level", authenticateUser, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, level, exp, equipped_border, equipped_font 
       FROM users 
       ORDER BY level DESC, exp DESC 
       LIMIT 10`,
    );
    res.json({ leaderboard: result.rows });
  } catch (err) {
    console.error("Leaderboard Level Error:", err.message);
    res.status(500).json({ error: "Gagal mengambil data Leaderboard Level" });
  }
});

// [GET] Leaderboard Top Streak (Mengambil Streak tertinggi dari habit pemain)
app.get("/api/leaderboard/streak", authenticateUser, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.level, COALESCE(MAX(h.streak), 0) AS max_streak, u.equipped_border, u.equipped_font 
       FROM users u
       LEFT JOIN habits h ON u.id = h.user_id
       GROUP BY u.id
       ORDER BY max_streak DESC, u.level DESC
       LIMIT 10`,
    );
    res.json({ leaderboard: result.rows });
  } catch (err) {
    console.error("Leaderboard Streak Error:", err.message);
    res.status(500).json({ error: "Gagal mengambil data Leaderboard Streak" });
  }
});

// [POST] Create a new habit
app.post("/api/habits", authenticateUser, async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.userId;

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
app.post("/api/gacha/equip", authenticateUser, async (req, res) => {
  try {
    const { itemId } = req.body;
    const userId = req.userId;

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
app.delete("/api/habits/:id", authenticateUser, async (req, res) => {
  try {
    const habitId = parseInt(req.params.id);
    const userId = req.userId;

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
app.post("/api/gacha/pull", authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;

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
// 6. SERVER INITIALIZATION
// ==========================================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});
