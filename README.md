<div align="center">

<img src="assets/brand/troqito-icon-source.png" alt="Troqito" width="120" />

# Troqito

Aplicativo móvel open source de finanças pessoais, familiares e domésticas.

[![Licença: AGPL v3](https://img.shields.io/badge/licen%C3%A7a-AGPL--3.0--or--later-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-em%20desenvolvimento-orange.svg)](docs/roadmap.md)
[![Plataforma](https://img.shields.io/badge/plataforma-Android-3ddc84.svg)](#build-android)

</div>

> **Status:** pré-MVP, em desenvolvimento ativo. Ainda não há release publicada.
> O acompanhamento fase a fase está em [`docs/roadmap.md`](docs/roadmap.md).

## Sobre

A maioria dos aplicativos de finanças resolve bem o controle individual **ou** a
divisão de contas entre pessoas, raramente as duas coisas. Quem mora com alguém
acaba usando dois aplicativos e conciliando na cabeça.

O Troqito junta as duas coisas: controle pessoal completo — contas, cartões,
parcelamentos, recorrências, orçamentos e metas — e casas compartilhadas, onde
cada despesa registra quem pagou, quem participa e como foi dividida, com saldo
entre as pessoas sempre visível.

Tudo funciona sem conexão. O banco fica no aparelho, e a sincronização acontece
quando houver rede.

## Princípios

- **Offline de verdade.** Registrar um gasto na fila do supermercado sem sinal
  precisa funcionar. O banco local é a fonte de verdade, não um cache.
- **Centavo é centavo.** Nenhum cálculo financeiro usa ponto flutuante. Valores
  são inteiros em centavos, e a soma das partes sempre bate com o total.
- **Seus dados são seus.** Exportação completa em PDF, CSV e XLSX, gratuita e
  sem limite. Relatórios gerados no aparelho, sem passar pelo servidor.
- **Sem rastreamento.** Nenhum SDK de analytics comportamental.

## Funcionalidades

O escopo do MVP está detalhado em [`docs/roadmap.md`](docs/roadmap.md), onde cada
item tem o estado atual.

| Área         | Inclui                                                          |
| ------------ | --------------------------------------------------------------- |
| Lançamentos  | Receitas, despesas e transferências entre contas                |
| Recorrência  | Nove periodicidades, com edição desta, das próximas ou da série |
| Parcelamento | Vínculo à compra original, com distribuição exata dos centavos  |
| Contas       | Corrente, poupança, dinheiro, digital, vales e investimento     |
| Cartões      | Fatura, fechamento, vencimento, limite e melhor dia de compra   |
| Casas        | Papéis, convites, despesas compartilhadas e saldo entre pessoas |
| Divisão      | Igual, por valor ou por porcentagem                             |
| Planejamento | Orçamentos por escopo e período, e metas financeiras            |
| Análise      | Dashboard, gráficos acessíveis e relatórios filtráveis          |
| Exportação   | PDF, CSV e XLSX, com compartilhamento pelo sistema              |

## Capturas de tela

Serão adicionadas quando a interface estiver estável, na fase de release inicial.

## Tecnologias

| Camada      | Escolha                                                          |
| ----------- | ---------------------------------------------------------------- |
| Aplicativo  | React Native 0.86 · React 19.2 · Expo SDK 57                     |
| Linguagem   | TypeScript em modo estrito                                       |
| Navegação   | expo-router                                                      |
| Banco local | SQLite (`expo-sqlite`) com Drizzle ORM e migrations versionadas  |
| Servidor    | Supabase — Postgres, Auth e Row Level Security                   |
| Validação   | Zod, com react-hook-form nos formulários                         |
| Estado      | Consultas reativas no SQLite, Zustand para sessão e preferências |
| Gráficos    | Componentes próprios sobre react-native-svg                      |
| Testes      | Jest, Testing Library e Maestro                                  |

O motivo de cada escolha, e as alternativas descartadas, estão em
[`docs/architecture.md`](docs/architecture.md).

## Arquitetura resumida

Organização por domínio. A regra financeira mora em `features/<dominio>/domain`,
não importa React nem banco, e por isso é testável isoladamente.

```
app/          rotas do expo-router
src/
  components/ design system
  features/   auth, accounts, cards, categories, transactions, households,
              budgets, goals, dashboard, reports, settings
  database/   schema e migrations
  lib/        money, datas, formatação, log
  services/   supabase, sync, exportação
  theme/      tokens e temas
```

Escrita: formulário → validação Zod → caso de uso → repositório → SQLite, com o
enfileiramento no outbox de sincronização dentro da **mesma** transação.

## Requisitos

- Node.js 20 ou superior
- JDK 17
- Android SDK com plataforma 35 e build-tools correspondentes
- Um dispositivo ou emulador Android

Expo Go **não** é suportado: o banco local e a biometria exigem um development
build.

## Configuração

```bash
git clone https://github.com/caio-kenai/Troqito.git
cd Troqito
npm install
cp .env.example .env
```

Preencha o `.env` com as credenciais do seu projeto Supabase. Arquivos `.env`
reais nunca são versionados.

## Variáveis de ambiente

| Variável                        | Descrição                                |
| ------------------------------- | ---------------------------------------- |
| `EXPO_PUBLIC_SUPABASE_URL`      | URL do projeto Supabase                  |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima pública do projeto         |
| `EXPO_PUBLIC_APP_STAGE`         | `development`, `preview` ou `production` |

A chave `service_role` do Supabase **nunca** deve ser colocada no aplicativo:
qualquer valor com prefixo `EXPO_PUBLIC_` é embarcado no pacote e é legível por
quem tiver o APK.

## Execução no Android

```bash
npm run android
```

O comando gera o projeto nativo e instala o development build no dispositivo
conectado. A partir da segunda vez, `npm start` é suficiente.

## Testes

```bash
npm run lint
npm run typecheck
npm test
```

## Build Android

```bash
npm run build:apk    # APK de produção
npm run build:aab    # AAB de produção
```

Identificador do pacote:

| Estágio     | applicationId                   |
| ----------- | ------------------------------- |
| development | `com.caiokenai.troqito.dev`     |
| preview     | `com.caiokenai.troqito.preview` |
| production  | `com.caiokenai.troqito`         |

A assinatura de produção usa um keystore local. O procedimento de geração está em
[`CONTRIBUTING.md`](CONTRIBUTING.md). Keystores e senhas nunca são versionados.

### Gerar um APK sem compilar localmente

A compilação nativa também roda no GitHub Actions, o que é útil quando o
ambiente local não consegue compilar. Em **Actions → Release → Run workflow**,
escolha o estágio e execute; o APK fica anexado à execução como artefato por 30
dias. Ao criar uma tag `v*`, o mesmo workflow publica APK e AAB na Release.

Enquanto não houver keystore de produção configurado, o Gradle assina o release
com a chave de depuração. O APK instala e funciona para teste, mas não serve para
publicação na Google Play.

## Roadmap

O plano completo, com fases, dependências e critérios de conclusão, está em
[`docs/roadmap.md`](docs/roadmap.md). O levantamento de mercado que orientou o
produto está em [`docs/benchmark.md`](docs/benchmark.md).

## Contribuição

Leia [`CONTRIBUTING.md`](CONTRIBUTING.md). Em resumo: uma branch por tarefa a
partir da `main`, commits no formato `Tipo: Mensagem`, e lint, typecheck e testes
passando antes de abrir o Pull Request.

## Segurança

Para relatar uma vulnerabilidade, siga [`SECURITY.md`](SECURITY.md). Não abra
issue pública para falhas de segurança.

## Licença

[AGPL-3.0-or-later](LICENSE).

O Troqito é software livre e deve continuar livre mesmo se for oferecido como
serviço hospedado — é isso que a cláusula 13 da AGPL protege. A análise completa,
incluindo a incompatibilidade conhecida entre a família GPL e a App Store da
Apple, está em [`docs/architecture.md`](docs/architecture.md#215-licença-agpl-30-or-later).

## Releases

Os APKs assinados serão publicados em
[Releases](https://github.com/caio-kenai/Troqito/releases) a partir da `v0.1.0`.
