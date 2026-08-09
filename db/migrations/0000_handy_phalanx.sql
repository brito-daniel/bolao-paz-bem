CREATE TYPE "public"."cargo" AS ENUM('presidente', 'governador', 'senador');--> statement-breakpoint
CREATE TABLE "candidatos" (
	"id" serial PRIMARY KEY NOT NULL,
	"sq_candidato" text NOT NULL,
	"cargo" "cargo" NOT NULL,
	"estado" varchar(2),
	"nome_urna" text NOT NULL,
	"partido" text NOT NULL,
	"numero" integer NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "candidatos_sq_candidato_unique" UNIQUE("sq_candidato")
);
--> statement-breakpoint
CREATE TABLE "pitacos" (
	"id" serial PRIMARY KEY NOT NULL,
	"usuario_id" integer NOT NULL,
	"cargo" "cargo" NOT NULL,
	"estado" varchar(2),
	"candidato_id" integer NOT NULL,
	"turno_previsto" smallint,
	"ordem_senador" smallint,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resultados_oficiais" (
	"id" serial PRIMARY KEY NOT NULL,
	"cargo" "cargo" NOT NULL,
	"estado" varchar(2),
	"candidato_id" integer NOT NULL,
	"turno_eleito" smallint,
	"posicao" smallint,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pitacos" ADD CONSTRAINT "pitacos_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pitacos" ADD CONSTRAINT "pitacos_candidato_id_candidatos_id_fk" FOREIGN KEY ("candidato_id") REFERENCES "public"."candidatos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resultados_oficiais" ADD CONSTRAINT "resultados_oficiais_candidato_id_candidatos_id_fk" FOREIGN KEY ("candidato_id") REFERENCES "public"."candidatos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "usuarios_nome_lower_idx" ON "usuarios" USING btree (lower("nome"));