# Roadmap do Troqito

Documento de acompanhamento. Cada fase corresponde a uma branch e um Pull
Request. Uma fase só é marcada como concluída quando atende a todos os critérios
de conclusão descritos ao final deste arquivo.

**Legenda:** `[ ]` pendente · `[~]` em andamento · `[x]` concluído

## Situação atual

|                       |                                             |
| --------------------- | ------------------------------------------- |
| Versão                | `0.1.0` (em desenvolvimento, não publicada) |
| Fase em andamento     | Fase 24 — Sincronização                     |
| Última fase concluída | Fase 11 — Transferências                    |

As fases 12 a 23, 25, 27, 28 e 30 estão parcialmente entregues: o cálculo e as
telas principais existem e são cobertos por teste, e o que falta em cada uma
está listado abaixo, sempre com o motivo. O que depende de autenticação (Fase 5)
ou de sincronização (Fase 24) só entra depois delas.

## MVP (v0.1.0)

### Fase 0 — Pesquisa e documentação inicial `[x]`

Branch: `docs/project-research` · Depende de: —

- [x] Benchmark de aplicativos de referência (`docs/benchmark.md`)
- [x] Definição da arquitetura (`docs/architecture.md`)
- [x] Decisão de persistência, autenticação e sincronização
- [x] Decisão entre Expo e React Native CLI
- [x] Roadmap por fases
- [x] Escolha e aplicação da licença (AGPL-3.0-or-later)
- [x] README, CHANGELOG, CONTRIBUTING, SECURITY
- [x] Modelo de Pull Request

**Conclusão:** documentação revisada, PR aberto e mergeado, branch removida.

### Fase 1 — Fundação do projeto `[x]`

Branch: `feat/project-foundation` · Depende de: Fase 0

- [x] Projeto Expo SDK 57 com TypeScript estrito
- [x] ESLint, Prettier e scripts `lint`, `typecheck`, `test`, `format`
- [x] Jest com `jest-expo` e Testing Library
- [x] Estrutura de pastas por domínio
- [x] `app.config.ts` com estágios e `applicationId` por estágio
- [x] `.env.example` e carregamento tipado de variáveis de ambiente
- [x] GitHub Actions: instalação com cache, lint, typecheck, testes
- [x] Aplicativo executando com uma tela mínima

**Conclusão:** `npm run lint`, `npm run typecheck` e `npm test` passando; CI verde.

### Fase 2 — Tema e design system `[x]`

Branch: `feat/design-system` · Depende de: Fase 1

- [x] Tokens: cores, tipografia, espaçamento, raio, elevação
- [x] Paleta própria com cores semânticas, de receita, de despesa e de alerta
- [x] Tema claro, tema escuro e respeito ao tema do sistema
- [x] Componentes base: texto, botão, cartão, tela, skeleton e estados
- [x] Componentes de formulário: campo de texto, grupo de opções e campo de data
- [x] Estados: carregamento (skeleton), vazio e erro
- [x] Verificação de contraste WCAG AA por teste automatizado
- [x] Área de toque mínima de 48 pontos nos elementos interativos
- [x] Testes dos componentes base
- [ ] Conferir o recorte do ícone adaptativo em aparelho. O ícone atual usa a
      arte original como camada de frente; se a máscara circular cortar o gato,
      será preciso um asset de frente com a zona de segurança correta

### Fase 3 — Núcleo financeiro e banco local `[x]`

Branch: `feat/core-domain` · Depende de: Fase 2

- [x] `Money`: aritmética em centavos, divisão com distribuição de resto
- [x] Formatação pt-BR de moeda, data e período
- [x] Ciclo financeiro configurável a partir do dia de início
- [x] Identificadores UUID v7 gerados no dispositivo
- [x] Schema Drizzle das entidades principais
- [x] Migrations versionadas e execução na inicialização
- [x] Repositórios base e transações atômicas
- [x] Testes de arredondamento, divisão e calendário
- [ ] Testes de integração com SQLite em memória. Exigem um driver que rode
      fora do dispositivo, já que o `expo-sqlite` só existe em ambiente nativo

