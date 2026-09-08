const fs = require('fs');
let code = fs.readFileSync('src/pages/FicheDetails.tsx', 'utf8');

// import Edit, Trash2
code = code.replace(/import \{ ArrowLeft, MapPin, FileText, Printer, PlayCircle, CheckCircle, Save \} from "lucide-react";/g, 'import { ArrowLeft, MapPin, FileText, Printer, PlayCircle, CheckCircle, Save, Edit, Trash2 } from "lucide-react";');

// find the Imprimer button
const imprimerBtn = `<button onClick={handleDownloadPdf} className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-stone-700 bg-white border border-stone-200 dark:bg-[#1C1C1B] dark:border-stone-800 dark:text-stone-300 rounded-md hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors shadow-sm">
            <Printer size={16} /> Imprimer
          </button>`;

const newBtns = `<button onClick={() => navigate(\`/fiches/\${fiche.id}/edit\`)} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors shadow-sm">
            <Edit size={16} /> Modifier
          </button>
          <button onClick={() => { if(window.confirm('Voulez-vous vraiment supprimer cette fiche ?')) { fetch(\`/api/fiches/\${fiche.id}\`, { method: 'DELETE' }).then(() => navigate('/')); } }} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors shadow-sm">
            <Trash2 size={16} /> Supprimer
          </button>
          ` + imprimerBtn;

code = code.replace(imprimerBtn, newBtns);

fs.writeFileSync('src/pages/FicheDetails.tsx', code);
