"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useUsuario } from "@/lib/useUsuario";
import { lerRascunho, definirEstado, type EscolhaComTurno, type EscolhasEstado } from "@/lib/rascunho";
import { NOME_ESTADO } from "@/lib/regioes";
import type { Candidato } from "@/lib/tipos";

export default function EstadoPage() {
  const usuario = useUsuario();
  const params = useParams<{ regiao: string; estado: string }>();
  const uf = params.estado.toUpperCase();

  const [governadores, setGovernadores] = useState<Candidato[]>([]);
  const [senadores, setSenadores] = useState<Candidato[]>([]);
  const [escolhas, setEscolhas] = useState<EscolhasEstado>({});
  const [erro, setErro] = useState<string | null>(null);
  const [erroCarregamento, setErroCarregamento] = useState(false);

  useEffect(() => {
    const rascunho = lerRascunho();
    // localStorage não existe durante o SSR — sincronizar em efeito é o padrão correto aqui.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEscolhas(rascunho.porEstado[uf] ?? {});

    async function carregar() {
      try {
        const { data } = await supabase.from("candidatos").select("*").eq("estado", uf);
        setGovernadores((data ?? []).filter((c) => c.cargo === "governador").sort((a, b) => a.numero - b.numero));
        setSenadores((data ?? []).filter((c) => c.cargo === "senador").sort((a, b) => a.numero - b.numero));
      } catch {
        setErroCarregamento(true);
      }
    }
    carregar();
  }, [uf]);

  function salvar(parcial: EscolhasEstado) {
    const nova = { ...escolhas, ...parcial };
    setEscolhas(nova);
    definirEstado(uf, nova);
  }

  function atualizarGovernador(parcial: Partial<EscolhaComTurno>) {
    salvar({ governador: { ...escolhas.governador, ...parcial } as EscolhaComTurno });
  }

  function atualizarSenador(posicao: "senador1" | "senador2", candidatoId: number) {
    const outraPosicao = posicao === "senador1" ? "senador2" : "senador1";
    if (escolhas[outraPosicao] === candidatoId) {
      setErro("Escolha dois senadores diferentes.");
      return;
    }
    setErro(null);
    salvar({ [posicao]: candidatoId });
  }

  if (!usuario) return null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-16">
      <Link href={`/pitaco/${params.regiao}`} className="text-sm text-slate-500">
        ← Voltar
      </Link>
      <h1 className="text-2xl font-bold">{NOME_ESTADO[uf] ?? uf}</h1>
      {erroCarregamento && (
        <p className="text-sm text-red-600">
          Não deu para carregar os candidatos. Confira a conexão com o Supabase e recarregue a
          página.
        </p>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Governador</h2>
        <div className="flex flex-col gap-2">
          {governadores.map((c) => (
            <label
              key={c.id}
              className={`flex items-center justify-between rounded-md border px-4 py-3 cursor-pointer ${
                escolhas.governador?.candidatoId === c.id ? "border-slate-900" : "border-slate-200"
              }`}
            >
              <span>
                <span className="font-medium">{c.nome_urna}</span>{" "}
                <span className="text-sm text-slate-500">
                  {c.numero} — {c.partido}
                </span>
              </span>
              <input
                type="radio"
                name="governador"
                checked={escolhas.governador?.candidatoId === c.id}
                onChange={() => atualizarGovernador({ candidatoId: c.id })}
              />
            </label>
          ))}
        </div>
        {escolhas.governador?.candidatoId && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">Em que turno ele(a) vence?</span>
            {([1, 2] as const).map((turno) => (
              <label key={turno} className="flex items-center gap-1 text-sm">
                <input
                  type="radio"
                  name="turno-governador"
                  checked={escolhas.governador?.turno === turno}
                  onChange={() => atualizarGovernador({ turno })}
                />
                {turno}º turno
              </label>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide">
          Senadores (2 vagas)
        </h2>
        {erro && <p className="text-sm text-red-600">{erro}</p>}
        {(["senador1", "senador2"] as const).map((posicao, i) => (
          <div key={posicao} className="flex flex-col gap-2">
            <span className="text-sm text-slate-600">{i + 1}ª escolha (mais votado primeiro)</span>
            <div className="flex flex-col gap-2">
              {senadores.map((c) => (
                <label
                  key={c.id}
                  className={`flex items-center justify-between rounded-md border px-4 py-3 cursor-pointer ${
                    escolhas[posicao] === c.id ? "border-slate-900" : "border-slate-200"
                  }`}
                >
                  <span>
                    <span className="font-medium">{c.nome_urna}</span>{" "}
                    <span className="text-sm text-slate-500">
                      {c.numero} — {c.partido}
                    </span>
                  </span>
                  <input
                    type="radio"
                    name={posicao}
                    checked={escolhas[posicao] === c.id}
                    onChange={() => atualizarSenador(posicao, c.id)}
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
      </section>

      <Link
        href={`/pitaco/${params.regiao}`}
        className="self-start rounded-md bg-slate-900 px-6 py-2 font-medium text-white"
      >
        Salvar e voltar
      </Link>
    </div>
  );
}
