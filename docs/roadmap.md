# Roadmap do Troqito

Documento de acompanhamento. Cada fase corresponde a uma branch e um Pull
Request. Uma fase só é marcada como concluída quando atende a todos os critérios
de conclusão descritos ao final deste arquivo.

**Legenda:** `[ ]` pendente · `[~]` em andamento · `[x]` concluído

## Situação atual

|                       |                                             |
| --------------------- | ------------------------------------------- |
| Versão                | `0.1.0` (em desenvolvimento, não publicada) |
| Fase em andamento     | Fase 1 — Fundação do projeto                |
| Última fase concluída | Fase 0 — Pesquisa e documentação inicial    |

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

### Fase 1 — Fundação do projeto `[~]`

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

### Fase 2 — Tema e design system `[ ]`

Branch: `feat/design-system` · Depende de: Fase 1

- [ ] Tokens: cores, tipografia, espaçamento, raio, elevação
- [ ] Paleta própria com cores semânticas, de receita, de despesa e de alerta
- [ ] Tema claro, tema escuro e respeito ao tema do sistema
- [ ] Componentes base: botão, campo, seletor, cartão, lista, modal, aviso
- [ ] Estados: carregamento (skeleton), vazio, erro, sucesso
- [ ] Ícone do aplicativo, ícone adaptativo Android e splash screen
- [ ] Verificação de contraste e área de toque mínima
- [ ] Testes dos componentes base

### Fase 3 — Núcleo financeiro e banco local `[ ]`

Branch: `feat/core-domain` · Depende de: Fase 2

- [ ] `Money`: aritmética em centavos, divisão com distribuição de resto
- [ ] Formatação pt-BR de moeda, data e período
- [ ] Ciclo financeiro configurável (dia de fechamento e de início)
- [ ] Schema Drizzle das entidades principais
- [ ] Migrations versionadas e execução na inicialização
- [ ] Repositórios base e transações atômicas
- [ ] Testes de arredondamento, divisão e cálculo de saldo

### Fase 4 — Navegação `[ ]`

Branch: `feat/navigation` · Depende de: Fase 2

- [ ] Grupos de rota público e autenticado
- [ ] Barra inferior: Início, Movimentações, Adicionar, Planejamento, Perfil
- [ ] Ação central de adicionar com escolha do tipo de lançamento
- [ ] Proteção de rotas e redirecionamento
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

### Fase 7 — Contas e carteiras `[ ]`

Branch: `feat/accounts` · Depende de: Fase 6

- [ ] Tipos: corrente, poupança, dinheiro, digital, vale-alimentação,
      vale-refeição, investimento e personalizada
- [ ] Nome, cor, ícone, instituição, saldo inicial e moeda
- [ ] Saldo atual calculado a partir das movimentações
- [ ] Arquivamento e inclusão ou exclusão do saldo consolidado
- [ ] Testes de cálculo de saldo

### Fase 8 — Categorias `[ ]`

Branch: `feat/categories` · Depende de: Fase 7

- [ ] Categorias iniciais de receita e despesa
- [ ] Subcategorias
- [ ] Criar, editar, reordenar, arquivar e personalizar cor e ícone

### Fase 9 — Receitas `[ ]`

Branch: `feat/income-management` · Depende de: Fase 8

- [ ] Cadastro completo com tipo, categoria, conta de destino e datas
- [ ] Status: prevista, recebida, atrasada e cancelada
- [ ] Observações, tags, anexos e comprovante
- [ ] Tipos e categorias personalizados

### Fase 10 — Despesas `[ ]`

Branch: `feat/expense-management` · Depende de: Fase 9

- [ ] Cadastro completo com categoria, subcategoria, conta ou cartão e datas
- [ ] Status: prevista, pendente, paga, atrasada e cancelada
- [ ] Estabelecimento, forma de pagamento, tags, anexos e observações
- [ ] Marcação de despesa individual ou compartilhada
- [ ] Testes de validação e de transição de status

