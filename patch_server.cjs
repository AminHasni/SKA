const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newPatch = `
app.patch("/api/fiches/:id", (req, res) => {
  const { id } = req.params;
  const { 
    client_nom, client_adresse, client_localisation, client_contact, client_telephone,
    equipe_nom, equipe_vehicule,
    ...ficheData 
  } = req.body;

  // fetch current fiche
  const currentFiche = db.prepare("SELECT * FROM fiches_travail WHERE id = ?").get(id);
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
      updates.push(\`\${key} = ?\`);
      values.push(value);
    }
  }

  if (updates.length > 0) {
    db.prepare(\`UPDATE fiches_travail SET \${updates.join(", ")} WHERE id = ?\`).run(...values, id);
  }

  const updatedFiche = db.prepare("SELECT * FROM fiches_travail WHERE id = ?").get(id);
  res.json(updatedFiche);
});
`;

// replace old patch route
code = code.replace(/app\.patch\("\/api\/fiches\/:id", \(req, res\) => \{[\s\S]*?\}\);/g, newPatch.trim());
fs.writeFileSync('server.ts', code);
