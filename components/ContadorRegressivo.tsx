"use client";

import { useEffect, useState } from "react";
import { calcularTempoRestante } from "@/lib/countdown";
import { PRAZO_REGISTRO_PITACOS } from "@/lib/deadlines";

export function ContadorRegressivo() {
  const [tempo, setTempo] = useState(() => calcularTempoRestante(PRAZO_REGISTRO_PITACOS));

  useEffect(() => {
    const intervalo = setInterval(() => {
      setTempo(calcularTempoRestante(PRAZO_REGISTRO_PITACOS));
    }, 1000);
    return () => clearInterval(intervalo);
  }, []);

  if (tempo.encerrado) {
    return (
      <p className="rounded-md bg-amber-100 px-4 py-2 font-medium text-amber-900">
        O prazo para registrar pitacos foi encerrado.
      </p>
    );
  }

  const unidades = [
    { valor: tempo.dias, rotulo: "dias" },
    { valor: tempo.horas, rotulo: "horas" },
    { valor: tempo.minutos, rotulo: "min" },
    { valor: tempo.segundos, rotulo: "seg" },
  ];

  return (
    <div className="flex items-center gap-3">
      {unidades.map((u) => (
        <div key={u.rotulo} className="flex flex-col items-center rounded-md bg-slate-100 px-3 py-2 min-w-16">
          <span className="text-xl font-bold tabular-nums">{u.valor}</span>
          <span className="text-xs text-slate-500">{u.rotulo}</span>
        </div>
      ))}
    </div>
  );
}
