import Database from 'better-sqlite3';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'local-database.sqlite');

// Initialize the SQLite database
const db = new Database(DB_FILE, { verbose: console.log });

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    nom_complet TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'agent',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS societes (
    id TEXT PRIMARY KEY,
    nom TEXT NOT NULL,
    adresse TEXT,
    localisation TEXT,
    contact TEXT,
    telephone TEXT
  );

  CREATE TABLE IF NOT EXISTS equipes (
    id TEXT PRIMARY KEY,
    nom_chauffeur TEXT NOT NULL,
    vehicule TEXT
  );

  CREATE TABLE IF NOT EXISTS fiches_travail (
    id TEXT PRIMARY KEY,
    numero TEXT NOT NULL,
    societe_id TEXT NOT NULL,
    equipe_id TEXT NOT NULL,
    date_prevue TEXT,
    heure_depart_prevue TEXT,
    heure_debut_prevue TEXT,
    heure_debut_reelle TEXT,
    heure_fin_reelle TEXT,
    type_travail TEXT,
    description TEXT,
    instructions TEXT,
    priorite TEXT,
    statut TEXT,
    metrage TEXT,
    cout REAL,
    FOREIGN KEY (societe_id) REFERENCES societes(id),
    FOREIGN KEY (equipe_id) REFERENCES equipes(id)
  );

  CREATE TABLE IF NOT EXISTS factures (
    id TEXT PRIMARY KEY,
    numero TEXT NOT NULL,
    fiche_travail_id TEXT,
    client_nom TEXT NOT NULL DEFAULT '',
    client_adresse TEXT DEFAULT '',
    client_contact TEXT DEFAULT '',
    client_telephone TEXT DEFAULT '',
    date_facture TEXT NOT NULL,
    total_ht REAL NOT NULL DEFAULT 0,
    taux_tva REAL NOT NULL DEFAULT 19,
    total_tva REAL NOT NULL DEFAULT 0,
    total_ttc REAL NOT NULL DEFAULT 0,
    statut TEXT NOT NULL DEFAULT 'Brouillon',
    FOREIGN KEY (fiche_travail_id) REFERENCES fiches_travail(id)
  );

  CREATE TABLE IF NOT EXISTS facture_lignes (
    id TEXT PRIMARY KEY,
    facture_id TEXT NOT NULL,
    description TEXT,
    quantite REAL NOT NULL,
    unite TEXT,
    prix_unitaire REAL NOT NULL,
    total_ligne REAL NOT NULL,
    type_facturation TEXT,
    FOREIGN KEY (facture_id) REFERENCES factures(id)
  );
`);

try {
  db.exec("ALTER TABLE facture_lignes ADD COLUMN type_facturation TEXT");
} catch (e) {
  // column already exists
}

export default db;
