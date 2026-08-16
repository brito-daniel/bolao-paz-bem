/**
 * Importa candidaturas de um CSV no layout do TSE (consulta_cand) para a
 * tabela `candidatos`. Aceita tanto o ZIP oficial do TSE (';', ISO-8859-1)
 * quanto exports derivados em UTF-8/vírgula — delimitador e encoding são
 * detectados automaticamente a partir do cabeçalho.
 *
 * Uso: npx tsx scripts/import-candidatos.ts [caminho-do-csv]
 * Padrão: scripts/mock-candidatos.csv
 */
import { readFileSync } from "node:fs";
import { parse } from "csv-parse/sync";
import { sql } from "drizzle-orm";
import { db } from "../db/client";
import { candidatos, type cargoEnum } from "../db/schema";

type Cargo = (typeof cargoEnum.enumValues)[number];

const CARGOS_SUPORTADOS: Record<string, Cargo> = {
  PRESIDENTE: "presidente",
  GOVERNADOR: "governador",
  SENADOR: "senador",
};

interface LinhaTse {
  DS_CARGO: string;
  SG_UF: string;
  SQ_CANDIDATO: string;
  NR_CANDIDATO: string;
  NM_URNA_CANDIDATO: string;
  SG_PARTIDO: string;
}

function detectarEncoding(caminho: string): "utf-8" | "latin1" {
  const buffer = readFileSync(caminho);
  const decoder = new TextDecoder("utf-8", { fatal: true });
  try {
    decoder.decode(buffer);
    return "utf-8";
  } catch {
    return "latin1"; // ZIP oficial do TSE vem em ISO-8859-1
  }
}

function detectarDelimitador(primeiraLinha: string): ";" | "," {
  return primeiraLinha.split(";").length >= primeiraLinha.split(",").length ? ";" : ",";
}

function main() {
  const caminho = process.argv[2] ?? "scripts/mock-candidatos.csv";
  const encoding = detectarEncoding(caminho);
  const conteudo = readFileSync(caminho, encoding);
  const delimiter = detectarDelimitador(conteudo.slice(0, conteudo.indexOf("\n")));

  console.log(`Lendo ${caminho} como ${encoding}, delimitador "${delimiter}".`);

  const linhas: LinhaTse[] = parse(conteudo, {
    columns: true,
    delimiter,
    trim: true,
    skip_empty_lines: true,
  });

  const candidatosParaImportar = linhas
    .map((linha) => {
      const cargo = CARGOS_SUPORTADOS[linha.DS_CARGO?.toUpperCase()];
      if (!cargo) return null; // fora de escopo (deputado, prefeito, vereador, etc.)

      return {
        sqCandidato: linha.SQ_CANDIDATO,
        cargo,
        estado: cargo === "presidente" ? null : linha.SG_UF,
        nomeUrna: linha.NM_URNA_CANDIDATO,
        partido: linha.SG_PARTIDO,
        numero: Number(linha.NR_CANDIDATO),
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  if (candidatosParaImportar.length === 0) {
    console.log("Nenhum candidato de presidente/governador/senador encontrado no CSV.");
    return;
  }

  return db
    .insert(candidatos)
    .values(candidatosParaImportar)
    .onConflictDoUpdate({
      target: candidatos.sqCandidato,
      set: {
        cargo: sql`excluded.cargo`,
        estado: sql`excluded.estado`,
        nomeUrna: sql`excluded.nome_urna`,
        partido: sql`excluded.partido`,
        numero: sql`excluded.numero`,
      },
    })
    .then(() => {
      console.log(
        `Importados/atualizados ${candidatosParaImportar.length} candidatos ` +
          `(de ${linhas.length} linhas lidas) a partir de ${caminho}.`,
      );
      process.exit(0);
    });
}

main()?.catch((erro) => {
  console.error("Falha ao importar candidatos:", erro);
  process.exit(1);
});
