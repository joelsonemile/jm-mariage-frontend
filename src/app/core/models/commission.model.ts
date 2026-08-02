export interface Commission {
  _id: string;
  nom: string;
  responsable: { _id: string; nom: string; role: string } | null;
}
