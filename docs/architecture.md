# Arquitetura do Troqito

Documento vivo. Registra as decisões técnicas duradouras, o motivo de cada uma e
as consequências aceitas. Decisões revistas devem ser atualizadas aqui, com a
justificativa, em vez de removidas.

## 1. Visão geral

O Troqito é um aplicativo móvel offline-first para finanças pessoais, familiares
e domésticas. O banco local é a fonte de verdade da interface: toda leitura e
toda escrita acontecem em SQLite no dispositivo, e a sincronização com o servidor
é um processo em segundo plano que reconcilia estados.

```
┌──────────────────────── Dispositivo ────────────────────────┐
│  UI (expo-router + componentes do design system)            │
│      ↕ hooks de feature                                     │
│  Casos de uso / regras de negócio (features/*/domain)       │
│      ↕ repositórios                                         │
│  SQLite local (Drizzle ORM)  ──▶  outbox de alterações      │
└──────────────────────────────┬──────────────────────────────┘
                               │ motor de sincronização
                               ▼
┌────────────────────────── Supabase ─────────────────────────┐
│  Auth (JWT) · Postgres + RLS · Storage (anexos)             │
└─────────────────────────────────────────────────────────────┘
```

Nenhuma regra financeira mora em componente visual. Componentes recebem valores
já calculados e formatados.

## 2. Decisões técnicas

### 2.1 Expo com Continuous Native Generation, não React Native CLI

**Decisão:** Expo SDK 57 (React Native 0.86, React 19.2), usando `expo prebuild`
para gerar o projeto Android e Gradle local para gerar o APK.

**Motivo:** todas as capacidades exigidas pelo escopo têm módulo Expo mantido
oficialmente — `expo-sqlite`, `expo-secure-store`, `expo-local-authentication`
(biometria), `expo-notifications`, `expo-print` (PDF), `expo-sharing`,
`expo-file-system`, `expo-image-picker`. Não há necessidade que force a ejeção
para o CLI puro. O CNG mantém `android/` e `ios/` como artefatos gerados, o que
elimina o conflito de merge mais comum em projetos React Native e permite
configurar o nativo por plugins versionados em `app.config.ts`.

**Consequências aceitas:**
- `android/` e `ios/` ficam no `.gitignore`; qualquer ajuste nativo precisa ser
  expresso como config plugin, nunca como edição manual do diretório gerado.
- O build local depende de JDK 17 e Android SDK instalados.
- EAS Build é opcional e não é requisito. O APK de release é produzido por
  `expo prebuild` + `gradlew assembleRelease`, o que mantém o projeto livre de
  dependência de serviço pago.
- Expo Go não é suportado: `expo-sqlite` com Drizzle e a biometria exigem um
  development build.

### 2.2 Navegação por arquivos com expo-router

**Decisão:** `expo-router` v6, com grupos de rota para separar o fluxo público do
autenticado.

**Motivo:** rotas tipadas, deep linking automático (necessário para convites de
casa) e proteção de rota declarativa por layout.

```
app/
  (public)/     — apresentação, login, cadastro, recuperação de senha
  (app)/        — exige sessão; redireciona para (public) quando não há
    (tabs)/     — Início, Movimentações, Adicionar, Planejamento, Perfil
```

### 2.3 Persistência local: expo-sqlite + Drizzle ORM

**Decisão:** SQLite via `expo-sqlite`, acessado por `drizzle-orm`, com migrations
versionadas geradas por `drizzle-kit`.

**Alternativas avaliadas:**

| Opção | Por que não foi escolhida |
| --- | --- |
| WatermelonDB | Protocolo de sync pronto, mas curva de aprendizado alta, modelo de dados próprio (decorators) e integração mais frágil a cada SDK do Expo. O ganho do sync pronto não compensa a perda de controle sobre regras financeiras. |
| PowerSync | Sync bidirecional turnkey e maduro, porém é serviço gerenciado com custo e acopla o projeto a um fornecedor a mais, além do Supabase. |
| AsyncStorage / MMKV | Chave-valor. Inviável para consultas relacionais, agregações por período e relatórios. |
| Realm | Boa performance, mas o roadmap do produto após a aquisição pela MongoDB é incerto para React Native. |

