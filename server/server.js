require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { Pool } = require("pg");
const { createClient } = require("@supabase/supabase-js"); // 1. Import Supabase SDK

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// RATE LIMITING CONFIGURATION
// ==========================================
const gachaLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 menit
  max: 50, // max 50 pulls per menit
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ error: "Terlalu banyak pull, coba lagi nanti" });
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5, // max 5 login attempts per 15 menit
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "Terlalu banyak percobaan login, coba lagi nanti",
    });
  },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 jam
  max: 3, // max 3 register attempts per jam
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "Terlalu banyak percobaan register, coba lagi nanti",
    });
  },
});

// ==========================================
// MIDDLEWARE CONFIGURATION
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

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validasi
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "❌ ERROR: Supabase URL atau Anon Key tidak ditemukan di file .env!",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey); 

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

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res
        .status(401)
        .json({ error: "Sesi kedaluwarsa atau token tidak valid." });
    }

    const dbUser = await pool.query(
      "SELECT id FROM users WHERE supabase_uid = $1",
      [user.id],
    );

    if (dbUser.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Profil pemain tidak ditemukan di database game." });
    }

    req.userId = dbUser.rows[0].id;
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    res.status(500).json({ error: "Sistem otentikasi internal error." });
  }
};

// ==========================================
// LIMITED BANNER ROUTES
// ==========================================

