export type UserRole = 'guest' | 'admin';
export type RsvpStatus = 'pending' | 'yes' | 'no';

export const LINKS_TO_COUPLE = [
  'Famille de Joelson',
  'Famille de Marjorie',
  'Ami(e)s',
  'Collègues',
  'Autres',
] as const;
export type LinkToCouple = (typeof LINKS_TO_COUPLE)[number];

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  linkToCouple: LinkToCouple;
  profilePhoto: string | null;
  rsvpStatus: RsvpStatus;
}