### Fase 4 — Navegação `[x]`

Branch: `feat/navigation` · Depende de: Fase 2

- [x] Barra inferior: Início, Movimentações, Adicionar, Planejamento, Perfil
- [x] Ação central de adicionar com escolha do tipo de lançamento
- [ ] Grupos de rota público e autenticado — entram com a autenticação, que
      depende das credenciais do Supabase
- [ ] Proteção de rotas e redirecionamento — mesma dependência
- [ ] Deep linking preparado para convites de casa

### Fase 5 — Autenticação `[ ]`

Branch: `feat/authentication` · Depende de: Fases 3 e 4

- [ ] Cliente Supabase e configuração de ambiente
- [ ] Tela de apresentação inicial
- [ ] Cadastro, login e recuperação de senha
- [ ] Validação de formulário, tratamento de erro e indicador de carregamento
- [ ] Sessão persistida em `expo-secure-store`
- [ ] Encerramento de sessão
- [ ] Alteração de nome, e-mail e senha
- [ ] Exclusão de conta com remoção dos dados local e remoto
- [ ] Testes dos fluxos de autenticação

### Fase 6 — Perfil e configurações `[ ]`

Branch: `feat/profile-settings` · Depende de: Fase 5

- [ ] Nome, foto ou avatar e e-mail
- [ ] Moeda, tema e idioma
- [ ] Dia de fechamento e início do ciclo financeiro
- [ ] Preferências de notificação
- [ ] Bloqueio por biometria ou PIN e mascaramento de valores
- [ ] Exportação dos próprios dados

### Fase 7 — Contas e carteiras `[x]`

Branch: `feat/accounts` · Depende de: Fase 6

- [x] Tipos: corrente, poupança, dinheiro, digital, vale-alimentação,
      vale-refeição, investimento e personalizada
- [x] Nome, cor, instituição e saldo inicial
- [x] Saldo atual calculado a partir das movimentações, somado no banco
- [x] Arquivamento e inclusão ou exclusão do saldo consolidado
- [x] Testes de cálculo de saldo

### Fase 8 — Categorias `[~]`

Branch: `feat/categories` · Depende de: Fase 7

- [x] Categorias iniciais de receita e despesa, semeadas de forma idempotente
- [x] Subcategorias
- [ ] Criar, editar, reordenar, arquivar e personalizar cor e ícone — a tela de
      gerenciamento entra junto com os lançamentos, onde as categorias passam a
      ser escolhidas de fato

### Fase 9 — Receitas `[~]`

Branch: `feat/transactions` · Depende de: Fase 8

- [x] Cadastro com valor, descrição, categoria, conta de destino e data
- [x] Status: prevista, pendente e recebida
- [x] Observações
- [ ] Atraso automático e cancelamento — dependem da Fase 12, que é quem
      acompanha vencimentos ao longo do tempo
- [ ] Tags, anexos e comprovante
- [ ] Tipos e categorias personalizados — entram com a tela de gerenciamento de
      categorias

### Fase 10 — Despesas `[~]`

Branch: `feat/transactions` · Depende de: Fase 9

- [x] Cadastro com valor, descrição, categoria, conta e data
- [x] Status: prevista, pendente e paga
- [x] Observações
- [x] Testes de validação do formulário e do resumo do período
- [ ] Subcategoria na escolha, estabelecimento e forma de pagamento
- [ ] Conta de cartão de crédito — depende da Fase 14
- [ ] Tags e anexos
- [ ] Marcação de despesa individual ou compartilhada — depende da Fase 16

### Fase 11 — Transferências `[x]`

Branch: `feat/transactions` · Depende de: Fase 10

- [x] Transferência entre contas com par de movimentações vinculadas, gravado
      em uma única transação de banco
