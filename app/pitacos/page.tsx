import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { PRAZO_REGISTRO_PITACOS } from "@/lib/deadlines";

interface ParticipanteRow {
  nome: string;
}

export default async function PitacosPage() {
  const prazoEncerrado = new Date() >= PRAZO_REGISTRO_PITACOS;

  const { data, error } = await supabase.from("pitacos").select("usuario_id, usuarios(nome)");

  const participantes = error
    ? []
    : Array.from(
        new Map(
          (data ?? [])
            .filter((p): p is typeof p & { usuarios: ParticipanteRow } => Boolean(p.usuarios))
            .map((p) => [p.usuario_id, p.usuarios]),
        ).values(),
      ).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-16">
      <Link href="/" className="text-sm text-slate-500">
        ← Voltar
      </Link>
      <h1 className="text-2xl font-bold">Pitacos registrados</h1>

      {error && (
        <p className="text-sm text-red-600">
          Não deu para carregar a lista agora. Tenta recarregar a página.
        </p>
      )}

      {!error && prazoEncerrado && (
        <p className="text-slate-600">
          O prazo de registro encerrou. O detalhamento por participante e a visão agregada chegam
          em breve.
        </p>
      )}

      {!error && !prazoEncerrado && (
        <>
          <p className="text-slate-600">
            {participantes.length === 0
              ? "Ninguém registrou pitaco ainda — seja o primeiro."
              : `${participantes.length} ${participantes.length === 1 ? "pessoa já registrou" : "pessoas já registraram"} o pitaco. Os detalhes de cada um só aparecem depois do prazo.`}
          </p>
          <ul className="flex flex-col gap-2">
            {participantes.map((p) => (
              <li key={p.nome} className="rounded-md border border-slate-200 px-4 py-2">
                {p.nome}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
