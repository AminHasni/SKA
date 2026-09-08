const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
`  }).run(
    ficheId, numero, societeId, equipeId, 
    ficheData.date_prevue, ficheData.heure_depart_prevue, ficheData.heure_debut_prevue, 
    ficheData.heure_debut_reelle || "", ficheData.heure_fin_reelle || "", 
    ficheData.type_travail, ficheData.description, ficheData.instructions || "", 
    ficheData.priorite, "Planifiée", ficheData.metrage || "", ficheData.cout || null]
  );`, 
`  }).run(
    ficheId, numero, societeId, equipeId, 
    ficheData.date_prevue, ficheData.heure_depart_prevue, ficheData.heure_debut_prevue, 
    ficheData.heure_debut_reelle || "", ficheData.heure_fin_reelle || "", 
    ficheData.type_travail, ficheData.description, ficheData.instructions || "", 
    ficheData.priorite, "Planifiée", ficheData.metrage || "", ficheData.cout || null
  );`
);
fs.writeFileSync('server.ts', code);
