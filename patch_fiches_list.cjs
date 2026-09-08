const fs = require('fs');
let code = fs.readFileSync('src/pages/FichesList.tsx', 'utf8');

// import Edit, Trash2
code = code.replace(/import \{ Plus, ChevronRight, Clock, MapPin \} from "lucide-react";/g, 'import { Plus, ChevronRight, Clock, MapPin, Edit, Trash2 } from "lucide-react";');

// update the empty header th
code = code.replace(/<th className="py-4 px-6 font-medium"><\/th>/g, '<th className="py-4 px-6 text-end font-medium">Actions</th>');

// add action buttons in td
const tdActionsOld = `<td className="py-4 px-6 text-end">
                      <ChevronRight size={18} className="text-stone-400 group-hover:text-stone-900 dark:group-hover:text-stone-100 transition-colors inline-block" />
                    </td>`;
const tdActionsNew = `<td className="py-4 px-6 text-end space-x-2">
                      <Link to={\`/fiches/\${fiche.id}/edit\`} className="inline-flex items-center justify-center p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 rounded-lg transition-colors">
                        <Edit size={18} />
                      </Link>
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); if(window.confirm('Voulez-vous vraiment supprimer cette fiche ?')) { fetch(\`/api/fiches/\${fiche.id}\`, { method: 'DELETE' }).then(() => setFiches(fiches.filter(f => f.id !== fiche.id))); } }} className="inline-flex items-center justify-center p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                      <Link to={\`/fiches/\${fiche.id}\`} className="inline-flex items-center justify-center p-2 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
                        <ChevronRight size={18} />
                      </Link>
                    </td>`;

if (code.includes(tdActionsOld)) {
  code = code.replace(tdActionsOld, tdActionsNew);
} else {
  // Try to find the last td
  code = code.replace(/<td className="py-4 px-6 text-end">[\s\S]*?<\/td>/, tdActionsNew);
}

fs.writeFileSync('src/pages/FichesList.tsx', code);
