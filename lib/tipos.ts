export type Cargo = "presidente" | "governador" | "senador";

export interface Candidato {
  id: number;
  cargo: Cargo;
  estado: string | null;
  nome_urna: string;
  partido: string;
  numero: number;
}

export interface Usuario {
  id: number;
  nome: string;
}