**Motivo da escolha:** SQL puro é o ferramental certo para agregações
financeiras (somatórios por período, categoria, conta). Drizzle dá tipagem
derivada do schema sem runtime pesado, e `useLiveQuery` re-renderiza a UI quando
a tabela muda, o que dispensa uma camada de cache global. Migrations versionadas
em arquivo garantem evolução previsível do schema em dispositivos já instalados.

**Consequência aceita:** o motor de sincronização é escrito à mão. Isso é
trabalho, mas é a parte do sistema que mais precisa de regras específicas de
domínio financeiro, e delegá-la a uma caixa-preta traria risco maior.

### 2.4 Valores monetários em centavos inteiros

**Decisão:** todo valor monetário é um inteiro em centavos. `INTEGER` no SQLite,
`bigint` no Postgres, `number` no TypeScript através do tipo nominal `Cents`.
Nenhuma operação aritmética financeira usa ponto flutuante.

**Motivo:** `0.1 + 0.2 !== 0.3` em IEEE 754. Em um app de finanças isso vira
divergência de centavos em fatura, divisão e orçamento.

**Regras derivadas:**
- Divisão sempre distribui o resto: dividir R$ 100,00 entre 3 pessoas gera
  3334 + 3333 + 3333 centavos, com o resto atribuído deterministicamente aos
  primeiros participantes por ordem estável.
- Parcelamento aplica a mesma regra: a soma das parcelas é sempre igual ao total.
- Porcentagem é armazenada em base 10.000 (basis points) para evitar float.
- `number` suporta com segurança até 2^53-1 centavos, ou aproximadamente
  90 trilhões de reais. Suficiente, e verificado por guarda no construtor.

### 2.5 Backend: Supabase

**Decisão:** Supabase — Postgres gerenciado, Auth, Row Level Security e Storage.

**Alternativas avaliadas:**

| Opção | Por que não foi escolhida |
| --- | --- |
| Firebase | Firestore é orientado a documentos; relatórios financeiros com agregações por período e junções entre contas, categorias e casas ficam caros e verbosos. As regras de segurança são menos expressivas que RLS para o modelo de casas com papéis. |
| Backend próprio | Máximo controle, mas exige hospedagem, CI, monitoramento e manutenção contínua — custo desproporcional para um projeto pessoal. |
| Somente local, sem servidor | Elimina sincronização entre dispositivos e compartilhamento familiar, que são requisitos centrais. |

**Motivo:** o modelo de dados é relacional por natureza. RLS coloca a
autorização no banco, o que satisfaz o requisito de validar permissão também na
camada de dados, e não apenas no aplicativo. O plano gratuito atende à fase
inicial.

**Consequências aceitas:**
- Dependência de fornecedor, mitigada pelo fato de o núcleo ser Postgres padrão e
  o app funcionar offline mesmo com o servidor indisponível.
- Segredos (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) ficam em `.env`, nunca
  versionados. A chave `service_role` nunca é embarcada no aplicativo.

### 2.6 Autorização: RLS com funções SECURITY DEFINER

**Decisão:** cada tabela com dado do usuário tem RLS habilitada. O acesso a dados
de casa é verificado por funções `SECURITY DEFINER` (`is_household_member`,
`household_role`) em vez de subconsultas `EXISTS` diretas nas políticas.

**Motivo:** políticas que consultam `household_members` a partir de uma política
sobre `household_members` causam recursão infinita, um erro conhecido e comum
nesse padrão. Encapsular a verificação em função `SECURITY DEFINER` quebra a
recursão e ainda evita reavaliar a subconsulta linha a linha, o que melhora o
plano de execução em tabelas grandes.

**Papéis por casa:** `owner`, `admin`, `member`, `viewer`. A permissão é validada
duas vezes — no aplicativo, para a experiência, e no Postgres, como fronteira de
segurança real. Validação apenas no cliente não é considerada validação.

### 2.7 Sincronização

**Decisão:** replicação incremental com outbox local e cursor por tabela.

