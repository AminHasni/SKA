import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { v4 as uuidv4 } from "uuid";
import PDFDocument from "pdfkit";
import db from "./src/db/sqlite.js"; // Need to use .js extension for ESM resolution in node

const app = express();
const PORT = 3000;

app.use(express.json());

// Add initial seed data if DB is empty
const usersCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
if (usersCount.count === 0) {
  const insertUser = db.prepare("INSERT INTO users (id, username, password, nom_complet, role, created_at) VALUES (?, ?, ?, ?, ?, ?)");
  insertUser.run("usr-admin", "admin", "admin123", "Administrateur Khelifi", "admin", new Date().toISOString());
}

const fichesCount = db.prepare("SELECT COUNT(*) as count FROM fiches_travail").get() as { count: number };
if (fichesCount.count === 0) {
  const insertSociete = db.prepare("INSERT OR IGNORE INTO societes (id, nom, adresse, localisation, contact, telephone) VALUES (?, ?, ?, ?, ?, ?)");
  const insertEquipe = db.prepare("INSERT OR IGNORE INTO equipes (id, nom_chauffeur, vehicule) VALUES (?, ?, ?)");
  const insertFiche = db.prepare("INSERT OR IGNORE INTO fiches_travail (id, numero, societe_id, equipe_id, date_prevue, heure_depart_prevue, heure_debut_prevue, heure_debut_reelle, heure_fin_reelle, type_travail, description, instructions, priorite, statut, metrage, cout) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  
  insertSociete.run("soc-1", "ABC Construction", "Zone Industrielle, Tunis", "Chantier El Menzah", "Mohamed Ali", "71000111");
  insertSociete.run("soc-2", "Global Tech", "Lac 2, Tunis", "Siège Principal", "Sami Mzali", "71000222");
  
  insertEquipe.run("eq-1", "Ahmed (Équipe 1)", "Fourgonette 1234 TU 100");
  insertEquipe.run("eq-2", "Karim (Équipe 2)", "Camionnette 5678 TU 150");
  
  insertFiche.run(
    "fiche-1", 
    "FT-2026-00001", 
    "soc-1", 
    "eq-1", 
    new Date().toISOString().split('T')[0], 
    "07:30", 
    "08:00", 
    "", 
    "", 
    "Maintenance", 
    "Intervention sur le chantier pour effectuer les travaux demandés.", 
    "Contacter le chef de chantier à l'arrivée.", 
    "Normale", 
    "Planifiée", "", null
  );
}

// Auth & Users API
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Identifiant et mot de passe requis" });
  }

  const user = db.prepare("SELECT id, username, password, nom_complet, role FROM users WHERE username = ?").get(username) as any;
  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Identifiant ou mot de passe incorrect" });
  }

  // Create simple session token (In production, use JWT or session store)
  const token = Buffer.from(`${user.id}:${user.username}:${user.role}:${Date.now()}`).toString('base64');

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      nom_complet: user.nom_complet,
      role: user.role
    }
  });
});

app.get("/api/auth/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [id, username] = decoded.split(":");

    const user = db.prepare("SELECT id, username, nom_complet, role FROM users WHERE id = ?").get(id) as any;
    if (!user) {
      return res.status(401).json({ error: "Utilisateur introuvable" });
    }

    res.json({ user });
  } catch (err) {
    res.status(401).json({ error: "Token invalide" });
  }
});

app.get("/api/users", (req, res) => {
  const users = db.prepare("SELECT id, username, nom_complet, role, created_at FROM users").all();
  res.json(users);
});

