const fs = require('fs');

// Fix server.ts
let serverCode = fs.readFileSync('server.ts', 'utf8');
serverCode = serverCode.replace('const currentFiche = db.prepare("SELECT * FROM fiches_travail WHERE id = ?").get(id);', 'const currentFiche = db.prepare("SELECT * FROM fiches_travail WHERE id = ?").get(id) as any;');
fs.writeFileSync('server.ts', serverCode);

// Fix FicheDetails.tsx
let fichesDetailsCode = fs.readFileSync('src/pages/FicheDetails.tsx', 'utf8');
if (!fichesDetailsCode.includes('import { ArrowLeft, MapPin, FileText, Printer, PlayCircle, CheckCircle, Save, Edit, Trash2 } from "lucide-react";')) {
    fichesDetailsCode = fichesDetailsCode.replace(/import \{ ArrowLeft, MapPin, FileText, Printer, PlayCircle, CheckCircle, Save \} from "lucide-react";/, 'import { ArrowLeft, MapPin, FileText, Printer, PlayCircle, CheckCircle, Save, Edit, Trash2 } from "lucide-react";');
    fs.writeFileSync('src/pages/FicheDetails.tsx', fichesDetailsCode);
}
