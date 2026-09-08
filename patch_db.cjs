const db = require('better-sqlite3')('local-database.sqlite');
try {
  db.prepare("ALTER TABLE factures ADD COLUMN societe_id TEXT").run();
} catch (e) {
  console.log("Column might already exist or error:", e.message);
}
