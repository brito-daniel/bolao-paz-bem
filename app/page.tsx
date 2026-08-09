import Link from "next/link";
import { ContadorRegressivo } from "@/components/ContadorRegressivo";
import { TabelaPontuacao } from "@/components/TabelaPontuacao";
import { FormularioIdentificacao } from "@/components/FormularioIdentificacao";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Bolão Paz & Bem</h1>
        <p className="text-slate-600">
          Dá seu pitaco em quem vai ser eleito Presidente, Governador e Senador nas Eleições
          Gerais de 2026. Sem login: seu nome já identifica seu pitaco. Depois de confirmado, não
          dá mais para editar.
        </p>
      </header>

      <section className="flex flex-col gap-2 rounded-lg border border-slate-200 p-5">
        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide">
          Prazo para registrar seu pitaco
        </h2>
        <ContadorRegressivo />
        <p className="text-sm text-slate-500">até as 22h do dia 10 de setembro de 2026</p>
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-slate-200 p-5">
        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide">
          Regras de pontuação
        </h2>
        <TabelaPontuacao />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Começar</h2>
        <FormularioIdentificacao />
      </section>

      <Link href="/pitacos" className="self-start text-sm text-slate-500 underline">
        Ver quem já registrou pitaco
      </Link>
    </div>
  );
}
