const fs = require('fs');
let code = fs.readFileSync('src/pages/FicheDetails.tsx', 'utf8');
code = code.replace(/import \{.*?\} from "lucide-react";/, 'import { ArrowLeft, MapPin, Clock, FileText, CheckCircle, Truck, PlayCircle, Printer, Edit, Trash2 } from "lucide-react";');
fs.writeFileSync('src/pages/FicheDetails.tsx', code);