- [x] Exclusão dos agregados de receita e despesa
- [x] Rastreabilidade entre origem e destino por `transferGroupId`, com
      exclusão das duas pernas em conjunto
- [x] Testes garantindo que não distorcem o resultado do período

### Fase 12 — Recorrências `[~]`

Branch: `feat/recurrences-installments` · Depende de: Fase 11

- [x] Periodicidades: diária, semanal, quinzenal, mensal, bimestral,
      trimestral, semestral, anual e intervalo personalizado
- [x] Data de início, término ou quantidade de ocorrências
- [x] Controle do que já foi materializado, para não duplicar ocorrência
- [x] Testes de geração de ocorrências e de casos de borda de calendário
- [ ] Tela de criar a recorrência e geração automática — entram com a edição
      de lançamento já registrado, que é onde fazem sentido para quem usa
- [ ] Edição desta ocorrência, desta e das próximas, ou da série

### Fase 13 — Parcelamentos `[~]`

Branch: `feat/recurrences-installments` · Depende de: Fase 12

- [x] Quantidade de parcelas a partir do valor total
- [x] Distribuição determinística do resto em centavos
- [x] Testes garantindo que a soma das parcelas é igual ao total
- [ ] Tela de parcelar uma compra e visualização de parcelas pagas
- [ ] Editar uma parcela, editar futuras, antecipar e cancelar futuras

### Fase 14 — Cartões de crédito e faturas `[~]`

Branch: `feat/recurrences-installments` · Depende de: Fase 13

- [x] Cadastro com bandeira, limite, fechamento, vencimento e conta de pagamento
- [x] Limite utilizado e disponível, sem devolver disponível negativo
- [x] Em qual fatura cada compra cai, com a compra após o fechamento indo para
      a seguinte
- [x] Testes de montagem de fatura em torno da data de fechamento
- [ ] Histórico de faturas fechadas e pagas
- [ ] Melhor dia de compra
- [ ] Pagamento total ou parcial

### Fase 15 — Casas e participantes `[~]`

Branch: `feat/households` · Depende de: Fase 14

- [x] Criar casa com nome
- [x] Papéis: proprietário, administrador, membro e visualizador
- [x] Remoção de participantes conforme permissão
- [x] Identificação de quem criou cada lançamento
- [x] Testes de permissão no aplicativo
- [ ] Imagem da casa
- [ ] Convites, aceite e recusa — dependem da Fase 5
- [ ] Políticas RLS com funções `SECURITY DEFINER` — dependem da Fase 24

### Fase 16 — Divisão de despesas `[~]`

Branch: `feat/expense-splits` · Depende de: Fase 15

- [x] Quem pagou e quem participa da divisão
- [x] Divisão igual, por valor e por porcentagem
- [x] Testes de soma exata das divisões
- [x] Acerto de contas calculado a partir da divisão
- [ ] Tela de digitar as partes por valor e por porcentagem
- [ ] Saldos acumulados entre participantes e registro do acerto

### Fase 17 — Orçamentos `[~]`

Branch: `feat/budgets-goals` · Depende de: Fase 16

- [x] Orçamento por categoria, conta e geral, com período
- [x] Planejado, utilizado, restante e percentual
- [x] Alertas de proximidade e de estouro do limite
- [ ] Escopo por pessoa e por casa — dependem da resolução da divisão
- [ ] Projeção até o fim do período

### Fase 18 — Metas financeiras `[~]`

Branch: `feat/budgets-goals` · Depende de: Fase 17

- [x] Meta com valor-alvo e prazo
- [x] Progresso e quanto guardar por mês para chegar na data
- [x] Aportes e resgates gravados
- [ ] Tela de registrar aporte e histórico — entra com a edição de lançamento
- [ ] Conta relacionada à meta

### Fase 19 — Dashboard `[~]`

Branch: `feat/transactions` · Depende de: Fase 18

