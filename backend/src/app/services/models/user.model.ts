export interface User {
  id: number;
  nom: string;
  email: string;
  age: number;
  poids: number;
  taille: number;
  sexe: Gender;
  created_at?: Date;
}

type Gender = 'male' | 'female';
