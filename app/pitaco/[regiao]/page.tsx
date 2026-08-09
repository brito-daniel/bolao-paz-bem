"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useUsuario } from "@/lib/useUsuario";
import { lerRascunho } from "@/lib/rascunho";
import { NOME_REGIAO, NOME_ESTADO, UF_PARA_REGIAO, REGIOES, type Regiao } from "@/lib/regioes";

function estadoCompleto(rascunho: ReturnType<typeof lerRascunho>, uf: string) {
  const e = rascunho.porEstado[uf];
  return Boolean(e?.governador && e.senador1 && e.senador2);
}

export default function RegiaoPage() {
  const usuario = useUsuario();
  const router = useRouter();
  const params = useParams<{ regiao: string }>();
  const regiao = params.regiao as Regiao;
  const [estados, setEstados] = useState<string[]>([]);
  const [rascunho, setRascunho] = useState(lerRascunho());
  const [erroCarregamento, setErroCarregamento] = useState(false);

  useEffect(() => {
    if (!REGIOES.includes(regiao)) {
      router.replace("/pitaco");
      return;
    }
    // localStorage não existe durante o SSR — sincronizar em efeito é o padrão correto aqui.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRascunho(lerRascunho());

    async function carregar() {
      try {
        const { data } = await supabase.from("candidatos").select("estado").eq("cargo", "governador");
        const doEstado = [...new Set((data ?? []).map((c) => c.estado as string))].filter(
          (uf) => UF_PARA_REGIAO[uf] === regiao,
        );
        setEstados(doEstado.sort());
      } catch {
        setErroCarregamento(true);
      }
    }
    carregar();
  }, [regiao, router]);

  if (!usuario || !REGIOES.includes(regiao)) return null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-16">
      <Link href="/pitaco" className="text-sm text-slate-500">
        ← Voltar
      </Link>
      <h1 className="text-2xl font-bold">{NOME_REGIAO[regiao]}</h1>
      {erroCarregamento && (
        <p className="text-sm text-red-600">
          Não deu para carregar os estados. Confira a conexão com o Supabase e recarregue a página.
        </p>
      )}
      <div className="flex flex-col gap-2">
        {estados.map((uf) => (
          <Link
            key={uf}
            href={`/pitaco/${regiao}/${uf.toLowerCase()}`}
            className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-3 hover:border-slate-900"
          >
            <span>{NOME_ESTADO[uf]}</span>
            <span className="text-sm">
              {estadoCompleto(rascunho, uf) ? (
                <span className="text-emerald-600">✓ completo</span>
              ) : (
                <span className="text-slate-400">pendente</span>
              )}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