**Escrita:** toda mutação local grava a linha em SQLite e enfileira um registro na
tabela `sync_outbox` (entidade, id, operação, payload, tentativas). A UI responde
imediatamente; nada bloqueia esperando a rede.

**Envio:** o motor drena o outbox em lotes ordenados, chamando uma função no
Supabase. Cada operação carrega um `client_mutation_id` (UUID v7 gerado no
dispositivo), e o servidor ignora ids já aplicados. É isso que impede duplicidade
quando a resposta se perde após o servidor já ter gravado.

**Leitura:** cada tabela guarda um cursor `server_updated_at`. O pull traz apenas
o que mudou depois do cursor, incluindo exclusões, que são lógicas (`deleted_at`)
justamente para poderem ser propagadas.

**Conflito:** last-write-wins por linha, usando o relógio do servidor como
autoridade — o relógio do dispositivo não é confiável. A exceção é o par de
transações de transferência e as parcelas de um plano, que são reconciliados como
unidade para nunca ficarem parcialmente aplicados.

**Identificadores:** UUID v7 gerado no cliente. Ordenável no tempo, elimina a
espera por id do servidor e evita colisão entre dispositivos offline.

**Recuperação:** falhas usam backoff exponencial com teto. Após o limite de
tentativas o item vai para quarentena e a interface mostra o erro com ação de
reprocessar, em vez de tentar para sempre em silêncio.

### 2.8 Estado da aplicação

**Decisão:** três camadas, sem estado global desnecessário.

1. **Dados persistidos** — lidos direto do SQLite por `useLiveQuery`. Não há
   cópia em memória, portanto não há cache para invalidar.
2. **Estado de sessão e preferências** — Zustand, com persistência em
   `expo-secure-store` (sessão) e SQLite (preferências).
3. **Estado de tela** — `useState` local. Não sobe para store global.

TanStack Query foi descartado: ele resolve cache de servidor, e neste projeto o
servidor nunca é consultado pela UI — só pelo motor de sincronização.

### 2.9 Validação

**Decisão:** Zod na fronteira. Um schema por entidade, reaproveitado pelo
formulário (`react-hook-form` + `zodResolver`), pelo repositório e pelo
importador de CSV.

**Motivo:** validar duas vezes com regras escritas duas vezes é como as regras
divergem. O tipo do domínio é inferido do schema, então validação e tipagem não
podem sair de sincronia.

### 2.10 Gráficos

**Decisão:** componentes próprios sobre `react-native-svg`.

**Motivo:** as bibliotecas prontas de gráfico em React Native tratam
acessibilidade como detalhe. O requisito de não depender apenas de cor, expor
rótulo textual e valor para leitor de tela, e permanecer legível em tela pequena
é mais fácil de garantir com SVG direto do que lutando contra a API de uma
biblioteca. O conjunto de gráficos necessário é pequeno e bem definido: barras,
linha, rosca e barra de progresso.

**Consequência aceita:** mais código próprio, compensado por controle total de
acessibilidade e ausência de dependência pesada (Skia/Reanimated) só para
desenhar gráficos.

### 2.11 Relatórios e exportação — geração local

**Decisão:** PDF, CSV e XLSX são gerados no dispositivo. Nada é enviado ao
servidor para renderização.

**Motivo:** privacidade. Um relatório financeiro completo é o dado mais sensível
do aplicativo; gerá-lo no servidor significaria trafegá-lo e possivelmente
retê-lo em log ou armazenamento temporário. A geração local também funciona
offline.

**Implementação:** o relatório é montado como HTML com folha de estilo própria
para impressão e convertido por `expo-print`, que usa o renderizador nativo do
sistema. O compartilhamento usa `expo-sharing`, delegando ao seletor do sistema
operacional.

### 2.12 Segurança

- Tokens de sessão em `expo-secure-store` (Keystore no Android). Nunca em
  `AsyncStorage`, nunca em SQLite.
- Bloqueio opcional do aplicativo por biometria ou PIN
  (`expo-local-authentication`), com exigência ao voltar do segundo plano.
- Mascaramento de valores, alternável, e ocultação automática no seletor de apps.
- Logs sanitizados: um wrapper único de log remove campos sensíveis por lista de
  chaves. Valores monetários, tokens, e-mails e ids de conta nunca chegam ao log
  em build de release.