### Fase 11 — Transferências `[ ]`

Branch: `feat/transfers` · Depende de: Fase 10

- [ ] Transferência entre contas com par de movimentações vinculadas
- [ ] Exclusão dos agregados de receita e despesa
- [ ] Rastreabilidade entre origem e destino
- [ ] Testes garantindo que não distorcem o resultado mensal

### Fase 12 — Recorrências `[ ]`

Branch: `feat/recurrences` · Depende de: Fase 11

- [ ] Periodicidades: diária, semanal, quinzenal, mensal, bimestral,
      trimestral, semestral, anual e intervalo personalizado
- [ ] Data de início, término ou quantidade de ocorrências
- [ ] Geração automática ou confirmação manual
- [ ] Edição desta ocorrência, desta e das próximas, ou da série
- [ ] Testes de geração de ocorrências e de casos de borda de calendário

### Fase 13 — Parcelamentos `[ ]`

Branch: `feat/installments` · Depende de: Fase 12

- [ ] Quantidade de parcelas, valor total ou valor da parcela
- [ ] Distribuição determinística do resto em centavos
- [ ] Visualização de parcelas pagas e pendentes
- [ ] Editar uma parcela, editar futuras, antecipar e cancelar futuras
- [ ] Vínculo de todas as parcelas ao lançamento original
- [ ] Testes garantindo que a soma das parcelas é igual ao total

### Fase 14 — Cartões de crédito e faturas `[ ]`

Branch: `feat/credit-cards` · Depende de: Fase 13

- [ ] Cadastro com bandeira, limite, fechamento, vencimento e conta de pagamento
- [ ] Faturas aberta, fechada e paga, com histórico
- [ ] Limite utilizado e disponível
- [ ] Melhor dia de compra
- [ ] Pagamento total ou parcial
- [ ] Testes de montagem de fatura em torno da data de fechamento

### Fase 15 — Casas e participantes `[ ]`

Branch: `feat/household-management` · Depende de: Fase 14

- [ ] Criar casa com nome e imagem
- [ ] Convites, aceite e recusa
- [ ] Papéis: proprietário, administrador, membro e visualizador
- [ ] Remoção de participantes conforme permissão
- [ ] Políticas RLS com funções `SECURITY DEFINER`
- [ ] Identificação de quem criou cada lançamento
- [ ] Testes de permissão no aplicativo e no banco

### Fase 16 — Divisão de despesas `[ ]`

Branch: `feat/expense-splitting` · Depende de: Fase 15

- [ ] Quem pagou e quem participa da divisão
- [ ] Divisão igual, por valor e por porcentagem
- [ ] Saldos entre participantes
- [ ] Registro de acerto de contas
- [ ] Testes de soma exata das divisões

### Fase 17 — Orçamentos `[ ]`

Branch: `feat/budgets` · Depende de: Fase 16

- [ ] Orçamento por categoria, subcategoria, conta, pessoa, casa e período
- [ ] Planejado, utilizado, restante e percentual
- [ ] Projeção até o fim do período
- [ ] Alertas de proximidade e de estouro do limite

### Fase 18 — Metas financeiras `[ ]`

Branch: `feat/goals` · Depende de: Fase 17

- [ ] Meta com valor-alvo, prazo e conta relacionada
- [ ] Contribuições e histórico
- [ ] Progresso e previsão de conclusão

### Fase 19 — Dashboard `[ ]`

Branch: `feat/dashboard` · Depende de: Fase 18

- [ ] Saldo total, receitas, despesas e resultado do mês
- [ ] Contas a vencer, atrasadas e próximos vencimentos
- [ ] Limite dos cartões e orçamentos próximos do limite
- [ ] Evolução do saldo e comparação com o mês anterior
- [ ] Maiores categorias, distribuição de despesas, metas e atividade recente
- [ ] Filtros por período, conta, cartão, categoria, pessoa, casa, tipo e status

