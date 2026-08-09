import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// dotenv/config só carrega .env por padrão — precisamos de .env.local (mesmo padrão do Next.js).
config({ path: ".env.local" });

/**
 * Client Drizzle direto no Postgres (via DATABASE_URL), usado pelos scripts
 * de importação que rodam fora do Next.js (server-side, com service role/DB owner).
 * Componentes da aplicação devem usar lib/supabase.ts em vez deste client.
 */
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL não configurada");
}

const client = postgres(connectionString, { max: 1 });
export const db = drizzle(client, { schema });