// ======== GET ACTIVE LIMITED BANNER ========
app.get("/api/banner/limited-status", async (req, res) => {
  try {
    const now = new Date();

    // Cari banner yang sedang aktif
    const result = await pool.query(
      `SELECT * FROM limited_banners 
       WHERE is_active = true 
       AND start_date <= $1 
       AND end_date > $1
       ORDER BY start_date DESC 
       LIMIT 1`,
      [now],
    );

    if (result.rows.length === 0) {
      return res.json({
        isActive: false,
        currentBanner: null,
        nextBanner: null,
        message: "Tidak ada limited banner yang aktif saat ini",
      });
    }

    const banner = result.rows[0];
    const timeRemaining = new Date(banner.end_date) - now;
    const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
    const hoursRemaining = Math.ceil((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    // Cari banner berikutnya
    const nextResult = await pool.query(
      `SELECT * FROM limited_banners 
       WHERE is_active = true 
       AND start_date > $1
       ORDER BY start_date ASC 
       LIMIT 1`,
      [now],
    );

    const nextBanner = nextResult.rows[0] || null;

    res.json({
      isActive: true,
      currentBanner: {
        id: banner.id,
        name: banner.name,
        rateUpItem: banner.rate_up_item_id,
        startDate: banner.start_date,
        endDate: banner.end_date,
        daysRemaining,
        hoursRemaining,
        timeRemaining,
      },
      nextBanner: nextBanner ? {
        id: nextBanner.id,
        name: nextBanner.name,
        startDate: nextBanner.start_date,
      } : null,
    });
  } catch (err) {
    console.error("Banner status error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ======== CREATE NEW LIMITED BANNER (ADMIN) ========
app.post("/api/admin/banner/create", authenticateUser, async (req, res) => {
  try {
    const { name, rateUpItemId, startDate, durationDays } = req.body;

    // Optional: Validasi admin role (kalau ada)
    // const adminCheck = await pool.query(
    //   "SELECT role FROM users WHERE id = $1",
    //   [req.userId],
    // );
    // if (adminCheck.rows[0]?.role !== "admin") {
    //   return res.status(403).json({ error: "Unauthorized: Admin only" });
    // }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(startDateObj);
    endDateObj.setDate(endDateObj.getDate() + durationDays);

    const result = await pool.query(
      `INSERT INTO limited_banners (name, rate_up_item_id, start_date, end_date, is_active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING *`,
      [name, rateUpItemId, startDateObj, endDateObj],
    );

    res.json({
      message: "Banner created successfully",
      banner: result.rows[0],
    });
  } catch (err) {
    console.error("Create banner error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ======== LIST ALL BANNERS (ADMIN) ========
app.get("/api/admin/banners", authenticateUser, async (req, res) => {
  try {
    // Optional: Validasi admin role
    // const adminCheck = await pool.query(
    //   "SELECT role FROM users WHERE id = $1",
    //   [req.userId],
    // );
    // if (adminCheck.rows[0]?.role !== "admin") {
    //   return res.status(403).json({ error: "Unauthorized: Admin only" });
    // }

    const result = await pool.query(
      `SELECT * FROM limited_banners 
       ORDER BY start_date DESC`,
    );

    res.json(result.rows);
  } catch (err) {
    console.error("List banners error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
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
    limited: true,
  },
  {
    id: "ssr_starforge",
    name: "✨ Starforge Celestial Theme",
    rarity: "SSR",
  },
  {
    id: "ssr_notepad",
    name: "📝 Notepad Theme",
    rarity: "SSR",
  },
  // 🔥 SHOP-EXCLUSIVE (gak bisa didapet dari gacha)
  {
    id: "shop_aurora",
    name: "🌌 Aurora Dream Theme",
    rarity: "SR",
    shopOnly: true,
  },
  {
    id: "shop_crown",
    name: "💎 Diamond Crown Tag",
    rarity: "SSR",
    shopOnly: true,
  },
];

app.get("/", (req, res) => {
  res.status(200).json({ message: "🚀 Backend is alive and running!" });
});

// ==========================================
// 4. AUTH ROUTES (Register & Login)
// ==========================================

// [GET] Lookup email berdasarkan username (untuk login)
app.get("/api/auth/lookup-email", async (req, res) => {
  try {
    const { username } = req.query;
    
    if (!username || !username.trim()) {
      return res.status(400).json({ error: "Username wajib diisi!" });
    }
 
    const trimmedUsername = username.trim();
    
    // Ambil supabase_uid dari tabel users berdasarkan username
    const result = await pool.query(
      `SELECT supabase_uid FROM "users" WHERE username = $1 LIMIT 1`,
      [trimmedUsername],
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User tidak ditemukan." });
    }
    
    const supabaseUid = result.rows[0].supabase_uid;
    
    // Ambil email dari Supabase Auth pakai admin client (service role)
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(
      supabaseUid,
    );
    
    if (error || !data?.user?.email) {
      return res.status(404).json({ error: "User tidak ditemukan." });
    }
    
    res.json({ email: data.user.email });
  } catch (err) {
    console.error("Lookup Email Error:", err.message);
    res.status(500).json({ error: "Gagal mencari akun." });
  }
});

// [GET] Cek ketersediaan username secara real-time
app.get("/api/auth/check-username", async (req, res) => {
  try {
    const { username } = req.query;
    
    if (!username || !username.trim()) {
      return res.status(400).json({ error: "Username wajib diisi!" });
    }
 
    const trimmedUsername = username.trim();
 
    const result = await pool.query(
      `SELECT id FROM "users" WHERE username = $1 LIMIT 1`,
      [trimmedUsername],
    );
 
    const isAvailable = result.rows.length === 0;
 
    res.json({ available: isAvailable });
  } catch (err) {
    console.error("Check Username Error:", err.message);
    res.status(500).json({ error: "Gagal cek username." });
  }
});

// [POST] Register Akun Baru
app.post("/api/auth/register", registerLimiter, async (req, res) => {
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
    try {
      await pool.query(
        `INSERT INTO "users" (username, gems, level, exp, supabase_uid) 
         VALUES ($1, 1000, 1, 0, $2)`,
        [username.trim(), data.user.id],
      );
    } catch (dbErr) {
      // Rollback: hapus akun Auth yang udah terlanjur dibuat,
      // biar gak jadi orphaned account
      await supabaseAdmin.auth.admin.deleteUser(data.user.id).catch((e) =>
        console.error("Gagal rollback Auth user:", e.message),
      );

      if (dbErr.code === "23505") {
        // unique_violation — username udah dipakai
        return res.status(400).json({ error: "Username sudah dipakai!" });
      }

      throw dbErr; // lempar ke catch luar buat 500 generic
    }

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
app.post("/api/auth/login", authLimiter, async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res
        .status(400)
        .json({ error: "Email/Username dan password wajib diisi!" });
    }

    let email = identifier.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isEmail) {
      // Bukan format email → anggap username, resolve ke email asli
      const result = await pool.query(
        "SELECT supabase_uid FROM users WHERE username = $1",
        [email],
      );

      if (result.rows.length === 0 || !result.rows[0].supabase_uid) {
        return res
          .status(400)
          .json({ error: "Email/Username atau Password salah." });
      }

      const { data: adminData, error: adminError } =
        await supabaseAdmin.auth.admin.getUserById(
          result.rows[0].supabase_uid,
        );

      if (adminError || !adminData?.user?.email) {
        return res
          .status(400)
          .json({ error: "Email/Username atau Password salah." });
      }

      email = adminData.user.email;
    }

    // Login ke Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      return res
        .status(400)
        .json({ error: "Email/Username atau Password salah." });
    }

    res.json({
      message: "Login sukses!",
      session: data.session,
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ error: "Server error saat login." });
  }
});

// ==========================================
// 5. SECURE GAME ROUTES (Diproteksi Token)
// ==========================================

app.get("/api/dashboard", authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;

    const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = userResult.rows[0];
    const todayStr = new Date().toISOString().split("T")[0];

    if (user.last_login?.toISOString().split("T")[0] !== todayStr) {
      await pool.query(
        "UPDATE users SET last_login = CURRENT_DATE WHERE id = $1",
        [userId],
      );
      user.last_login = new Date(todayStr);
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

    // 🏆 Hitung leaderboard rank
    const leaderboardResult = await pool.query(
      `SELECT COUNT(*) as rank FROM users WHERE level > $1 OR (level = $1 AND exp > $2)`,
      [user.level, user.exp || 0],
    );
    const leaderboardRank = (leaderboardResult.rows[0].rank || 0) + 1;

    const totalPlayersResult = await pool.query(
      "SELECT COUNT(*) as total FROM users",
    );
    const totalPlayers = totalPlayersResult.rows[0].total || 0;

    // 📊 Hitung total pulls dari gacha_history
    const totalPullsResult = await pool.query(
      `SELECT COUNT(*) as total FROM gacha_history WHERE user_id = $1`,
      [userId],
    );
    const totalPulls = totalPullsResult.rows[0].total || 0;

    // 📊 Hitung active days dari daily_activity (sama kayak heatmap)
    const activityResult = await pool.query(
      `SELECT COUNT(*) as total FROM daily_activity 
   WHERE user_id = $1 AND completed_count > 0`,
      [userId],
    );
    const activeDays = activityResult.rows[0].total || 0;

    // 📊 Hitung total quests dari daily_activity (sama kayak heatmap)
    const totalQuestsResult = await pool.query(
      `SELECT SUM(completed_count) as total FROM daily_activity 
   WHERE user_id = $1`,
      [userId],
    );
    const totalQuestsCompleted = totalQuestsResult.rows[0].total || 0;

    const cosmeticsCountResult = await pool.query(
      `SELECT COUNT(*) as total FROM inventory WHERE user_id = $1`,
      [userId],
    );
    const cosmeticsCount = cosmeticsCountResult.rows[0].total || 0;

    res.json({
      user: {
        ...user,
        inventory: inventory,
        leaderboardRank,
        totalPlayers,
        totalPulls,
        totalQuestsCompleted,
        activeDays,
        cosmeticsCount,
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
      `UPDATE habits SET is_completed = true, completed_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND user_id = $2`,
      [habitId, userId],
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
      const count = parseInt(row.completed_count) || 0;
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
    else if (itemId === "ssr_starforge") columnToUpdate = "equipped_theme";
    else if (itemId === "shop_aurora") columnToUpdate = "equipped_theme";
    else if (itemId === "shop_crown") columnToUpdate = "equipped_font";
    else if (itemId === "ssr_notepad") columnToUpdate = "equipped_theme";

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

// [POST] Unequip a cosmetic item (balik ke default)
app.post("/api/gacha/unequip", authenticateUser, async (req, res) => {
  try {
    const { itemId } = req.body;
    const userId = req.userId;

    let columnToUpdate = "";
    if (itemId.startsWith("r_blue")) columnToUpdate = "equipped_border";
    else if (itemId.startsWith("r_pink")) columnToUpdate = "equipped_font";
    else if (itemId.startsWith("sr_dark")) columnToUpdate = "equipped_theme";
    else if (itemId.startsWith("sr_gold")) columnToUpdate = "equipped_font";
    else if (itemId.startsWith("ssr_matrix")) columnToUpdate = "equipped_theme";
    else if (itemId === "ssr_starforge") columnToUpdate = "equipped_theme";
    else if (itemId === "shop_aurora") columnToUpdate = "equipped_theme";
    else if (itemId === "shop_crown") columnToUpdate = "equipped_font";
    else if (itemId === "ssr_notepad") columnToUpdate = "equipped_theme";

    if (columnToUpdate) {
      await pool.query(
        `UPDATE users SET ${columnToUpdate} = NULL WHERE id = $1`,
        [userId],
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

    res.json({ user: formattedUser });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error unequipping item" });
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
// 🔥 Helper: logic inti gacha pull (dipakai gacha/pull DAN shop/buy-ticket)
const HARD_PITY = 20;

async function performGachaPull(userId, bannerType = "standard") {
  const pityCol = bannerType === "limited" ? "limited_pity" : "standard_pity";

  const userRow = await pool.query(
    `SELECT ${pityCol}, limited_guaranteed FROM users WHERE id = $1`,
    [userId],
  );
  let pity = userRow.rows[0][pityCol];
  let guaranteed = userRow.rows[0].limited_guaranteed;

  pity += 1;
  const isTopTier = pity >= HARD_PITY || Math.random() < 0.05;

  let pulledItem;
  let bannerResult = null; // 'limited_win' | 'limited_lose' | null
  let isPityReward = false;

  if (isTopTier) {
    pity = 0; // reset pity setiap kali SSR-tier kena

    if (bannerType === "limited") {
      const wasGuaranteed = guaranteed; // simpen dulu sebelum di-overwrite
      const winLimited = guaranteed || Math.random() < 0.5;

      if (winLimited) {
        pulledItem = COSMETIC_POOL.find((i) => i.id === "ssr_matrix");
        guaranteed = false;
        bannerResult = wasGuaranteed ? "limited_guaranteed" : "limited_win";
      } else {
        const ssrPool = COSMETIC_POOL.filter(
          (i) => i.rarity === "SSR" && !i.shopOnly && !i.limited,
        );
        pulledItem = ssrPool[Math.floor(Math.random() * ssrPool.length)];
        guaranteed = true;
        bannerResult = "limited_lose";
        isPityReward = true;
      }
    } else {
      // Standard banner: SSR asli (bukan lagi placeholder SR)
      const ssrPool = COSMETIC_POOL.filter(
        (i) => i.rarity === "SSR" && !i.shopOnly && !i.limited,
      );
      pulledItem = ssrPool[Math.floor(Math.random() * ssrPool.length)];
      isPityReward = true;
      // 🔧 FIX: bannerResult & guaranteed TIDAK diubah di sini,
      // karena "guaranteed" itu konsep khusus Limited banner
    }
  } else {
    // Roll normal antara R dan SR (dinormalisasi tanpa slot SSR-tier)
    const subRoll = Math.random();
    const rarity = subRoll < 0.7 / 0.95 ? "R" : "SR";
    const pool_ = COSMETIC_POOL.filter(
      (i) => i.rarity === rarity && !i.shopOnly && !i.limited,
    );
    pulledItem = pool_[Math.floor(Math.random() * pool_.length)];
  }

  await pool.query(
    `UPDATE users SET ${pityCol} = $1, limited_guaranteed = $2 WHERE id = $3`,
    [pity, guaranteed, userId],
  );

  const invCheck = await pool.query(
    "SELECT * FROM inventory WHERE user_id = $1 AND item_id = $2",
    [userId, pulledItem.id],
  );

  let isDuplicate = false;
  let shardsEarned = 0;

  if (invCheck.rows.length === 0) {
    await pool.query(
      "INSERT INTO inventory (user_id, item_id) VALUES ($1, $2)",
      [userId, pulledItem.id],
    );
  } else {
    isDuplicate = true;
    const SHARD_RATES = { R: 5, SR: 15, SSR: 50 };
    shardsEarned = SHARD_RATES[pulledItem.rarity];

    await pool.query("UPDATE users SET shards = shards + $1 WHERE id = $2", [
      shardsEarned,
      userId,
    ]);
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

  return {
    user: formattedUser,
    pulledItem,
    isDuplicate,
    shardsEarned,
    isTopTierPull: isTopTier,
    isPityReward,
    bannerResult,
  };
}

// ======== GACHA PULL ========
app.post(
  "/api/gacha/pull",
  authenticateUser,
  gachaLimiter,
  async (req, res) => {
    try {
      const userId = req.userId;
      const bannerType =
        req.body?.bannerType === "limited" ? "limited" : "standard";

      const userCheck = await pool.query(
        "SELECT gems FROM users WHERE id = $1",
        [userId],
      );
      if (userCheck.rows[0].gems < 50) {
        return res
          .status(400)
          .json({ error: "Not enough gems! Go do your habits! 😤" });
      }

      await pool.query("UPDATE users SET gems = gems - 50 WHERE id = $1", [
        userId,
      ]);

      const result = await performGachaPull(userId, bannerType);

      // 📊 Insert ke gacha_history
      await pool.query(
        `INSERT INTO gacha_history (user_id, item_id, item_name, rarity, banner_type)
       VALUES ($1, $2, $3, $4, $5)`,
        [
          userId,
          result.pulledItem.id,
          result.pulledItem.name,
          result.pulledItem.rarity,
          bannerType,
        ],
      );

      res.json(result);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: "Server error" });
    }
  },
);

// [GET] Ambil daftar item Shop (kosmetik yang BELUM dimiliki user)
app.get("/api/shop/items", authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;

    const invResult = await pool.query(
      "SELECT item_id FROM inventory WHERE user_id = $1",
      [userId],
    );
    const ownedIds = invResult.rows.map((row) => row.item_id);

    const SHARD_PRICE = { R: 100, SR: 300, SSR: 800 };
    const SHOP_EXCLUSIVE_PRICE = { R: 150, SR: 450, SSR: 1200 };

    const shopItems = COSMETIC_POOL.filter(
      (item) => !ownedIds.includes(item.id) && !item.limited,
    ).map((item) => ({
      ...item,
      price: item.shopOnly
        ? SHOP_EXCLUSIVE_PRICE[item.rarity]
        : SHARD_PRICE[item.rarity],
    }));

    const userResult = await pool.query(
      "SELECT shards FROM users WHERE id = $1",
      [userId],
    );

    res.json({
      shards: userResult.rows[0].shards,
      items: shopItems,
      ticketPrice: TICKET_PRICE,
      shieldPrice: SHIELD_PRICE,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// [POST] Redeem/beli item spesifik pakai Shards
app.post("/api/shop/redeem", authenticateUser, async (req, res) => {
  try {
    const { itemId } = req.body;
    const userId = req.userId;

    const item = COSMETIC_POOL.find((i) => i.id === itemId);
    if (!item || item.limited) {
      return res.status(400).json({ error: "Item tidak tersedia di Shop." });
    }

    const checkOwn = await pool.query(
      "SELECT * FROM inventory WHERE user_id = $1 AND item_id = $2",
      [userId, itemId],
    );
    if (checkOwn.rows.length > 0) {
      return res.status(400).json({ error: "Kamu sudah punya item ini!" });
    }

    const SHARD_PRICE = { R: 100, SR: 300, SSR: 800 };
    const SHOP_EXCLUSIVE_PRICE = { R: 150, SR: 450, SSR: 1200 };
    const price = item.shopOnly
      ? SHOP_EXCLUSIVE_PRICE[item.rarity]
      : SHARD_PRICE[item.rarity];

    const userCheck = await pool.query(
      "SELECT shards FROM users WHERE id = $1",
      [userId],
    );
    if (userCheck.rows[0].shards < price) {
      return res.status(400).json({ error: "Shards tidak cukup!" });
    }

    await pool.query("UPDATE users SET shards = shards - $1 WHERE id = $2", [
      price,
      userId,
    ]);
    await pool.query(
      "INSERT INTO inventory (user_id, item_id) VALUES ($1, $2)",
      [userId, itemId],
    );

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

    res.json({ user: formattedUser, redeemedItem: item });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// [POST] Beli & langsung pakai Gacha Ticket (pakai Shards, bukan Gems)
const TICKET_PRICE = 60;

// ======== GACHA TICKET (SHOP) ========
app.post(
  "/api/shop/buy-ticket",
  authenticateUser,
  gachaLimiter,
  async (req, res) => {
    try {
      const userId = req.userId;

      const userCheck = await pool.query(
        "SELECT shards FROM users WHERE id = $1",
        [userId],
      );
      if (userCheck.rows[0].shards < 60) {
        return res.status(400).json({ error: "Not enough Shards!" });
      }

      await pool.query("UPDATE users SET shards = shards - 60 WHERE id = $1", [
        userId,
      ]);

      const result = await performGachaPull(userId, "standard");

      // 📊 Insert gacha history
      await pool.query(
        `INSERT INTO gacha_history (user_id, item_id, item_name, rarity, banner_type)
       VALUES ($1, $2, $3, $4, $5)`,
        [
          userId,
          result.pulledItem.id,
          result.pulledItem.name,
          result.pulledItem.rarity,
          "ticket",
        ],
      );

      res.json(result);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: "Server error" });
    }
  },
);

// [POST] Beli Streak Shield pakai Shards
const SHIELD_PRICE = 120;

app.post("/api/shop/buy-shield", authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;

    const userCheck = await pool.query(
      "SELECT shards FROM users WHERE id = $1",
      [userId],
    );
    if (userCheck.rows[0].shards < SHIELD_PRICE) {
      return res.status(400).json({ error: "Shards tidak cukup!" });
    }

    await pool.query(
      "UPDATE users SET shards = shards - $1, streak_shield = streak_shield + 1 WHERE id = $2",
      [SHIELD_PRICE, userId],
    );

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

    res.json({ user: formattedUser });
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
