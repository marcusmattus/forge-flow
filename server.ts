import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

const db = new Database('wordquest.db');

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS word_trees (
    id TEXT PRIMARY KEY,
    root_word TEXT NOT NULL,
    language TEXT DEFAULT 'en',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    xp INTEGER DEFAULT 0,
    level TEXT DEFAULT 'seed',
    last_reviewed_at DATETIME,
    next_review_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ease_factor REAL DEFAULT 2.5,
    interval_days INTEGER DEFAULT 0,
    repetition INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS word_nodes (
    id TEXT PRIMARY KEY,
    tree_id TEXT,
    type TEXT,
    value TEXT,
    meta TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tree_id) REFERENCES word_trees(id)
  );

  CREATE TABLE IF NOT EXISTS review_logs (
    id TEXT PRIMARY KEY,
    tree_id TEXT,
    review_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    prompt_type TEXT,
    user_answer TEXT,
    score REAL,
    xp_earned INTEGER,
    FOREIGN KEY(tree_id) REFERENCES word_trees(id)
  );
`);

// Seed data if empty
const count = db.prepare('SELECT COUNT(*) as count FROM word_trees').get() as { count: number };
if (count.count === 0) {
  const tree1Id = uuidv4();
  db.prepare(`INSERT INTO word_trees (id, root_word, language, level, xp, next_review_at) VALUES (?, ?, ?, ?, ?, datetime('now', '-1 day'))`).run(tree1Id, 'Resilience', 'en', 'blooming', 150);
  db.prepare(`INSERT INTO word_nodes (id, tree_id, type, value) VALUES (?, ?, ?, ?)`).run(uuidv4(), tree1Id, 'definition', 'The capacity to recover quickly from difficulties; toughness.');
  db.prepare(`INSERT INTO word_nodes (id, tree_id, type, value) VALUES (?, ?, ?, ?)`).run(uuidv4(), tree1Id, 'synonym', 'Endurance');
  db.prepare(`INSERT INTO word_nodes (id, tree_id, type, value) VALUES (?, ?, ?, ?)`).run(uuidv4(), tree1Id, 'synonym', 'Toughness');
  db.prepare(`INSERT INTO word_nodes (id, tree_id, type, value, meta) VALUES (?, ?, ?, ?, ?)`).run(uuidv4(), tree1Id, 'translation', 'resiliencia', JSON.stringify({ language: 'es' }));

  const tree2Id = uuidv4();
  db.prepare(`INSERT INTO word_trees (id, root_word, language, level, xp, next_review_at) VALUES (?, ?, ?, ?, ?, datetime('now', '+1 day'))`).run(tree2Id, 'Ephemeral', 'en', 'sapling', 50);
  db.prepare(`INSERT INTO word_nodes (id, tree_id, type, value) VALUES (?, ?, ?, ?)`).run(uuidv4(), tree2Id, 'definition', 'Lasting for a very short time.');
  db.prepare(`INSERT INTO word_nodes (id, tree_id, type, value) VALUES (?, ?, ?, ?)`).run(uuidv4(), tree2Id, 'synonym', 'Fleeting');

  const tree3Id = uuidv4();
  db.prepare(`INSERT INTO word_trees (id, root_word, language, level, xp, next_review_at) VALUES (?, ?, ?, ?, ?, datetime('now', '-2 days'))`).run(tree3Id, 'Ubiquitous', 'en', 'branching', 100);
  db.prepare(`INSERT INTO word_nodes (id, tree_id, type, value) VALUES (?, ?, ?, ?)`).run(uuidv4(), tree3Id, 'definition', 'Present, appearing, or found everywhere.');
  db.prepare(`INSERT INTO word_nodes (id, tree_id, type, value) VALUES (?, ?, ?, ?)`).run(uuidv4(), tree3Id, 'synonym', 'Omnipresent');
  db.prepare(`INSERT INTO word_nodes (id, tree_id, type, value) VALUES (?, ?, ?, ?)`).run(uuidv4(), tree3Id, 'synonym', 'Pervasive');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/trees', (req, res) => {
    const trees = db.prepare('SELECT * FROM word_trees ORDER BY created_at DESC').all();
    const treesWithCounts = trees.map((t: any) => {
      const nodeCount = db.prepare('SELECT COUNT(*) as count FROM word_nodes WHERE tree_id = ?').get(t.id) as { count: number };
      return { ...t, nodeCount: nodeCount.count };
    });
    res.json(treesWithCounts);
  });

  app.post('/api/trees', (req, res) => {
    const { rootWord, language = 'en' } = req.body;
    if (!rootWord) return res.status(400).json({ error: 'rootWord is required' });
    const id = uuidv4();
    db.prepare(`INSERT INTO word_trees (id, root_word, language) VALUES (?, ?, ?)`).run(id, rootWord, language);
    res.json({ id, rootWord, language, level: 'seed', xp: 0 });
  });

  app.get('/api/trees/:id', (req, res) => {
    const tree = db.prepare('SELECT * FROM word_trees WHERE id = ?').get(req.params.id);
    if (!tree) return res.status(404).json({ error: 'Tree not found' });
    const nodes = db.prepare('SELECT * FROM word_nodes WHERE tree_id = ? ORDER BY created_at ASC').all(req.params.id);
    res.json({ ...tree, nodes });
  });

  app.post('/api/trees/:id/nodes', (req, res) => {
    const { type, value, meta } = req.body;
    const treeId = req.params.id;
    if (!type || !value) return res.status(400).json({ error: 'type and value are required' });
    
    const id = uuidv4();
    db.prepare(`INSERT INTO word_nodes (id, tree_id, type, value, meta) VALUES (?, ?, ?, ?, ?)`).run(id, treeId, type, value, meta ? JSON.stringify(meta) : null);
    
    // Evaluate level up
    const nodes = db.prepare('SELECT * FROM word_nodes WHERE tree_id = ?').all(treeId) as any[];
    const tree = db.prepare('SELECT * FROM word_trees WHERE id = ?').get(treeId) as any;
    
    let newLevel = tree.level;
    let xpEarned = 10; // Base XP for adding a node

    const hasDefinition = nodes.some(n => n.type === 'definition');
    const synonymsCount = nodes.filter(n => ['synonym', 'antonym', 'adjective'].includes(n.type)).length;
    const translationsCount = nodes.filter(n => n.type === 'translation').length;
    const conceptsCount = nodes.filter(n => n.type === 'concept').length;
    const sentencesCount = nodes.filter(n => n.type === 'sentence').length;

    if (tree.level === 'seed' && hasDefinition) {
      newLevel = 'sapling';
      xpEarned += 50;
    } else if (tree.level === 'sapling' && synonymsCount >= 3) {
      newLevel = 'branching';
      xpEarned += 100;
    } else if (tree.level === 'branching' && translationsCount >= 2) {
      newLevel = 'blooming';
      xpEarned += 150;
    } else if (tree.level === 'blooming' && conceptsCount >= 2 && sentencesCount >= 2) {
      newLevel = 'forest';
      xpEarned += 200;
    }

    db.prepare(`UPDATE word_trees SET level = ?, xp = xp + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(newLevel, xpEarned, treeId);

    res.json({ id, tree_id: treeId, type, value, meta, newLevel, xpEarned });
  });

  app.get('/api/reviews/due', (req, res) => {
    const dueTrees = db.prepare(`SELECT * FROM word_trees WHERE next_review_at <= datetime('now') ORDER BY next_review_at ASC`).all();
    
    // For each due tree, pick a random prompt type based on available nodes
    const prompts = dueTrees.map((tree: any) => {
      const nodes = db.prepare('SELECT * FROM word_nodes WHERE tree_id = ?').all(tree.id) as any[];
      const availableTypes = Array.from(new Set(nodes.map(n => n.type)));
      
      // Default to definition if no nodes, but that shouldn't happen if it's due (usually has definition)
      let promptType = 'definition';
      if (availableTypes.length > 0) {
        // Pick a random available type that makes sense to test
        const testableTypes = availableTypes.filter(t => ['definition', 'synonym', 'translation', 'sentence'].includes(t));
        if (testableTypes.length > 0) {
          promptType = testableTypes[Math.floor(Math.random() * testableTypes.length)];
        }
      }

      // Get the target node(s) for the prompt
      const targetNodes = nodes.filter(n => n.type === promptType);

      return {
        treeId: tree.id,
        rootWord: tree.root_word,
        promptType,
        targetNodes
      };
    });

    res.json(prompts);
  });

  app.post('/api/reviews', (req, res) => {
    const { treeId, promptType, userAnswer, score } = req.body;
    
    const tree = db.prepare('SELECT * FROM word_trees WHERE id = ?').get(treeId) as any;
    if (!tree) return res.status(404).json({ error: 'Tree not found' });

    // SM-2 Algorithm
    let { repetition, interval_days, ease_factor } = tree;
    
    if (score < 0.6) {
      repetition = 0;
      interval_days = 1;
    } else {
      repetition += 1;
      if (repetition === 1) interval_days = 1;
      else if (repetition === 2) interval_days = 3;
      else interval_days = Math.round(interval_days * ease_factor);
      
      ease_factor = Math.max(1.3, Math.min(2.5, ease_factor + (0.1 - (1 - score) * (0.08 + (1 - score) * 0.02))));
    }

    const xpEarned = Math.round(score * 20);

    db.prepare(`
      UPDATE word_trees 
      SET repetition = ?, interval_days = ?, ease_factor = ?, 
          last_reviewed_at = CURRENT_TIMESTAMP, 
          next_review_at = datetime('now', '+' || ? || ' days'),
          xp = xp + ?
      WHERE id = ?
    `).run(repetition, interval_days, ease_factor, interval_days, xpEarned, treeId);

    const logId = uuidv4();
    db.prepare(`INSERT INTO review_logs (id, tree_id, prompt_type, user_answer, score, xp_earned) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(logId, treeId, promptType, userAnswer, score, xpEarned);

    res.json({ success: true, xpEarned, nextReviewAt: new Date(Date.now() + interval_days * 24 * 60 * 60 * 1000) });
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
