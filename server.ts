import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

const db = new Database('forgeflow.db');

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS workouts (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    reps INTEGER DEFAULT 0,
    intensity TEXT,
    duration INTEGER, -- in seconds
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS nutrition_logs (
    id TEXT PRIMARY KEY,
    meal_name TEXT,
    protein INTEGER,
    carbs INTEGER,
    fats INTEGER,
    impact TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_stats (
    id TEXT PRIMARY KEY,
    total_reps INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    last_workout_at DATETIME,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0
  );
`);

// Initialize stats if empty
const statsCount = db.prepare('SELECT COUNT(*) as count FROM user_stats').get() as { count: number };
if (statsCount.count === 0) {
  db.prepare('INSERT INTO user_stats (id, total_reps, streak, level, xp) VALUES (?, ?, ?, ?, ?)').run(uuidv4(), 12450, 14, 42, 8500);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/stats', (req, res) => {
    const stats = db.prepare('SELECT * FROM user_stats LIMIT 1').get();
    res.json(stats);
  });

  app.get('/api/workouts', (req, res) => {
    const workouts = db.prepare('SELECT * FROM workouts ORDER BY created_at DESC LIMIT 20').all();
    res.json(workouts);
  });

  app.post('/api/workouts', (req, res) => {
    const { type, reps, intensity, duration } = req.body;
    const id = uuidv4();
    db.prepare('INSERT INTO workouts (id, type, reps, intensity, duration) VALUES (?, ?, ?, ?, ?)').run(id, type, reps, intensity, duration);
    
    // Update user stats
    db.prepare('UPDATE user_stats SET total_reps = total_reps + ?, xp = xp + ?, last_workout_at = CURRENT_TIMESTAMP').run(reps, Math.round(reps * 0.5));
    
    res.json({ id, success: true });
  });

  app.post('/api/nutrition', (req, res) => {
    const { meal_name, protein, carbs, fats, impact } = req.body;
    const id = uuidv4();
    db.prepare('INSERT INTO nutrition_logs (id, meal_name, protein, carbs, fats, impact) VALUES (?, ?, ?, ?, ?, ?)').run(id, meal_name, protein, carbs, fats, impact);
    res.json({ id, success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
