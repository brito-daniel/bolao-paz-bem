const LINHAS = [
  { cargo: "Presidente", base: "100 pontos (candidato eleito)", bonus: "+50 se acertar o turno da eleição" },
  { cargo: "Governador", base: "50 pontos por estado (candidato eleito)", bonus: "+25 se acertar o turno da eleição" },
  {
    cargo: "Senador",
    base: "50 pontos por senador eleito acertado (não importa a ordem)",
    bonus: "+10 por posição certa (Senador 1 vs. Senador 2)",
  },
];

export function TabelaPontuacao() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-slate-500">
            <th className="py-2 pr-4">Cargo</th>
            <th className="py-2 pr-4">Pontuação base</th>
            <th className="py-2">Bônus</th>
          </tr>
        </thead>
        <tbody>
          {LINHAS.map((linha) => (
            <tr key={linha.cargo} className="border-b last:border-0">
              <td className="py-2 pr-4 font-medium">{linha.cargo}</td>
              <td className="py-2 pr-4">{linha.base}</td>
              <td className="py-2">{linha.bonus}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-slate-500">
        Bônus de turno só vale para quem acertou o candidato vencedor. Senador não tem 2º turno.
        Para Senador, o máximo por estado é 100 pontos base + 20 de bônus de ordem.
      </p>
    </div>
  );
}
