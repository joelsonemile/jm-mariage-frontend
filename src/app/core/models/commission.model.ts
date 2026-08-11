export interface Commission {
  _id: string;
  nom: string;
  responsables: { _id: string; nom: string; role: string }[];
}
