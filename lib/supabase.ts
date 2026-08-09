import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Client público (anon key) — leitura geral e escrita de usuarios/pitacos. */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Client com service role — só usar em server components/route handlers/scripts.
 * Ignora RLS; necessário para importar candidatos e resultados oficiais.
 */
export function createServiceRoleClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada");
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
