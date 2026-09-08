const db = require('better-sqlite3')('./local-database.sqlite');
const stmt = db.prepare(`
    INSERT OR IGNORE INTO fiches_travail 
    (id, numero, societe_id, equipe_id, date_prevue, heure_depart_prevue, heure_debut_prevue, heure_debut_reelle, heure_fin_reelle, type_travail, description, instructions, priorite, statut, metrage, cout) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
console.log(stmt.source);
try {
  stmt.run(
    'fiche-test', '123', 'soc-1', 'eq-1', 
    '2026', '07', '08', 
    '', '', 
    'type', 'desc', '', 
    'norm', 'stat', '', null
  );
  console.log("Success");
} catch (e) {
  console.log(e);
}
