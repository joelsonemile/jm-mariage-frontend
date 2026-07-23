export interface CommitteeMember {
  _id: string;
  nom: string;
  role: string;
  commission: string;
}

export const COMMITTEE_COMMISSIONS = [
  'Cuisine',
  'Déco',
  'Logistique',
  'Accueil',
  'Intercession',
  'Multimédia',
  'Gestion des invités',
  'Autres',
] as const;
