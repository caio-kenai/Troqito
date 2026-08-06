# Changelog

Todas as mudanças relevantes deste projeto são registradas aqui.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o
versionamento segue [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Não publicado]

### Adicionado

- Levantamento de mercado de aplicativos de finanças pessoais e domésticas
- Documentação de arquitetura com as decisões técnicas e alternativas avaliadas
- Roadmap por fases, com dependências e critérios de conclusão
- Licença AGPL-3.0-or-later
- Guias de contribuição e de segurança
- Modelo de Pull Request
- Projeto Expo SDK 57 com React Native 0.86 e TypeScript em modo estrito
- ESLint, Prettier e scripts de lint, formatação, typecheck e testes
- Jest com `jest-expo` e Testing Library, e primeiros testes
- Configuração por estágio com `applicationId` próprio para cada um
- Leitura validada das variáveis de ambiente
- Integração contínua no GitHub Actions com verificação do build Android
- Paleta própria do Troqito, derivada do ícone do aplicativo
- Temas claro e escuro, com respeito à preferência do sistema
- Componentes base: texto, botão, cartão, tela, skeleton e estados vazio e erro
- Verificação automatizada de contraste WCAG AA nos dois temas
- Aritmética financeira em centavos, com divisão que distribui o resto
- Formatação de moeda e de data em português do Brasil
- Ciclo financeiro configurável a partir do dia de início
- Identificadores UUID v7 gerados no próprio aparelho
- Banco local SQLite com schema Drizzle e migrations versionadas
- Fila de sincronização gravada junto da alteração que a originou
- Navegação por abas com ação central de novo lançamento
- Contas e carteiras com saldo calculado a partir das movimentações
- Categorias iniciais de receita e despesa, com subcategorias
- Perfil local criado na primeira abertura do aplicativo
- Campos de formulário: texto, grupo de opções e data
- Lançamento de receitas e despesas com categoria, conta, data e situação
- Transferência entre contas, gravada como par vinculado de movimentações
- Lista de movimentações agrupada por data, com exclusão
- Tela inicial com saldo total, resumo do período e atividade recente