- Sem telemetria comportamental e sem SDK de analytics de terceiros.
- Exclusão de conta remove os dados no servidor e apaga o banco local.

### 2.13 Qualidade e tipagem

- TypeScript em modo `strict`, com `noUncheckedIndexedAccess` e
  `exactOptionalPropertyTypes`. `any` é erro de lint.
- ESLint com `eslint-config-expo` e `typescript-eslint`, Prettier para formatação.
- **A versão do TypeScript fica presa à faixa suportada pelo `typescript-eslint`
  (`>=4.8.4 <6.1.0`).** O TypeScript 7 já está publicado, mas adotá-lo hoje
  quebraria o lint com tipos ou exigiria `--legacy-peer-deps`. A atualização
  acontece quando o `typescript-eslint` declarar suporte, e está registrada no
  roadmap.

### 2.14 Testes

| Camada | Ferramenta | O que cobre |
| --- | --- | --- |
| Unitário | Jest | Money, arredondamento, divisão, parcelamento, recorrência, faturas, saldo, orçamento |
| Componente | @testing-library/react-native | Componentes do design system e formulários críticos |
| Integração | Jest + SQLite em memória | Repositórios, migrations, motor de sincronização, permissões |
| Ponta a ponta | Maestro | Cadastro, login, criar despesa, criar receita, criar casa, convidar membro, gerar relatório |

Regra financeira sem teste não entra em `main`. A prioridade de cobertura segue a
ordem: cálculo monetário > permissões > sincronização > interface.

### 2.15 Licença: AGPL-3.0-or-later

**Decisão:** GNU Affero General Public License v3.0 ou posterior.

**Motivo:** o Troqito é software livre e deve continuar livre mesmo se alguém o
transformar em serviço hospedado. A cláusula 13 da AGPL cobre exatamente esse
caso: quem oferecer o Troqito modificado como serviço pela rede precisa
disponibilizar o código correspondente aos usuários. Como o projeto tem um
componente de servidor (Supabase, funções e políticas), uma licença sem cláusula
de rede — MIT, Apache-2.0 ou mesmo GPL-3.0 — permitiria fechar exatamente a parte
que mais importa proteger.

**Consequências aceitas:**
- Distribuição pela Google Play é compatível com a AGPL.
- **A distribuição pela App Store da Apple não é compatível** com licenças da
  família GPL, porque os termos da loja impõem restrições de uso que a licença
  proíbe. Se o iOS entrar no escopo, será necessário adicionar uma exceção
  explícita de loja de aplicativos, e isso exige o consentimento de todos os
  contribuidores. Item registrado no roadmap para decisão antes de qualquer
  trabalho em iOS.
- Contribuições entram sob a mesma licença, com sinalização de origem (DCO)
  descrita em `CONTRIBUTING.md`.

## 3. Organização de pastas

Organização por domínio. Não existe pasta global de componentes com dezenas de
arquivos não relacionados: o que é usado por uma feature mora nela.

```
app/                        rotas do expo-router (apenas composição de tela)
src/
  components/               design system reutilizável, sem regra de negócio
  features/
    <dominio>/
      components/           componentes exclusivos do domínio
      domain/               regras puras, testáveis sem React nem banco
      hooks/                ligação entre UI e repositório
      repository/           acesso a dados (Drizzle)
      schemas/              validação Zod e tipos inferidos
  database/
    schema/                 tabelas Drizzle
    migrations/             migrations versionadas geradas pelo drizzle-kit
    client.ts               abertura e configuração da conexão
  lib/
    money/                  aritmética monetária em centavos
    date/                   período, ciclo financeiro, fuso
    format/                 formatação pt-BR
    logger/                 log sanitizado
  services/
    supabase/               cliente e chamadas remotas
    sync/                   outbox, cursores, reconciliação
    export/                 PDF, CSV, XLSX
  theme/                    tokens, temas claro e escuro
  i18n/                     dicionário pt-BR e infraestrutura
  types/                    tipos compartilhados
docs/                       documentação do projeto
```

