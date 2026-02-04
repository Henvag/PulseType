import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const {
  PORT = 3000,
  DATABASE_URL,
  SESSION_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  BASE_URL,
} = process.env;

if (!DATABASE_URL || !SESSION_SECRET || !BASE_URL) {
  console.error("Missing required environment variables.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: DATABASE_URL });

const app = express();
app.use(express.json());
app.set("trust proxy", 1);

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: BASE_URL.startsWith("https://"),
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    done(null, rows[0] || null);
  } catch (err) {
    done(err, null);
  }
});

function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ error: "Unauthorized" });
}

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID || "",
      clientSecret: GOOGLE_CLIENT_SECRET || "",
      callbackURL: `${BASE_URL}/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const providerId = profile.id;
        const displayName = profile.displayName || "Google User";
        const avatar = profile.photos?.[0]?.value || null;

        const existing = await pool.query(
          "SELECT * FROM users WHERE provider = $1 AND provider_id = $2",
          ["google", providerId]
        );
        if (existing.rows[0]) return done(null, existing.rows[0]);

        const created = await pool.query(
          "INSERT INTO users (provider, provider_id, display_name, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *",
          ["google", providerId, displayName, avatar]
        );
        return done(null, created.rows[0]);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID || "",
      clientSecret: GITHUB_CLIENT_SECRET || "",
      callbackURL: `${BASE_URL}/auth/github/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const providerId = profile.id;
        const displayName = profile.username || profile.displayName || "GitHub User";
        const avatar = profile.photos?.[0]?.value || null;

        const existing = await pool.query(
          "SELECT * FROM users WHERE provider = $1 AND provider_id = $2",
          ["github", providerId]
        );
        if (existing.rows[0]) return done(null, existing.rows[0]);

        const created = await pool.query(
          "INSERT INTO users (provider, provider_id, display_name, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *",
          ["github", providerId, displayName, avatar]
        );
        return done(null, created.rows[0]);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

app.get("/auth/google", passport.authenticate("google", { scope: ["profile"] }));
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (_req, res) => res.redirect("/")
);

app.get("/auth/github", passport.authenticate("github", { scope: ["read:user"] }));
app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (_req, res) => res.redirect("/")
);

app.post("/auth/logout", (req, res) => {
  req.logout(() => {
    res.json({ ok: true });
  });
});

app.get("/api/me", (req, res) => {
  if (!req.user) return res.json({ user: null });
  const {
    id,
    display_name: displayName,
    avatar_url: avatarUrl,
    provider,
    keyboard_model: keyboardModel,
  } = req.user;
  return res.json({ user: { id, displayName, avatarUrl, provider, keyboardModel } });
});

app.get("/api/leaderboard", async (req, res) => {
  const duration = Number(req.query.duration) || 15;
  const { rows } = await pool.query(
    `SELECT DISTINCT ON (s.user_id)
            s.id, s.wpm, s.accuracy, s.chars_typed, s.duration_seconds, s.created_at,
            u.display_name, u.avatar_url
     FROM scores s
     JOIN users u ON s.user_id = u.id
     WHERE s.duration_seconds = $1
     ORDER BY s.user_id, s.wpm DESC, s.accuracy DESC, s.created_at DESC`,
    [duration]
  );
  const ranked = rows
    .sort((a, b) => b.wpm - a.wpm || b.accuracy - a.accuracy)
    .slice(0, 25);
  res.json({ scores: ranked, duration });
});

app.get("/api/me/scores", ensureAuth, async (req, res) => {
  const { rows: bestRows } = await pool.query(
    `SELECT wpm, accuracy, chars_typed, duration_seconds, created_at
     FROM scores
     WHERE user_id = $1 AND is_best = true
     ORDER BY duration_seconds ASC`,
    [req.user.id]
  );

  const { rows: recentRows } = await pool.query(
    `SELECT wpm, accuracy, chars_typed, duration_seconds, created_at
     FROM scores
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 8`,
    [req.user.id]
  );

  res.json({ best: bestRows, recent: recentRows });
});

app.put("/api/me/keyboard", ensureAuth, async (req, res) => {
  const { keyboardModel } = req.body || {};
  if (keyboardModel != null && typeof keyboardModel !== "string") {
    return res.status(400).json({ error: "Invalid keyboard" });
  }
  const value = keyboardModel?.trim() || null;
  const { rows } = await pool.query(
    "UPDATE users SET keyboard_model = $1 WHERE id = $2 RETURNING keyboard_model",
    [value, req.user.id]
  );
  res.json({ keyboardModel: rows[0]?.keyboard_model || null });
});

app.post("/api/score", ensureAuth, async (req, res) => {
  const { wpm, accuracy, charsTyped, durationSeconds } = req.body || {};
  if (
    typeof wpm !== "number" ||
    typeof accuracy !== "number" ||
    typeof charsTyped !== "number" ||
    typeof durationSeconds !== "number"
  ) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const { rows: bestRows } = await pool.query(
    "SELECT * FROM scores WHERE user_id = $1 AND duration_seconds = $2 AND is_best = true",
    [req.user.id, durationSeconds]
  );
  const currentBest = bestRows[0];
  const isBetter =
    !currentBest ||
    wpm > currentBest.wpm ||
    (wpm === currentBest.wpm && accuracy > currentBest.accuracy);

  await pool.query(
    "INSERT INTO scores (user_id, wpm, accuracy, chars_typed, duration_seconds, is_best) VALUES ($1, $2, $3, $4, $5, $6)",
    [req.user.id, wpm, accuracy, charsTyped, durationSeconds, isBetter]
  );

  if (isBetter && currentBest) {
    await pool.query("UPDATE scores SET is_best = false WHERE id = $1", [currentBest.id]);
  }

  res.json({ ok: true });
});

const staticDir = path.join(__dirname, "..");
app.use(express.static(staticDir));

app.get("*", (_req, res) => {
  res.sendFile(path.join(staticDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`PulseType running on ${PORT}`);
});
