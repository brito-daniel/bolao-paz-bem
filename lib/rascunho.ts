const CHAVE_RASCUNHO = "bolao_rascunho";

export interface EscolhaComTurno {
  candidatoId: number;
  turno: 1 | 2;
}

export interface EscolhasEstado {
  governador?: EscolhaComTurno;
  senador1?: number; // candidatoId — 1ª escolha (mais votado)
  senador2?: number; // candidatoId — 2ª escolha
}

export interface RascunhoPitaco {
  presidente?: EscolhaComTurno;
  porEstado: Record<string, EscolhasEstado>;
}

function rascunhoVazio(): RascunhoPitaco {
  return { porEstado: {} };
}

export function lerRascunho(): RascunhoPitaco {
  if (typeof window === "undefined") return rascunhoVazio();
  try {
    const bruto = localStorage.getItem(CHAVE_RASCUNHO);
    return bruto ? (JSON.parse(bruto) as RascunhoPitaco) : rascunhoVazio();
  } catch {
    return rascunhoVazio();
  }
}

export function salvarRascunho(rascunho: RascunhoPitaco) {
  localStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(rascunho));
}

export function limparRascunho() {
  localStorage.removeItem(CHAVE_RASCUNHO);
}

export function definirPresidente(escolha: EscolhaComTurno) {
  const rascunho = lerRascunho();
  rascunho.presidente = escolha;
  salvarRascunho(rascunho);
}

export function definirEstado(uf: string, escolhas: EscolhasEstado) {
  const rascunho = lerRascunho();
  rascunho.porEstado[uf] = { ...rascunho.porEstado[uf], ...escolhas };
  salvarRascunho(rascunho);
}
