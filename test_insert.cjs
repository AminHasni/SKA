const db = require('better-sqlite3')('./local-database.sqlite');
const stmt = db.prepare(`
    INSERT OR IGNORE INTO fiches_travail 
    (id, numero, societe_id, equipe_id, date_prevue, heure_depart_prevue, heure_debut_prevue, heure_debut_reelle, heure_fin_reelle, type_travail, description, instructions, priorite, statut, metrage, cout) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const args = [
    "f1", "n1", "s1", "e1",
    "2026", "07", "08",
    "", "",
    "t1", "d1", "",
    "p1", "s1", "m1", 5000
];
stmt.run(...args);
console.log("SUCCESS");
