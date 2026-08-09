# Briefing Técnico — Bolão Paz & Bem (Eleições 2026)

## 1. Visão Geral

Site público para um bolão de apostas ("pitacos") sobre os resultados das Eleições Gerais de 2026 no Brasil, para cargos majoritários: **Presidente**, **Governador** (por estado) e **Senador** (2 vagas por estado).

Não há sistema de login/autenticação. A identificação do usuário é feita apenas pelo nome, no momento do registro do pitaco.

**Escala esperada:** grupo pequeno, até ~30 participantes.
**Orçamento:** zero — usar apenas serviços com tier gratuito.

## 2. Calendário Eleitoral 2026 (referência oficial TSE)

| Data | Evento |
|---|---|
| até 15/ago/2026 | Registro de candidaturas encerrado — dados de candidaturas ficam disponíveis para consulta |
| **4 de outubro de 2026** | 1º turno das eleições |
| **25 de outubro de 2026** | 2º turno (eventual, apenas Presidente e Governador) |

Esses marcos definem os "gatilhos" de fase do sistema:
- **Prazo de registro dos pitacos: até 10 de setembro de 2026** (definido pelo organizador, com folga antes da eleição)
- Resultado parcial (1º turno) é apurado após 4/out
- Resultado final é apurado após 25/out (ou imediatamente após 4/out, para estados/cargos sem 2º turno)

## 3. Arquitetura Recomendada

| Camada | Ferramenta | Motivo |
|---|---|---|
| Frontend + Backend | **Next.js**, hospedado na **Vercel** (free tier) | Full-stack em um projeto só, deploy simples, gratuito para esse volume |
| Banco de dados | **Supabase (Postgres)**, free tier | Modelo relacional se encaixa bem nas regras de pontuação (turnos, ordem de senadores); free tier generoso para 30 usuários |
| Identificação de usuário | Apenas nome (sem login) | Conforme definido — não há necessidade de autenticação |
| Integridade dos dados | Edição travada após salvar | Ao salvar o pitaco, o registro fica definitivo (constraint no banco + validação no backend); sem tela de edição posterior |

Não há necessidade de servidor dedicado, autenticação de terceiros (OAuth) ou infraestrutura paga em nenhuma etapa deste projeto.

## 4. Modelo de Dados (proposta inicial)

**`candidatos`**
- id, cargo (presidente/governador/senador), estado (nulo para presidente), nome_urna, partido/coligação, numero

**`usuarios`**
- id, nome, criado_em

**`pitacos`**
- id, usuario_id, cargo, estado (nulo para presidente), candidato_id, turno_previsto (1º/2º — aplicável a presidente e governador), ordem_senador (1 ou 2 — aplicável apenas a senador), criado_em
- Constraint: um usuário só pode ter **um** registro definitivo por cargo/estado (sem permitir sobrescrever após salvo)

**`resultados_oficiais`**
- id, cargo, estado, candidato_id, turno_eleito (1º/2º), posição (para senadores eleitos)
- Preenchido manualmente ou via importação de dados do TSE após a apuração

## 5. Fluxos e Telas

### 5.1 Registro do Pitaco
1. Tela inicial: campo de nome (identificação do usuário)
2. Navegação por página/região, seguindo a lógica do TSE:
   - **Nacional** → Presidente (candidato + 1º ou 2º turno)
   - **Por região** → cada estado da região:
     - Governador (candidato + 1º ou 2º turno)
     - Senador 1 (candidato)
     - Senador 2 (candidato)
3. Tela de revisão final: mostra todos os pitacos escolhidos antes de confirmar
4. Confirmação → grava no banco como **definitivo** (sem edição posterior)

### 5.2 Visualização dos Pitacos
- **Durante o prazo de registro:** mostrar apenas a lista de quem já registrou (sem detalhes)
- **Após o encerramento do prazo:**
  - Lista de participantes com pitacos detalhados de cada um
  - Visão agregada: candidato mais escolhido em cada cargo/estado ("eleitos" pela galera)

### 5.3 Resultados (após apuração)
- Pódium com os 3 primeiros colocados
- Ranking geral por pontuação
- Detalhamento por usuário: o que acertou e o que errou, pitaco a pitaco

## 6. Regras de Pontuação

| Cargo | Pontuação base | Bônus |
|---|---|---|
| **Presidente** | 100 pontos (acertar o candidato eleito) | +50 pontos se também acertar o turno em que foi eleito |
| **Governador** | 50 pontos (por estado, acertar o candidato eleito) | +25 pontos se também acertar o turno em que foi eleito |
| **Senador** | 50 pontos por acertar um senador de fato eleito (independente da ordem escolhida) | +10 pontos se acertar também a posição/ordem (Senador 1 vs Senador 2) |

Observações importantes para a lógica de cálculo:
- Bônus de turno só é concedido a quem **acertou o candidato vencedor**
- Senador não tem 2º turno — apenas Presidente e Governador
- Para Senador, cada estado elege 2 — o usuário indica 2 nomes em ordem; a pontuação de 50 pontos vale por *cada* senador correto, então o máximo por estado é 100 (+20 de bônus de ordem, se acertar as duas posições)

## 7. Fonte dos Dados (TSE)

- **Candidaturas:** disponibilizadas pelo TSE via dados abertos (DivulgaCandContas) após o fim do registro de candidaturas (~15/ago/2026). Usadas para alimentar as listas de seleção no formulário de pitacos.
- **Resultados:** disponibilizados pelo TSE via dados abertos/apuração após 4/out (1º turno) e 25/out (2º turno). Usados para comparar com os pitacos e calcular a pontuação.
- **Confirmado: importação 100% manual**, tanto de candidaturas quanto de resultados. Não haverá integração automática com API/dados do TSE nesta versão. O organizador baixa o CSV do site do TSE e importa para o Supabase (via script simples ou upload direto).

## 8. Fora de Escopo (v1)

- Login/autenticação de usuários
- Edição de pitacos após confirmação
- Deputados federais/estaduais (fora do escopo do bolão)
- Integração automática com API do TSE (candidaturas e resultados entram via importação manual de CSV)

## 9. Roadmap de Implementação Sugerido

1. **Setup do projeto:** Next.js + Vercel + Supabase (schema inicial do banco)
2. **Importação de candidaturas:** script/rotina para carregar CSV de candidaturas no Supabase
3. **Tela de registro de pitacos:** formulário por região/estado, com revisão final e gravação definitiva
4. **Tela de pitacos registrados:** lista simples (fase 1) → detalhada + agregada (fase 2, pós-prazo)
5. **Importação de resultados oficiais:** rotina para carregar CSV de resultados após a apuração
6. **Cálculo de pontuação e tela de resultados:** pódium, ranking, detalhamento por usuário
7. **Ajustes de UI/UX e testes com o grupo antes do prazo de registro fechar**
