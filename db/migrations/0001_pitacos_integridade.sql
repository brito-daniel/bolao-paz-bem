-- Unicidade real de (usuario_id, cargo, estado, ordem_senador).
-- Um UNIQUE constraint comum do Postgres não bloqueia duplicatas aqui porque
-- NULL nunca é igual a NULL: presidente tem estado/ordem_senador nulos, e
-- governador tem ordem_senador nulo — por isso usamos COALESCE num índice de expressão.
CREATE UNIQUE INDEX "pitacos_unico_idx" ON "pitacos" (
	"usuario_id",
	"cargo",
	COALESCE("estado", ''),
	COALESCE("ordem_senador", 0)
);
--> statement-breakpoint

-- Trava de imutabilidade: depois de salvo, um pitaco é definitivo.
-- Sem autenticação de usuário, a única garantia confiável é no nível do banco.
CREATE FUNCTION pitacos_bloquear_edicao() RETURNS trigger AS $$
BEGIN
	RAISE EXCEPTION 'pitacos não podem ser alterados ou removidos após salvos (registro %)', OLD.id;
	RETURN NULL;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint

CREATE TRIGGER pitacos_imutavel
	BEFORE UPDATE OR DELETE ON "pitacos"
	FOR EACH ROW EXECUTE FUNCTION pitacos_bloquear_edicao();
