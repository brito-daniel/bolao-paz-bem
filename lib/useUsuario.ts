"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Usuario } from "@/lib/tipos";

/** Lê o usuário identificado (localStorage) e manda de volta para a home se não houver nenhum. */
export function useUsuario(): Usuario | null {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    const bruto = localStorage.getItem("bolao_usuario");
    if (!bruto) {
      router.replace("/");
      return;
    }
    // localStorage não existe durante o SSR — sincronizar em efeito é o padrão correto aqui.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUsuario(JSON.parse(bruto) as Usuario);
  }, [router]);

  return usuario;
}
