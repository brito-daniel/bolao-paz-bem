"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useUsuario } from "@/lib/useUsuario";
import { lerRascunho, limparRascunho, type RascunhoPitaco } from "@/lib/rascunho";
import { NOME_ESTADO } from "@/lib/regioes";
import type { Candidato } from "@/lib/tipos";

export default function RevisaoPage() {
  const usuario = useUsuario();
  const [rascunho, setRascunho] = useState<RascunhoPitaco>({ porEstado: {} });
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [estadosEsperados, setEstadosEsperados] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [erroCarregamento, setErroCarregamento] = useState(false);
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    // localStorage não existe durante o SSR — sincronizar em efeito é o padrão correto aqui.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRascunho(lerRascunho());
    async function carregar() {
      try {
        const { data } = await supabase.from("candidatos").select("*");
        setCandidatos(data ?? []);
        const estados = [...new Set((data ?? []).filter((c) => c.cargo === "governador").map((c) => c.estado as string))];
        setEstadosEsperados(estados.sort());
      } catch {
        setErroCarregamento(true);
      }
    }
    carregar();
  }, []);

  const nomeCandidato = (id: number | undefined) =>
    id ? (candidatos.find((c) => c.id === id)?.nome_urna ?? "?") : undefined;

  const completo = useMemo(() => {
    if (!rascunho.presidente || estadosEsperados.length === 0) return false;
    return estadosEsperados.every((uf) => {
      const e = rascunho.porEstado[uf];
      return Boolean(e?.governador && e.senador1 && e.senador2);
    });
  }, [rascunho, estadosEsperados]);

  async function confirmar() {
    if (!usuario || !completo) return;
    setEnviando(true);
    setErro(null);

    const linhas: Record<string, unknown>[] = [
      {
        usuario_id: usuario.id,
        cargo: "presidente",
        estado: null,
        candidato_id: rascunho.presidente!.candidatoId,
        turno_previsto: rascunho.presidente!.turno,
        ordem_senador: null,
      },
    ];

    for (const uf of estadosEsperados) {
      const e = rascunho.porEstado[uf]!;
      linhas.push({
        usuario_id: usuario.id,
        cargo: "governador",
        estado: uf,
        candidato_id: e.governador!.candidatoId,
        turno_previsto: e.governador!.turno,
        ordem_senador: null,
      });
      linhas.push({
        usuario_id: usuario.id,
        cargo: "senador",
        estado: uf,
        candidato_id: e.senador1!,
        turno_previsto: null,
        ordem_senador: 1,
      });
      linhas.push({
        usuario_id: usuario.id,
        cargo: "senador",
        estado: uf,
        candidato_id: e.senador2!,
        turno_previsto: null,
        ordem_senador: 2,
      });
    }

    const { error } = await supabase.from("pitacos").insert(linhas);
    setEnviando(false);

    if (error) {
      if (error.code === "23505") {
        setErro("Você já registrou seu pitaco antes — não é possível enviar de novo.");
      } else {
        setErro("Não deu para salvar seu pitaco agora. Tenta de novo em instantes.");
      }
      return;
    }

    limparRascunho();
    setEnviado(true);
  }

  function baixarComprovante() {
    if (!usuario) return;

    const linhas = ["Cargo;Estado;Candidato;Turno previsto;Ordem do senador"];
    if (rascunho.presidente) {
      linhas.push(`Presidente;;${nomeCandidato(rascunho.presidente.candidatoId)};${rascunho.presidente.turno}º turno;`);
    }
    for (const uf of estadosEsperados) {
      const e = rascunho.porEstado[uf];
      if (!e) continue;
      if (e.governador) {
        linhas.push(`Governador;${uf};${nomeCandidato(e.governador.candidatoId)};${e.governador.turno}º turno;`);
      }
      if (e.senador1) linhas.push(`Senador;${uf};${nomeCandidato(e.senador1)};;1`);
      if (e.senador2) linhas.push(`Senador;${uf};${nomeCandidato(e.senador2)};;2`);
    }

    // BOM no início ajuda o Excel a abrir os acentos corretamente.
    const conteudo = "﻿" + linhas.join("\n");
    const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pitaco-${usuario.nome.trim().replace(/\s+/g, "-").toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!usuario) return null;

  if (enviado) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4 px-6 py-16">
        <h1 className="text-2xl font-bold">Pitaco registrado!</h1>
        <p className="text-slate-600">
          Seu pitaco foi salvo como definitivo. Valeu, {usuario.nome} — boa sorte no bolão.
        </p>
        <button
          onClick={baixarComprovante}
          className="self-start rounded-md border border-slate-900 px-6 py-2 font-medium text-slate-900"
        >
          Baixar comprovante do meu pitaco (CSV)
        </button>
        <Link href="/" className="self-start rounded-md bg-slate-900 px-6 py-2 font-medium text-white">
          Voltar para a home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-16">
      <Link href="/pitaco" className="text-sm text-slate-500">
        ← Voltar
      </Link>
      <h1 className="text-2xl font-bold">Revisão do pitaco</h1>
      <p className="text-slate-600">
        Confira tudo antes de confirmar. Depois de enviado, não dá mais para editar.
      </p>

      {erroCarregamento && (
        <p className="text-sm text-red-600">
          Não deu para carregar os candidatos. Confira a conexão com o Supabase e recarregue a
          página.
        </p>
      )}

      <section className="flex flex-col gap-2 rounded-md border border-slate-200 p-4">
        <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">Presidente</span>
        {rascunho.presidente ? (
          <span>
            {nomeCandidato(rascunho.presidente.candidatoId)} — {rascunho.presidente.turno}º turno
          </span>
        ) : (
          <span className="text-slate-400">
            pendente — <Link href="/pitaco" className="underline">escolher</Link>
          </span>
        )}
      </section>

      {estadosEsperados.map((uf) => {
        const e = rascunho.porEstado[uf];
        return (
          <section key={uf} className="flex flex-col gap-2 rounded-md border border-slate-200 p-4">
            <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">
              {NOME_ESTADO[uf] ?? uf}
            </span>
            <div className="text-sm">
              Governador:{" "}
              {e?.governador ? (
                `${nomeCandidato(e.governador.candidatoId)} — ${e.governador.turno}º turno`
              ) : (
                <span className="text-slate-400">pendente</span>
              )}
            </div>
            <div className="text-sm">
              Senador 1: {e?.senador1 ? nomeCandidato(e.senador1) : <span className="text-slate-400">pendente</span>}
            </div>
            <div className="text-sm">
              Senador 2: {e?.senador2 ? nomeCandidato(e.senador2) : <span className="text-slate-400">pendente</span>}
            </div>
            {!(e?.governador && e.senador1 && e.senador2) && (
              <Link href="/pitaco" className="text-sm underline">
                completar {NOME_ESTADO[uf] ?? uf}
              </Link>
            )}
          </section>
        );
      })}

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <button
        onClick={confirmar}
        disabled={!completo || enviando}
        className="self-start rounded-md bg-slate-900 px-6 py-2 font-medium text-white disabled:opacity-50"
      >
        {enviando ? "Enviando..." : completo ? "Confirmar meu pitaco" : "Complete todas as escolhas para confirmar"}
      </button>
    </div>
  );
}
