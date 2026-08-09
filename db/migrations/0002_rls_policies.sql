-- Sem autenticação: a anon key do Supabase é usada por todo mundo igual.
-- Leitura pública em tudo; escrita de anon liberada só em usuarios/pitacos
-- (identificação por nome + registro de pitaco). candidatos e resultados_oficiais
-- só são escritos pelos scripts de importação, que usam a service role key
-- (a service role sempre ignora RLS no Supabase, por isso não precisa de política própria).

ALTER TABLE "candidatos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "resultados_oficiais" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "usuarios" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pitacos" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

CREATE POLICY "candidatos_select_publico" ON "candidatos"
	FOR SELECT TO anon, authenticated USING (true);
--> statement-breakpoint

CREATE POLICY "resultados_oficiais_select_publico" ON "resultados_oficiais"
	FOR SELECT TO anon, authenticated USING (true);
--> statement-breakpoint

CREATE POLICY "usuarios_select_publico" ON "usuarios"
	FOR SELECT TO anon, authenticated USING (true);
--> statement-breakpoint

CREATE POLICY "usuarios_insert_publico" ON "usuarios"
	FOR INSERT TO anon, authenticated WITH CHECK (true);
--> statement-breakpoint

CREATE POLICY "pitacos_select_publico" ON "pitacos"
	FOR SELECT TO anon, authenticated USING (true);
--> statement-breakpoint

CREATE POLICY "pitacos_insert_publico" ON "pitacos"
	FOR INSERT TO anon, authenticated WITH CHECK (true);
-- Sem política de UPDATE/DELETE para anon: RLS nega por padrão.
-- O trigger pitacos_imutavel (migration 0001) é a segunda camada, válida mesmo para service role.