A pasta `domain` de cada feature é a única onde regra financeira pode existir, e
não importa React, Drizzle nem Supabase. É isso que a torna testável sem
ambiente.

## 4. Modelo de dados

Entidades principais e relações. O detalhamento de colunas vive nas migrations.

```
profiles                  1─┬─N  accounts
                            ├─N  credit_cards ──N── invoices ──N── transactions
                            ├─N  categories (auto-relação para subcategoria)
                            ├─N  budgets
                            ├─N  goals ──N── goal_contributions
                            └─N  household_members ──N── households
                                                          └─N── household_invites

transactions              núcleo: receita, despesa e perna de transferência
  ├─ transfer_group_id    liga as duas pernas de uma transferência
  ├─ recurrence_rule_id   origem quando gerada por recorrência
  ├─ installment_plan_id  vínculo com a compra parcelada original
  ├─ invoice_id           fatura do cartão quando aplicável
  ├─ N── transaction_splits    divisão entre participantes
  ├─ N── attachments
  └─ N── transaction_tags ──N── tags

sync_outbox               fila de mutações pendentes
sync_cursors              posição de leitura por tabela
```

Convenções obrigatórias em toda tabela sincronizada: `id` (UUID v7),
`created_at`, `updated_at`, `deleted_at` (exclusão lógica) e `owner_id`. Índices
mínimos: `(owner_id, date)` e `(household_id, date)` em `transactions`, mais
índice em toda chave estrangeira usada em filtro.

Receita e despesa compartilham a tabela `transactions` com discriminador `kind`.
Foram modeladas juntas porque compartilham praticamente todos os campos, os
mesmos filtros e os mesmos relatórios; separá-las duplicaria o schema e toda
consulta de fluxo de caixa viraria `UNION`.

## 5. Fluxo de dados de uma escrita

```
Formulário
  → schema Zod valida e converte para o tipo do domínio
  → caso de uso aplica regra (ex.: gerar 12 parcelas, distribuir centavos)
  → repositório grava em SQLite dentro de uma transação
  → mesma transação enfileira no sync_outbox
  → useLiveQuery detecta a mudança e atualiza a tela
  → motor de sincronização drena o outbox quando houver rede
```

Gravar a linha e enfileirar no outbox na **mesma** transação SQLite é o que
garante que nunca exista dado local sem sincronização pendente correspondente.

## 6. Build e publicação

**Estágios:** `development`, `preview` e `production`, cada um com seu arquivo de
ambiente e seu `applicationId`, para conviverem no mesmo aparelho:

| Estágio | applicationId |
| --- | --- |
| development | `com.caiokenai.troqito.dev` |
| preview | `com.caiokenai.troqito.preview` |
| production | `com.caiokenai.troqito` |

**Processo de release:**

```
expo prebuild --platform android --clean
cd android && ./gradlew assembleRelease   # APK
                ./gradlew bundleRelease   # AAB
```

A assinatura de produção usa um keystore local referenciado por
`android/keystore.properties`, arquivo que **nunca** é versionado. `CONTRIBUTING.md`
descreve como gerá-lo. O `versionCode` é derivado da versão semântica.

**Integração contínua:** GitHub Actions executa instalação com cache, lint,
typecheck, testes e validação de build a cada Pull Request. O merge só ocorre com
as verificações verdes. Nenhum segredo é exposto no workflow.

**Estratégia de merge:** merge commit, não squash. O projeto exige commits
pequenos e de responsabilidade única, e o squash apagaria exatamente essa
granularidade ao colapsar o Pull Request em um único commit. Com merge commit, a
`main` mantém o histórico fino de cada alteração lógica, e o commit de merge
continua marcando a fronteira de cada tarefa entregue.

## 7. Pendências arquiteturais

Registradas aqui para não se perderem; o acompanhamento está em `roadmap.md`.

- Simplificação de dívidas entre participantes (algoritmo de acerto mínimo).
- Suporte real a multimoeda com taxa de câmbio histórica por lançamento.
- Decisão sobre exceção de loja de aplicativos, caso o iOS entre no escopo.
- Atualização para TypeScript 7 quando o `typescript-eslint` suportar.
- Importação de OFX além de CSV.