### Fase 20 — Gráficos e análises `[ ]`

Branch: `feat/charts` · Depende de: Fase 19

- [ ] Barras, linha, rosca e barra de progresso sobre `react-native-svg`
- [ ] Receitas versus despesas, evolução do saldo e gastos por recorte
- [ ] Comparação mensal e anual, projeção e despesas fixas versus variáveis
- [ ] Acessibilidade: rótulo, valor textual e distinção sem depender de cor

### Fase 21 — Movimentações, busca e filtros `[ ]`

Branch: `feat/transactions-search` · Depende de: Fase 20

- [ ] Busca textual, ordenação e carregamento incremental
- [ ] Filtros combináveis e limpeza rápida
- [ ] Agrupamento por data e por categoria

### Fase 22 — Relatórios `[ ]`

Branch: `feat/reports` · Depende de: Fase 21

- [ ] Relatórios por período com filtros
- [ ] Receitas, despesas, fluxo de caixa, categorias, contas, cartões, faturas,
      orçamentos, metas, pessoas, casas e despesas compartilhadas

### Fase 23 — Exportação `[ ]`

Branch: `feat/report-export` · Depende de: Fase 22

- [ ] PDF com layout de impressão via `expo-print`
- [ ] CSV e XLSX
- [ ] Compartilhamento pelo sistema operacional
- [ ] Cabeçalho com nome, período, data de geração, filtros e resumo
- [ ] Testes do conteúdo gerado

### Fase 24 — Sincronização `[ ]`

Branch: `feat/sync-engine` · Depende de: Fase 23

- [ ] Outbox transacional e cursores por tabela
- [ ] Idempotência por `client_mutation_id`
- [ ] Exclusão lógica propagada
- [ ] Resolução de conflito e reconciliação de transferências e parcelas
- [ ] Indicador de sincronização, quarentena e reprocessamento
- [ ] Testes do motor com cenários de falha e reenvio

### Fase 25 — Notificações `[ ]`

Branch: `feat/notifications` · Depende de: Fase 24

- [ ] Lembretes de vencimento, receitas previstas e faturas próximas
- [ ] Orçamentos próximos do limite, metas e recorrências
- [ ] Convites de casa e falhas de sincronização
- [ ] Configuração por tipo de notificação

### Fase 26 — Dados de demonstração `[ ]`

Branch: `chore/demo-data` · Depende de: Fase 25

- [ ] Conjunto realista para desenvolvimento
- [ ] Bloqueio de execução em build de produção

### Fase 27 — Segurança e permissões `[ ]`

Branch: `feat/security-hardening` · Depende de: Fase 26

- [ ] Revisão das políticas RLS de todas as tabelas
- [ ] Bloqueio por biometria ou PIN ao retornar do segundo plano
- [ ] Sanitização de log e ocultação no seletor de aplicativos
- [ ] Revisão de exclusão de dados e princípio do menor privilégio

### Fase 28 — Acessibilidade e otimização `[ ]`

Branch: `chore/accessibility-performance` · Depende de: Fase 27

- [ ] Rótulos de acessibilidade e navegação por teclado
- [ ] Contraste e áreas de toque revisados
- [ ] Listas virtualizadas e consultas indexadas
- [ ] Medição de tempo de abertura e de renderização das listas

### Fase 29 — Testes de ponta a ponta `[ ]`

Branch: `test/e2e-flows` · Depende de: Fase 28

- [ ] Maestro configurado
- [ ] Cadastro, login, criar despesa, criar receita, criar casa, convidar
      membro e gerar relatório

### Fase 30 — Build Android `[ ]`

Branch: `chore/android-release` · Depende de: Fase 29

- [ ] Estágios de desenvolvimento, preview e produção
- [ ] Ícone, splash e ícone adaptativo aplicados
- [ ] Versionamento e `versionCode`
- [ ] Assinatura de produção documentada, sem versionar keystore
- [ ] APK e AAB gerados e validados

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