app.post("/api/users", (req, res) => {
  const { username, password, nom_complet, role } = req.body || {};
  if (!username || !password || !nom_complet) {
    return res.status(400).json({ error: "Champs requis manquants" });
  }

  try {
    const userId = uuidv4();
    db.prepare("INSERT INTO users (id, username, password, nom_complet, role, created_at) VALUES (?, ?, ?, ?, ?, ?)")
      .run(userId, username, password, nom_complet, role || "agent", new Date().toISOString());

    const created = db.prepare("SELECT id, username, nom_complet, role, created_at FROM users WHERE id = ?").get(userId);
    res.status(201).json(created);
  } catch (e: any) {
    if (e.message?.includes("UNIQUE")) {
      return res.status(400).json({ error: "Ce nom d'utilisateur existe déjà" });
    }
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.delete("/api/users/:id", (req, res) => {
  db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// API Routes
app.get("/api/fiches", (req, res) => {
  const fiches = db.prepare(`
    SELECT f.*, 
      json_object('id', s.id, 'nom', s.nom, 'adresse', s.adresse, 'localisation', s.localisation, 'contact', s.contact, 'telephone', s.telephone) as societe,
      json_object('id', e.id, 'nom_chauffeur', e.nom_chauffeur, 'vehicule', e.vehicule) as equipe
    FROM fiches_travail f
    LEFT JOIN societes s ON f.societe_id = s.id
    LEFT JOIN equipes e ON f.equipe_id = e.id
  `).all();
  
  const formatted = fiches.map((f: any) => ({
    ...f,
    societe: JSON.parse(f.societe),
    equipe: JSON.parse(f.equipe)
  }));
  
  res.json(formatted);
});

app.get("/api/fiches/:id", (req, res) => {
  const f = db.prepare(`
    SELECT f.*, 
      json_object('id', s.id, 'nom', s.nom, 'adresse', s.adresse, 'localisation', s.localisation, 'contact', s.contact, 'telephone', s.telephone) as societe,
      json_object('id', e.id, 'nom_chauffeur', e.nom_chauffeur, 'vehicule', e.vehicule) as equipe
    FROM fiches_travail f
    LEFT JOIN societes s ON f.societe_id = s.id
    LEFT JOIN equipes e ON f.equipe_id = e.id
    WHERE f.id = ?
  `).get(req.params.id) as any;
  
  if (!f) return res.status(404).json({ error: "Not found" });
  
  res.json({
    ...f,
    societe: JSON.parse(f.societe),
    equipe: JSON.parse(f.equipe)
  });
});

app.get("/api/fiches/:id/pdf", (req, res) => {
  const f = db.prepare(`
    SELECT f.*, 
      json_object('id', s.id, 'nom', s.nom, 'adresse', s.adresse, 'localisation', s.localisation, 'contact', s.contact, 'telephone', s.telephone) as societe,
      json_object('id', e.id, 'nom_chauffeur', e.nom_chauffeur, 'vehicule', e.vehicule) as equipe
    FROM fiches_travail f
    LEFT JOIN societes s ON f.societe_id = s.id
    LEFT JOIN equipes e ON f.equipe_id = e.id
    WHERE f.id = ?
  `).get(req.params.id) as any;

  if (!f) return res.status(404).send("Not found");
  const fiche = { ...f, societe: JSON.parse(f.societe), equipe: JSON.parse(f.equipe) };

  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fiche.numero}.pdf"`);
  doc.pipe(res);

  doc.fontSize(20).text("SOCIÉTÉ MAINTENANCE PRO", { align: "center" });
  doc.fontSize(10).text("123 Rue de l'Industrie, 1000 Tunis", { align: "center" });
  doc.text("Tél : +216 71 123 456 | Email : contact@maintenance-pro.tn", { align: "center" });
  doc.moveDown(2);
  
  doc.fontSize(16).text(`FICHE DE TRAVAIL : ${fiche.numero}`, { align: "center", underline: true });
  doc.moveDown(1.5);
  
  doc.fontSize(14).text("INFORMATIONS CLIENT", 50);
  doc.fontSize(10).text(`Société : ${fiche.societe?.nom}`);
  doc.text(`Adresse : ${fiche.societe?.adresse}`);
  doc.text(`Contact : ${fiche.societe?.contact} - Tél: ${fiche.societe?.telephone}`);
  doc.text(`Localisation : ${fiche.societe?.localisation}`);
  doc.moveDown(1);
  
  doc.fontSize(14).text("INTERVENTION", 50);
  doc.fontSize(10).text(`Date prévue : ${fiche.date_prevue}`);
  doc.text(`Heure départ : ${fiche.heure_depart_prevue} | Heure sur site : ${fiche.heure_debut_prevue}`);
  doc.text(`Équipe assignée : ${fiche.equipe?.nom_chauffeur}`);
  doc.text(`Véhicule : ${fiche.equipe?.vehicule}`);
  doc.moveDown(1.5);
  
  doc.rect(50, doc.y, 500, 100).stroke();
  doc.fontSize(14).text("TRAVAIL À EFFECTUER", 60, doc.y + 10);
  doc.fontSize(10).text(`Type : ${fiche.type_travail} (Priorité: ${fiche.priorite || 'Normale'})`, 60, doc.y + 10);
  if (fiche.metrage) doc.text(`Métrage / Quantité : ${fiche.metrage}`);
  if (fiche.cout) doc.text(`Coût / Prix estimé : ${fiche.cout} DT`);
  doc.text(`Description :`);
  doc.text(fiche.description || '', { width: 480 });
  if (fiche.instructions) {
    doc.moveDown(0.5);
    doc.text(`Instructions : ${fiche.instructions}`);
  }
  
  doc.moveDown(4);
  doc.fontSize(14).text("RAPPORT D'INTERVENTION (Cadre réservé au technicien)", 50);
  doc.moveDown(1);
  doc.fontSize(10).text("Heure d'arrivée : ____:____          Heure de départ : ____:____");
  doc.moveDown(1.5);
  doc.text("Travail effectué / Observations :");
  doc.rect(50, doc.y + 5, 500, 100).stroke();
  
  doc.moveDown(9);
  doc.text("Signature du client :", 50, doc.y);
  doc.text("Signature du technicien :", 350, doc.y);

  doc.end();
});

app.post("/api/fiches", (req, res) => {
  const { 
    client_nom, client_adresse, client_localisation, client_contact, client_telephone,
    equipe_nom, equipe_vehicule,
    ...ficheData 
  } = req.body;

  const societeId = "soc-" + uuidv4();
  db.prepare("INSERT OR IGNORE INTO societes (id, nom, adresse, localisation, contact, telephone) VALUES (?, ?, ?, ?, ?, ?)")
    .run(societeId, client_nom || "Client non spécifié", client_adresse || "", client_localisation || "", client_contact || "", client_telephone || "");

  const equipeId = "eq-" + uuidv4();
  db.prepare("INSERT OR IGNORE INTO equipes (id, nom_chauffeur, vehicule) VALUES (?, ?, ?)")
    .run(equipeId, equipe_nom || "Équipe non spécifiée", equipe_vehicule || "");

  const ficheId = uuidv4();
  const existingFiches = db.prepare("SELECT COUNT(*) as count FROM fiches_travail").get() as { count: number };
  const numero = `FT-${new Date().getFullYear()}-${String(existingFiches.count + 1).padStart(5, '0')}`;

  const args = [
    ficheId, numero, societeId, equipeId, 
    ficheData.date_prevue, ficheData.heure_depart_prevue, ficheData.heure_debut_prevue, 
    ficheData.heure_debut_reelle || "", ficheData.heure_fin_reelle || "", 
    ficheData.type_travail, ficheData.description, ficheData.instructions || "", 
    ficheData.priorite, "Planifiée", ficheData.metrage || "", ficheData.cout || null
  ];
  db.prepare(`
    INSERT OR IGNORE INTO fiches_travail 
    (id, numero, societe_id, equipe_id, date_prevue, heure_depart_prevue, heure_debut_prevue, heure_debut_reelle, heure_fin_reelle, type_travail, description, instructions, priorite, statut, metrage, cout) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(...args);

  const nouvelleFiche = db.prepare("SELECT * FROM fiches_travail WHERE id = ?").get(ficheId);
  res.status(201).json(nouvelleFiche);
});


app.delete("/api/fiches/:id", (req, res) => {
  const { id } = req.params;
  
  // Also delete related invoices and invoice lines?
  // Let's check foreign keys
  // For now let's just delete the fiche if no invoices exist, or cascade
  db.prepare("DELETE FROM facture_lignes WHERE facture_id IN (SELECT id FROM factures WHERE fiche_travail_id = ?)").run(id);
  db.prepare("DELETE FROM factures WHERE fiche_travail_id = ?").run(id);
  db.prepare("DELETE FROM fiches_travail WHERE id = ?").run(id);
  
  res.json({ success: true });
});

app.patch("/api/fiches/:id", (req, res) => {
  const { id } = req.params;
  const { 
    client_nom, client_adresse, client_localisation, client_contact, client_telephone,
    equipe_nom, equipe_vehicule,
    ...ficheData 
  } = req.body;

  // fetch current fiche
  const currentFiche = db.prepare("SELECT * FROM fiches_travail WHERE id = ?").get(id) as any;
  if (!currentFiche) {
    return res.status(404).json({ error: "Fiche not found" });
  }

  // update societe
  if (client_nom) {
    db.prepare("UPDATE societes SET nom = ?, adresse = ?, localisation = ?, contact = ?, telephone = ? WHERE id = ?").run(
      client_nom, client_adresse || "", client_localisation || "", client_contact || "", client_telephone || "", currentFiche.societe_id
    );
  }

  // update equipe
  if (equipe_nom) {
    db.prepare("UPDATE equipes SET nom_chauffeur = ?, vehicule = ? WHERE id = ?").run(
      equipe_nom, equipe_vehicule || "", currentFiche.equipe_id
    );
  }

  // update fiche
  const updates = [];
  const values = [];

  for (const [key, value] of Object.entries(ficheData)) {
    // skip non-fiche keys just in case
    if (['date_prevue', 'heure_depart_prevue', 'heure_debut_prevue', 'heure_debut_reelle', 'heure_fin_reelle', 'type_travail', 'description', 'instructions', 'priorite', 'statut', 'metrage', 'cout'].includes(key)) {
      updates.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (updates.length > 0) {
    db.prepare(`UPDATE fiches_travail SET ${updates.join(", ")} WHERE id = ?`).run(...values, id);
  }

  const updatedFiche = db.prepare("SELECT * FROM fiches_travail WHERE id = ?").get(id);
  res.json(updatedFiche);
});

// Factures
app.get("/api/factures", (req, res) => {
  const factures = db.prepare(`SELECT * FROM factures ORDER BY rowid DESC`).all();
  res.json(factures);
});

app.get("/api/factures/:id", (req, res) => {
  const facture = db.prepare("SELECT * FROM factures WHERE id = ?").get(req.params.id) as any;
  if (!facture) return res.status(404).json({ error: "Facture not found" });

  const lignes = db.prepare("SELECT * FROM facture_lignes WHERE facture_id = ?").all(req.params.id);

  res.json({
    ...facture,
    lignes
  });
});

app.post("/api/factures", (req, res) => {
  const { client_nom, client_adresse, client_contact, client_telephone, date_facture, taux_tva = 19, statut = "Brouillon", lignes = [] } = req.body;

  let total_ht = 0;
  lignes.forEach((l: any) => {
    const total_ligne = (parseFloat(l.quantite) || 0) * (parseFloat(l.prix_unitaire) || 0);
    total_ht += total_ligne;
  });

  const tvaRate = parseFloat(taux_tva) || 19;
  const total_tva = parseFloat((total_ht * (tvaRate / 100)).toFixed(3));
  const total_ttc = parseFloat((total_ht + total_tva).toFixed(3));

  const factureId = uuidv4();
  const count = (db.prepare("SELECT COUNT(*) as count FROM factures").get() as any).count;
  const numero = `FAC-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
  const dateFactureStr = date_facture || new Date().toISOString().split('T')[0];

  db.prepare(`
    INSERT INTO factures (id, numero, client_nom, client_adresse, client_contact, client_telephone, date_facture, total_ht, taux_tva, total_tva, total_ttc, statut)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    factureId, numero, client_nom || "Client non spécifié", client_adresse || "", client_contact || "", client_telephone || "",
    dateFactureStr, parseFloat(total_ht.toFixed(3)), tvaRate, total_tva, total_ttc, statut
  );

  for (const l of lignes) {
    const qte = parseFloat(l.quantite) || 1;
    const pu = parseFloat(l.prix_unitaire) || 0;
    const total_ligne = parseFloat((qte * pu).toFixed(3));
    db.prepare(`
      INSERT INTO facture_lignes (id, facture_id, description, quantite, unite, prix_unitaire, total_ligne, type_facturation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(uuidv4(), factureId, l.description || "", qte, l.unite || "Unité", pu, total_ligne, l.type_facturation || "unite");
  }

  const created = db.prepare("SELECT * FROM factures WHERE id = ?").get(factureId) as Record<string, any>;
  const createdLignes = db.prepare("SELECT * FROM facture_lignes WHERE facture_id = ?").all(factureId);

  res.status(201).json({ ...created, lignes: createdLignes });
});

app.put("/api/factures/:id", (req, res) => {
  const { id } = req.params;
  const { client_nom, client_adresse, client_contact, client_telephone, date_facture, taux_tva = 19, statut = "Brouillon", lignes = [] } = req.body;

  const existing = db.prepare("SELECT * FROM factures WHERE id = ?").get(id);
  if (!existing) return res.status(404).json({ error: "Facture non trouvée" });

  let total_ht = 0;
  lignes.forEach((l: any) => {
    const total_ligne = (parseFloat(l.quantite) || 0) * (parseFloat(l.prix_unitaire) || 0);
    total_ht += total_ligne;
  });

  const tvaRate = parseFloat(taux_tva) || 19;
  const total_tva = parseFloat((total_ht * (tvaRate / 100)).toFixed(3));
  const total_ttc = parseFloat((total_ht + total_tva).toFixed(3));

  db.prepare(`
    UPDATE factures 
    SET client_nom = ?, client_adresse = ?, client_contact = ?, client_telephone = ?, date_facture = ?, total_ht = ?, taux_tva = ?, total_tva = ?, total_ttc = ?, statut = ?
    WHERE id = ?
  `).run(
    client_nom || "Client non spécifié", client_adresse || "", client_contact || "", client_telephone || "",
    date_facture, parseFloat(total_ht.toFixed(3)), tvaRate, total_tva, total_ttc, statut, id
  );

  // Re-insert lines
  db.prepare("DELETE FROM facture_lignes WHERE facture_id = ?").run(id);

  for (const l of lignes) {
    const qte = parseFloat(l.quantite) || 1;
    const pu = parseFloat(l.prix_unitaire) || 0;
    const total_ligne = parseFloat((qte * pu).toFixed(3));
    db.prepare(`
      INSERT INTO facture_lignes (id, facture_id, description, quantite, unite, prix_unitaire, total_ligne, type_facturation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(uuidv4(), id, l.description || "", qte, l.unite || "Unité", pu, total_ligne, l.type_facturation || "unite");
  }

  const updated = db.prepare("SELECT * FROM factures WHERE id = ?").get(id) as Record<string, any>;
  const updatedLignes = db.prepare("SELECT * FROM facture_lignes WHERE facture_id = ?").all(id);

  res.json({ ...updated, lignes: updatedLignes });
});

app.delete("/api/factures/:id", (req, res) => {
  const { id } = req.params;
  db.prepare("DELETE FROM facture_lignes WHERE facture_id = ?").run(id);
  db.prepare("DELETE FROM factures WHERE id = ?").run(id);
  res.json({ success: true });
});

app.patch("/api/factures/:id/status", (req, res) => {
  const { statut } = req.body;
  const facture = db.prepare("SELECT * FROM factures WHERE id = ?").get(req.params.id) as any;
  if (!facture) return res.status(404).json({ error: "Facture not found" });

  db.prepare("UPDATE factures SET statut = ? WHERE id = ?").run(statut, req.params.id);
  const updatedFacture = db.prepare("SELECT * FROM factures WHERE id = ?").get(req.params.id);

  res.json(updatedFacture);
});

// Generate PDF
app.get("/api/factures/:id/pdf", (req, res) => {
  const facture = db.prepare("SELECT * FROM factures WHERE id = ?").get(req.params.id) as any;

  if (!facture) return res.status(404).send("Not found");

  const lignes = db.prepare("SELECT * FROM facture_lignes WHERE facture_id = ?").all(req.params.id) as any[];

  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${facture.numero}.pdf"`);
  doc.pipe(res);

  doc.fontSize(20).text("SOCIÉTÉ KHELIFI ALA", { align: "center" });
  doc.fontSize(10).text("123 Rue de l'Industrie, 1000 Tunis", { align: "center" });
  doc.text("Tél : +216 71 123 456 | Email : contact@khelifi-ala.tn", { align: "center" });
  doc.moveDown(2);

  doc.fontSize(16).text(`FACTURE ${facture.numero}`, { align: "left" });
  doc.fontSize(12).text(`Date : ${new Date(facture.date_facture).toLocaleDateString("fr-FR")}`);
  doc.text(`Statut : ${facture.statut}`);
  doc.moveDown(1);

  doc.fontSize(14).text("Client", { underline: true });
  doc.fontSize(12).text(facture.client_nom || 'Client non spécifié');
  if (facture.client_adresse) doc.text(facture.client_adresse);
  if (facture.client_contact || facture.client_telephone) {
    doc.text(`Contact: ${facture.client_contact || ''} ${facture.client_telephone ? '(' + facture.client_telephone + ')' : ''}`);
  }
  doc.moveDown(1.5);

  const tableTop = doc.y;
  doc.fontSize(10).font("Helvetica-Bold");
  doc.text("Description", 50, tableTop);
  doc.text("Qté", 300, tableTop);
  doc.text("Unité", 350, tableTop);
  doc.text("Prix U.", 400, tableTop);
  doc.text("Total", 480, tableTop);

  doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

  let y = tableTop + 25;
  doc.font("Helvetica");
  lignes.forEach(line => {
    doc.text(line.description || '', 50, y, { width: 240 });
    doc.text((line.quantite || 0).toString(), 300, y);
    doc.text(line.unite || 'Unité', 350, y);
    doc.text(`${(line.prix_unitaire || 0).toFixed(2)} DT`, 400, y);
    doc.text(`${(line.total_ligne || 0).toFixed(2)} DT`, 480, y);
    y += 20;
  });

  doc.moveTo(50, y).lineTo(550, y).stroke();
  y += 15;

  doc.font("Helvetica-Bold");
  doc.text("Total HT :", 400, y);
  doc.text(`${(facture.total_ht || 0).toFixed(2)} DT`, 480, y);
  y += 20;
  doc.text(`TVA (${facture.taux_tva || 19}%) :`, 400, y);
  doc.text(`${(facture.total_tva || 0).toFixed(2)} DT`, 480, y);
  y += 20;
  doc.fontSize(12);
  doc.text("TOTAL TTC :", 400, y);
  doc.text(`${(facture.total_ttc || 0).toFixed(2)} DT`, 480, y);

  doc.end();
});

// --- Vite Middleware ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
