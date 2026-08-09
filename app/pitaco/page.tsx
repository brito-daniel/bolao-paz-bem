"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useUsuario } from "@/lib/useUsuario";
import { lerRascunho, definirPresidente, type EscolhaComTurno } from "@/lib/rascunho";
import { NOME_REGIAO, NOME_ESTADO, UF_PARA_REGIAO, REGIOES, type Regiao } from "@/lib/regioes";
import type { Candidato } from "@/lib/tipos";

export default function PitacoPage() {
  const usuario = useUsuario();
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [estados, setEstados] = useState<string[]>([]);
  const [escolha, setEscolha] = useState<Partial<EscolhaComTurno>>({});
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState(false);

  useEffect(() => {
    const rascunho = lerRascunho();
    // localStorage não existe durante o SSR — sincronizar em efeito é o padrão correto aqui.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (rascunho.presidente) setEscolha(rascunho.presidente);

    async function carregar() {
      try {
        const [{ data: presidenciaveis }, { data: candidatosGovernador }] = await Promise.all([
          supabase.from("candidatos").select("*").eq("cargo", "presidente").order("numero"),
          supabase.from("candidatos").select("estado").eq("cargo", "governador"),
        ]);
        setCandidatos(presidenciaveis ?? []);
        setEstados([...new Set((candidatosGovernador ?? []).map((c) => c.estado as string))].sort());
      } catch {
        setErroCarregamento(true);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  function atualizar(parcial: Partial<EscolhaComTurno>) {
    const nova = { ...escolha, ...parcial };
    setEscolha(nova);
    if (nova.candidatoId && nova.turno) definirPresidente(nova as EscolhaComTurno);
  }

  const estadosPorRegiao = REGIOES.reduce<Record<Regiao, string[]>>(
    (acc, r) => {
      acc[r] = estados.filter((uf) => UF_PARA_REGIAO[uf] === r);
      return acc;
    },
    { norte: [], nordeste: [], "centro-oeste": [], sudeste: [], sul: [] },
  );

  if (!usuario) return null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-16">
      <div>
        <p className="text-sm text-slate-500">Registrando pitaco de</p>
        <h1 className="text-2xl font-bold">{usuario.nome}</h1>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide">
          Nacional — Presidente
        </h2>
        {carregando && <p className="text-slate-500">Carregando candidatos...</p>}
        {erroCarregamento && (
          <p className="text-sm text-red-600">
            Não deu para carregar os candidatos. Confira a conexão com o Supabase e recarregue a
            página.
          </p>
        )}
        <div className="flex flex-col gap-2">
          {candidatos.map((c) => (
            <label
              key={c.id}
              className={`flex items-center justify-between rounded-md border px-4 py-3 cursor-pointer ${
                escolha.candidatoId === c.id ? "border-slate-900" : "border-slate-200"
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
                name="presidente"
                checked={escolha.candidatoId === c.id}
                onChange={() => atualizar({ candidatoId: c.id })}
              />
            </label>
          ))}
        </div>

        {escolha.candidatoId && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">Em que turno ele(a) vence?</span>
            {([1, 2] as const).map((turno) => (
              <label key={turno} className="flex items-center gap-1 text-sm">
                <input
                  type="radio"
                  name="turno-presidente"
                  checked={escolha.turno === turno}
                  onChange={() => atualizar({ turno })}
                />
                {turno}º turno
              </label>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide">
          Por região — Governador e Senadores
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {REGIOES.filter((r) => estadosPorRegiao[r].length > 0).map((r) => (
            <Link
              key={r}
              href={`/pitaco/${r}`}
              className="rounded-md border border-slate-200 px-4 py-3 text-center hover:border-slate-900"
            >
              <div className="font-medium">{NOME_REGIAO[r]}</div>
              <div className="text-xs text-slate-500">
                {estadosPorRegiao[r].map((uf) => NOME_ESTADO[uf]).join(", ")}
              </div>
            </Link>
          ))}
        </div>
        {!carregando && estados.length === 0 && (
          <p className="text-sm text-slate-500">
            Nenhum candidato a governador importado ainda.
          </p>
        )}
      </section>

      <Link
        href="/pitaco/revisao"
        className="self-start rounded-md bg-slate-900 px-6 py-2 font-medium text-white"
      >
        Ir para revisão
      </Link>
    </div>
  );
}
