export type UserRole = "admin" | "agent";

export type User = {
  id: string;
  username: string;
  nom_complet: string;
  role: UserRole;
  created_at?: string;
};

export type Societe = {
  id: string;
  nom: string;
  adresse: string;
  telephone: string;
  contact: string;
  localisation: string;
};

export type Equipe = {
  id: string;
  nom_chauffeur: string;
  vehicule: string;
};

export type FicheTravail = {
  id: string;
  numero: string;
  societe_id: string;
  equipe_id: string;
  date_prevue: string;
  heure_depart_prevue: string;
  heure_debut_prevue: string;
  heure_debut_reelle?: string;
  heure_fin_reelle?: string;
  type_travail: string;
  description: string;
  instructions: string;
  priorite: "Normale" | "Urgente" | "Très urgente";
  statut: "Brouillon" | "Planifiée" | "Affectée" | "En cours" | "Terminée" | "Annulée";
  observations_finales?: string;
  quantite_realisee?: string;
  societe?: Societe;
  equipe?: Equipe;
};

export type Facture = {
  id: string;
  numero: string;
  fiche_travail_id?: string | null;
  client_nom: string;
  client_adresse?: string;
  client_contact?: string;
  client_telephone?: string;
  date_facture: string;
  statut: "Brouillon" | "Validée" | "Envoyée" | "Payée" | "Annulée";
  total_ht: number;
  taux_tva: number;
  total_tva: number;
  total_ttc: number;
  lignes?: FactureLigne[];
  fiche?: FicheTravail | null;
};

export type FactureLigne = {
  id: string;
  facture_id: string;
  description: string;
  quantite: number;
  unite: string;
  prix_unitaire: number;
  total_ligne: number;
  type_facturation?: "forfait" | "horaire" | "metrage" | "unite" | "HOURLY" | "FIXED";
};

