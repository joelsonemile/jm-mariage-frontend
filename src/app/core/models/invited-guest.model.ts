export const INVITED_GUEST_CATEGORIES = [
  'Extérieur',
  'Chorale',
  'Membre de bureau',
  'Membre CP',
  'Église Grâce',
  'Accueil',
  'Cuisine',
  'Multimédia',
  'Serveur',
  'Autres',
] as const;
export type InvitedGuestCategory = (typeof INVITED_GUEST_CATEGORIES)[number];

export interface InvitedGuest {
  _id: string;
  nom: string;
  prenom: string;
  telephone: string;
  categorie: InvitedGuestCategory;
}
