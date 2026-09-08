import sys

with open('server.ts', 'r') as f:
    content = f.read()

# find the post route
start = content.find('app.post("/api/fiches"')
end = content.find('app.patch("/api/fiches/:id"', start)

route = content[start:end]

# let's just replace the db.prepare...run with run(args)
new_route = route.replace("""  db.prepare(`
    INSERT OR IGNORE INTO fiches_travail 
    (id, numero, societe_id, equipe_id, date_prevue, heure_depart_prevue, heure_debut_prevue, heure_debut_reelle, heure_fin_reelle, type_travail, description, instructions, priorite, statut, metrage, cout) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    ficheId, numero, societeId, equipeId, 
    ficheData.date_prevue, ficheData.heure_depart_prevue, ficheData.heure_debut_prevue, 
    ficheData.heure_debut_reelle || "", ficheData.heure_fin_reelle || "", 
    ficheData.type_travail, ficheData.description, ficheData.instructions || "", 
    ficheData.priorite, "Planifiée", ficheData.metrage || "", ficheData.cout || null
  );""", 
"""  const args = [
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
  `).run(...args);""")

# fix any remaining syntax errors
new_route = new_route.replace('  );\n  const nouvelleFiche', '  const nouvelleFiche')

content = content[:start] + new_route + content[end:]
with open('server.ts', 'w') as f:
    f.write(content)
