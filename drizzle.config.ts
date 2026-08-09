import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// dotenv/config só carrega .env por padrão — o Next.js carrega .env.local
// automaticamente, mas scripts fora do Next (drizzle-kit, tsx) precisam disso explícito.
config({ path: ".env.local" });

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
