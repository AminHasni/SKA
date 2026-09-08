const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
const deleteRoute = `
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
`;
code = code.replace('app.patch("/api/fiches/:id", (req, res) => {', deleteRoute + '\napp.patch("/api/fiches/:id", (req, res) => {');
fs.writeFileSync('server.ts', code);