- [x] Saldo total, receitas, despesas e resultado do ciclo financeiro
- [x] Atividade recente
- [ ] Contas a vencer, atrasadas e próximos vencimentos
- [ ] Limite dos cartões e orçamentos próximos do limite
- [ ] Evolução do saldo e comparação com o mês anterior
- [ ] Maiores categorias, distribuição de despesas, metas e atividade recente
- [ ] Filtros por período, conta, cartão, categoria, pessoa, casa, tipo e status

### Fase 20 — Gráficos e análises `[~]`

Branch: `feat/dashboard` · Depende de: Fase 19

- [x] Barras, linha, rosca e barra de progresso sobre `react-native-svg`
- [x] Receitas versus despesas e evolução do resultado
- [x] Comparação com o período anterior
- [x] Acessibilidade: rótulo, valor textual e distinção sem depender de cor
- [x] Geometria coberta por teste, porque desenho torto não acusa erro
- [ ] Projeção e despesas fixas versus variáveis

### Fase 21 — Movimentações, busca e filtros `[~]`

Branch: `feat/search-reports-export` · Depende de: Fase 20

- [x] Lista de movimentações com exclusão, agrupada por data
- [x] Busca textual, sem exigir acento, e ordenação por data ou valor
- [x] Filtro por tipo e limpeza rápida
- [ ] Filtros combináveis de categoria, conta e faixa de valor na tela — o
      cálculo já aceita todos eles
- [ ] Carregamento incremental e agrupamento por categoria
- [ ] Edição do lançamento já registrado

### Fase 22 — Relatórios `[~]`

Branch: `feat/reports-notifications` · Depende de: Fase 21

- [x] Relatórios por período de 1, 3, 6 ou 12 meses
- [x] Receitas, despesas e resultado, por categoria, por conta e mês a mês
- [ ] Recortes de cartões, faturas, orçamentos, metas, pessoas e casas

### Fase 23 — Exportação `[~]`

Branch: `feat/search-reports-export` · Depende de: Fase 22

- [x] CSV com escape conforme o RFC 4180 e marca de ordem de bytes
- [x] Cópia completa em JSON, com versão de formato registrada
- [x] Compartilhamento pelo sistema operacional
- [x] Testes do conteúdo gerado
- [ ] PDF com layout de impressão via `expo-print`
- [ ] Cabeçalho com período, data de geração e filtros aplicados

### Fase 24 — Sincronização `[ ]`

Branch: `feat/sync-engine` · Depende de: Fase 23

- [ ] Outbox transacional e cursores por tabela
- [ ] Idempotência por `client_mutation_id`
- [ ] Exclusão lógica propagada
- [ ] Resolução de conflito e reconciliação de transferências e parcelas
- [ ] Indicador de sincronização, quarentena e reprocessamento
- [ ] Testes do motor com cenários de falha e reenvio

### Fase 25 — Notificações `[~]`

Branch: `feat/reports-notifications` · Depende de: Fase 24

- [x] Lembretes de vencimento de contas previstas e pendentes
- [x] Receitas previstas avisadas com texto próprio
- [x] Permissão pedida no momento em que a pessoa liga o lembrete
- [ ] Faturas próximas, orçamentos no limite, metas e recorrências
- [ ] Configuração por tipo de notificação
- [ ] Convites de casa e falhas de sincronização — dependem das Fases 5 e 24

### Fase 26 — Dados de demonstração `[ ]`

Branch: `chore/demo-data` · Depende de: Fase 25

- [ ] Conjunto realista para desenvolvimento
- [ ] Bloqueio de execução em build de produção

### Fase 27 — Segurança e permissões `[~]`

Branch: `feat/security-reports` · Depende de: Fase 26

