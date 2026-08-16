/**
 * Relatório legível dos pitacos já registrados — pra conferência manual do organizador.
 * Uso: npm run ver:pitacos
 */
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { pitacos, usuarios, candidatos } from "../db/schema";

async function main() {
  const linhas = await db
    .select({
      usuarioNome: usuarios.nome,
      cargo: pitacos.cargo,
      estado: pitacos.estado,
      candidatoNome: candidatos.nomeUrna,
      turno: pitacos.turnoPrevisto,
      ordemSenador: pitacos.ordemSenador,
      criadoEm: pitacos.criadoEm,
    })
    .from(pitacos)
    .innerJoin(usuarios, eq(pitacos.usuarioId, usuarios.id))
    .innerJoin(candidatos, eq(pitacos.candidatoId, candidatos.id))
    .orderBy(usuarios.nome, pitacos.cargo, pitacos.estado, pitacos.ordemSenador);

  if (linhas.length === 0) {
    console.log("Nenhum pitaco registrado ainda.");
    return;
  }

  const porUsuario = new Map<string, typeof linhas>();
  for (const linha of linhas) {
    const lista = porUsuario.get(linha.usuarioNome) ?? [];
    lista.push(linha);
    porUsuario.set(linha.usuarioNome, lista);
  }

  console.log(`${porUsuario.size} participante(s) registraram pitaco:\n`);

  for (const [nome, escolhas] of porUsuario) {
    const dataRegistro = escolhas[0].criadoEm?.toLocaleString("pt-BR") ?? "?";
    console.log(`— ${nome} (registrado em ${dataRegistro})`);
    for (const e of escolhas) {
      if (e.cargo === "presidente") {
        console.log(`   Presidente: ${e.candidatoNome} — ${e.turno}º turno`);
      } else if (e.cargo === "governador") {
        console.log(`   Governador ${e.estado}: ${e.candidatoNome} — ${e.turno}º turno`);
      } else {
        console.log(`   Senador ${e.estado} (${e.ordemSenador}ª escolha): ${e.candidatoNome}`);
      }
    }
    console.log("");
  }
}

main()
  .then(() => process.exit(0))
  .catch((erro) => {
    console.error("Falha ao consultar pitacos:", erro);
    process.exit(1);
  });
