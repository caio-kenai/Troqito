# Contribuindo com o Troqito

## Ambiente

- Node.js 20 ou superior
- JDK 17
- Android SDK com plataforma 35
- Dispositivo ou emulador Android

```bash
npm install
cp .env.example .env
npm run android
```

Expo Go não é suportado. O banco local e a biometria exigem um development build.

## Fluxo de trabalho

Uma tarefa por branch, uma branch por Pull Request. Nunca há duas branches de
implementação abertas ao mesmo tempo, e nunca se commita direto na `main`.

```bash
git checkout main
git pull origin main
git checkout -b feat/nome-da-tarefa

# implementação

npm run lint
npm run typecheck
npm test

git add .
git commit -m "Feat: Implementar funcionalidade"
git push -u origin feat/nome-da-tarefa
gh pr create --base main --head feat/nome-da-tarefa
```

Depois das verificações passarem:

```bash
gh pr merge --merge --delete-branch
git checkout main
git pull origin main
git branch -d feat/nome-da-tarefa
git fetch --prune
```

A estratégia de merge é **squash**, para que a `main` tenha um commit por tarefa
entregue.

### Nomes de branch

| Prefixo     | Uso                                        |
| ----------- | ------------------------------------------ |
| `feat/`     | Nova funcionalidade                        |
| `fix/`      | Correção                                   |
| `refactor/` | Reorganização sem mudança de comportamento |
| `test/`     | Apenas testes                              |
| `docs/`     | Apenas documentação                        |
| `chore/`    | Build, dependências, configuração          |

## Commits

O tipo e o título começam com letra maiúscula:

```
Feat: Implementar cadastro de despesas
Fix: Corrigir cálculo de saldo mensal
Test: Adicionar testes de criação de transações
```

Não use `feat: criar estrutura`, `FEAT: Criar estrutura` nem
`feat(project): criar estrutura`.

Quando houver corpo, use apenas tópicos com `-`:

```
Feat: Implementar despesas recorrentes

- Adicionar configuração de periodicidade
- Criar cálculo da próxima ocorrência
- Exibir recorrência nos detalhes da despesa
```

Cada commit cobre uma única alteração lógica. Funcionalidades não relacionadas
não se misturam no mesmo commit.

## Padrões de código

- TypeScript estrito. `any` é erro de lint.
- Regra financeira vive em `features/<dominio>/domain`, nunca em componente.
- **Nenhum cálculo monetário com ponto flutuante.** Use `src/lib/money`.
- Validação com Zod na fronteira; o tipo é inferido do schema.
- Comentário só quando explica uma decisão ou restrição não óbvia pelo código.
- Sem valores mágicos: use os tokens do tema e as constantes do domínio.

### Antes de adicionar uma dependência

Verifique compatibilidade com a versão atual do React Native e do Expo, se o
projeto recebe manutenção e qual o impacto no Android. Não adicione biblioteca
para tarefa simples. Registre a decisão em `docs/architecture.md` quando for
relevante.

Nunca resolva conflito de dependência com `--force` ou `--legacy-peer-deps`.
Se houver conflito de peer dependency, investigue a causa e ajuste as versões.

## Testes

```bash
npm test                 # tudo
npm test -- --watch      # durante o desenvolvimento
npm test -- --coverage   # cobertura
```

Regra financeira sem teste não entra na `main`. A prioridade é cálculo monetário,
permissões, sincronização e, por último, interface.

No `@testing-library/react-native` 14 o `render` é assíncrono. Sempre use
`await render(...)`; sem o `await`, `screen` ainda não terá sido preenchido e o
teste falha com `render function has not been called`. O TypeScript não acusa
isso quando o retorno é descartado.

## Assinatura do build Android

O keystore de produção **nunca** é versionado. Gere o seu localmente:

```bash
keytool -genkeypair -v \
  -keystore troqito-release.keystore \
  -alias troqito \
  -keyalg RSA -keysize 2048 -validity 10000
```

Guarde o arquivo fora do repositório e crie `android/keystore.properties`:

```properties
storeFile=/caminho/absoluto/para/troqito-release.keystore
storePassword=SUA_SENHA
keyAlias=troqito
keyPassword=SUA_SENHA
```

`.gitignore` já bloqueia `*.keystore` e `keystore.properties`. Perder o keystore
significa não conseguir mais atualizar o aplicativo publicado — mantenha backup
seguro.

## Licença das contribuições

O projeto é licenciado sob AGPL-3.0-or-later. Ao enviar uma contribuição, você
concorda em licenciá-la sob os mesmos termos e confirma que tem o direito de
fazê-lo, sinalizando com `git commit -s` (Developer Certificate of Origin).
