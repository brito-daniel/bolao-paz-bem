"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function FormularioIdentificacao() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(evento: React.FormEvent) {
    evento.preventDefault();
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) return;

    setCarregando(true);
    setErro(null);

    try {
      const { data: existente, error: erroBusca } = await supabase
        .from("usuarios")
        .select("id, nome")
        .ilike("nome", nomeLimpo)
        .maybeSingle();

      if (erroBusca) throw erroBusca;

      const usuario =
        existente ??
        (await (async () => {
          const { data, error } = await supabase
            .from("usuarios")
            .insert({ nome: nomeLimpo })
            .select("id, nome")
            .single();
          if (error) throw error;
          return data;
        })());

      localStorage.setItem("bolao_usuario", JSON.stringify(usuario));
      router.push("/pitaco");
    } catch {
      setErro("Não deu para registrar seu nome agora. Tenta de novo em instantes.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className="flex-1">
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Seu nome"
          className="w-full rounded-md border border-slate-300 px-4 py-2 outline-none focus:border-slate-500"
          maxLength={80}
          required
        />
        {erro && <p className="mt-1 text-sm text-red-600">{erro}</p>}
      </div>
      <button
        type="submit"
        disabled={carregando}
        className="rounded-md bg-slate-900 px-6 py-2 font-medium text-white disabled:opacity-50"
      >
        {carregando ? "Entrando..." : "Registrar meu pitaco"}
      </button>
    </form>
  );
}
