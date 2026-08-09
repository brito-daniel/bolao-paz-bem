export interface TempoRestante {
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
  encerrado: boolean;
}

export function calcularTempoRestante(alvo: Date, agora: Date = new Date()): TempoRestante {
  const diffMs = alvo.getTime() - agora.getTime();

  if (diffMs <= 0) {
    return { dias: 0, horas: 0, minutos: 0, segundos: 0, encerrado: true };
  }

  const segundosTotais = Math.floor(diffMs / 1000);
  return {
    dias: Math.floor(segundosTotais / 86400),
    horas: Math.floor((segundosTotais % 86400) / 3600),
    minutos: Math.floor((segundosTotais % 3600) / 60),
    segundos: segundosTotais % 60,
    encerrado: false,
  };
}
