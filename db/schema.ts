import { sql } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const cargoEnum = pgEnum("cargo", ["presidente", "governador", "senador"]);

export const candidatos = pgTable("candidatos", {
  id: serial("id").primaryKey(),
  // SQ_CANDIDATO do TSE — identifica o candidato de forma estável entre reimportações do CSV.
  sqCandidato: text("sq_candidato").notNull().unique(),
  cargo: cargoEnum("cargo").notNull(),
  estado: varchar("estado", { length: 2 }), // null para presidente
  nomeUrna: text("nome_urna").notNull(),
  partido: text("partido").notNull(),
  numero: integer("numero").notNull(),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export const usuarios = pgTable(
  "usuarios",
  {
    id: serial("id").primaryKey(),
    nome: text("nome").notNull(),
    criadoEm: timestamp("criado_em").notNull().defaultNow(),
  },
  (table) => [
    // Nome é a única identificação do usuário (sem login) — evita duas identidades por variação de maiúsculas.
    uniqueIndex("usuarios_nome_lower_idx").on(sql`lower(${table.nome})`),
  ],
);

export const pitacos = pgTable("pitacos", {
  id: serial("id").primaryKey(),
  usuarioId: integer("usuario_id")
    .notNull()
    .references(() => usuarios.id),
  cargo: cargoEnum("cargo").notNull(),
  estado: varchar("estado", { length: 2 }), // null para presidente
  candidatoId: integer("candidato_id")
    .notNull()
    .references(() => candidatos.id),
  turnoPrevisto: smallint("turno_previsto"), // 1 ou 2 — presidente/governador
  ordemSenador: smallint("ordem_senador"), // 1 ou 2 — apenas senador
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
  // Unicidade (usuario_id, cargo, estado, ordem_senador) e imutabilidade (sem UPDATE/DELETE)
  // são aplicadas via índice/trigger em SQL bruto na migration 0001 — ver db/migrations/.
  // Um unique() normal do Drizzle não bloqueia duplicatas aqui porque NULL != NULL em
  // estado/ordem_senador (presidente e governador têm essas colunas nulas com frequência).
});

export const resultadosOficiais = pgTable("resultados_oficiais", {
  id: serial("id").primaryKey(),
  cargo: cargoEnum("cargo").notNull(),
  estado: varchar("estado", { length: 2 }), // null para presidente
  candidatoId: integer("candidato_id")
    .notNull()
    .references(() => candidatos.id),
  turnoEleito: smallint("turno_eleito"), // 1 ou 2
  posicao: smallint("posicao"), // posição do senador eleito (1 ou 2)
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});
