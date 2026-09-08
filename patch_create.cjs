const fs = require('fs');
let code = fs.readFileSync('src/pages/CreateFiche.tsx', 'utf8');

code = code.replace('import { useNavigate } from "react-router-dom";', 'import { useNavigate, useParams } from "react-router-dom";\nimport { useEffect } from "react";');

// find export default function CreateFiche() {
// we will inject the useParams and useEffect
const funcStart = 'export default function CreateFiche() {';
const injectStr = `
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode) {
      fetch(\`/api/fiches/\${id}\`)
        .then(res => res.json())
        .then(data => {
          if (data.societe) {
            setClientNom(data.societe.nom || "");
            setClientAdresse(data.societe.adresse || "");
            setClientLocalisation(data.societe.localisation || "");
            setClientContact(data.societe.contact || "");
            setClientTelephone(data.societe.telephone || "");
          }
          if (data.equipe) {
            setEquipeNom(data.equipe.nom_chauffeur || "");
            setEquipeVehicule(data.equipe.vehicule || "");
          }
          setDatePrevue(data.date_prevue || "");
          setHeureDepart(data.heure_depart_prevue || "");
          setHeureDebut(data.heure_debut_prevue || "");
          setTypeTravail(data.type_travail || "");
          setMetrage(data.metrage || "");
          setCout(data.cout ? String(data.cout) : "");
          setDescription(data.description || "");
          setInstructions(data.instructions || "");
          setPriorite(data.priorite || "Normale");
        });
    }
  }, [id, isEditMode]);
`;

code = code.replace(funcStart, funcStart + injectStr);

code = code.replace(/Nouvelle Fiche d'Intervention/g, '{isEditMode ? "Modifier la fiche" : "Nouvelle Fiche d\'Intervention"}');
code = code.replace(/Créer la fiche/g, '{isEditMode ? "Enregistrer les modifications" : "Créer la fiche"}');

// change fetch method
code = code.replace(/method: "POST",/g, 'method: isEditMode ? "PATCH" : "POST",');
code = code.replace(/fetch\("\/api\/fiches"/g, 'fetch(isEditMode ? `/api/fiches/${id}` : "/api/fiches"');

fs.writeFileSync('src/pages/CreateFiche.tsx', code);