- [x] Bloqueio por biometria ou senha do aparelho ao retornar do segundo plano
- [x] Mascaramento de valores na tela, apenas na exibição
- [x] Permissões de casa declaradas em um lugar só, negando por padrão
- [x] Nenhum segredo gravado: a biometria é conferida pelo sistema
- [ ] Ocultação da miniatura no seletor de aplicativos
- [ ] Revisão das políticas RLS de todas as tabelas — depende da Fase 24

### Fase 28 — Acessibilidade e otimização `[~]`

Branch: `feat/visual-refresh` · Depende de: Fase 27

- [x] Rótulos de acessibilidade nas ações, listas e gráficos
- [x] Contraste verificado por teste automatizado, inclusive sobre gradiente
- [x] Áreas de toque de 48 pontos nos elementos interativos
- [x] Estado ativo distinguível por forma, não só por cor
- [x] Listas virtualizadas e consultas indexadas
- [ ] Medição de tempo de abertura e de renderização das listas
- [ ] Revisão com leitor de tela em aparelho

### Fase 29 — Testes de ponta a ponta `[ ]`

Branch: `test/e2e-flows` · Depende de: Fase 28

- [ ] Maestro configurado
- [ ] Cadastro, login, criar despesa, criar receita, criar casa, convidar
      membro e gerar relatório

### Fase 30 — Build Android `[~]`

Branch: `ci/prerelease-tags` · Depende de: Fase 29

- [x] Estágios de desenvolvimento, preview e produção
- [x] Ícone, splash e ícone adaptativo aplicados
- [x] Versionamento e `versionCode`
- [x] APK gerado e validado a partir de tag de pré-lançamento
- [ ] Assinatura de produção documentada, sem versionar keystore
- [ ] AAB validado para a Google Play

### Fase 31 — Release inicial `[ ]`

Branch: `chore/release-v0.1.0` · Depende de: Fase 30

- [ ] Documentação final e capturas de tela
- [ ] `CHANGELOG.md` atualizado
- [ ] Tag `v0.1.0` e GitHub Release com APK anexado

## Funcionalidades futuras

Fora do MVP, registradas para não se perderem.

### v0.2.0

- [ ] Dívidas e empréstimos: concedidos, recebidos, juros, parcelas e saldo
- [ ] Importação de CSV com mapeamento de colunas e prevenção de duplicidade
- [ ] Backup e restauração completos da conta
- [ ] Simplificação de dívidas entre participantes

### v0.3.0

- [ ] Multimoeda com taxa de câmbio histórica por lançamento
- [ ] Internacionalização efetiva (en-US como segundo idioma)
- [ ] Widgets de tela inicial no Android
- [ ] Importação de OFX

### Sem versão definida

- [ ] Destravar a compilação nativa local no Windows. O `ninja` 1.10.2 que
      acompanha o CMake 3.22.1 do Android SDK aplica um limite fixo de 260
      caracteres, e o caminho do arquivo objeto gerado pelo CMake passa disso
      sozinho, independentemente de onde o projeto esteja. Opções a avaliar:
      `ninja` mais recente, CMake mais recente do SDK, ou compilar em WSL. Não
      afeta a integração contínua, que roda em Linux.
- [ ] Avaliar exceção de loja de aplicativos, caso o iOS entre no escopo
- [ ] Atualizar para TypeScript 7 quando o `typescript-eslint` suportar
- [ ] Anexos com sincronização para o Supabase Storage
- [ ] Relatórios comparativos entre casas

## Critérios de conclusão de uma fase

Uma fase só é considerada concluída quando **todos** os itens abaixo forem
verdadeiros:

1. Funcionalidade implementada e interface completa
2. Estados de carregamento, vazio e erro tratados
3. Dados validados na entrada
4. `npm run lint` sem erros
5. `npm run typecheck` sem erros
6. `npm test` passando, com testes das regras introduzidas
7. Build validado
8. Documentação afetada atualizada, incluindo este roadmap
9. Pull Request aberto, revisado e mergeado
10. Branch apagada local e remotamente
11. `main` local atualizada
