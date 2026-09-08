const fs = require('fs');
let code = fs.readFileSync('src/pages/FicheDetails.tsx', 'utf8');

// Remove handleStartWork and handleEndWork buttons
code = code.replace(/\{\/\* SIMULATION APP MOBILE CHAUFFEUR \*\/\}/g, '');
code = code.replace(/\{\(fiche\.statut === "Planifiée" \|\| fiche\.statut === "Affectée"\) && \([\s\S]*?<\/button>\s*\)\}/g, '');
code = code.replace(/\{fiche\.statut === "En cours" && \([\s\S]*?<\/button>\s*\)\}/g, '');

fs.writeFileSync('src/pages/FicheDetails.tsx', code);
