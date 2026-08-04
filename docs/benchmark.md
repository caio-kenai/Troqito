# Benchmark de aplicativos de finanças pessoais

Levantamento feito antes de definir a arquitetura do Troqito. O objetivo é
entender padrões consolidados de mercado, identificar lacunas que o Troqito pode
ocupar e evitar reinventar convenções que os usuários já dominam.

Nada aqui é cópia de código, texto, identidade visual ou fluxo protegido dos
produtos analisados. As observações descrevem funcionalidades de forma factual e
servem apenas de referência para decisões próprias.

## Produtos analisados

| Produto | Origem | Foco principal | Modelo |
| --- | --- | --- | --- |
| Organizze | Brasil | Controle manual + Open Finance, compartilhamento entre cônjuges | Freemium |
| Mobills | Brasil | Controle de gastos integrado a investimentos, cartões | Freemium |
| Minhas Economias | Brasil | Controle simples, orçamento por categoria | Freemium |
| Wallet by BudgetBakers | República Tcheca | Carteiras compartilhadas, multimoeda, sync bancário amplo | Freemium |
| Spendee | República Tcheca | Carteiras compartilhadas, visual limpo | Freemium |
| YNAB | EUA | Orçamento base zero, disciplina de planejamento | Assinatura |
| Toshl Finance | Eslovênia | Tags profundas, multimoeda, tom lúdico | Freemium |
| Splitwise | EUA | Despesas compartilhadas e acerto de contas entre pessoas | Freemium |
| Apps bancários | Brasil | Dashboards de extrato, fatura de cartão, limites | Gratuito |

## O que o mercado já resolve bem

### Lançamento rápido é o fator de retenção

O maior ponto de abandono desses aplicativos é o atrito de registrar um gasto. Os
produtos que sobrevivem reduzem o lançamento a poucos toques, pré-selecionam a
data de hoje, a última conta usada e sugerem categoria a partir do histórico.
Organizze é frequentemente citado como mais agradável que o Mobills justamente
por ser menos carregado, mesmo oferecendo menos recursos.

**Impacto no Troqito:** o botão central de adicionar deve abrir um formulário que
já vem preenchido com padrões sensatos, exigindo do usuário apenas valor e
categoria. Campos avançados (anexos, tags, localização, divisão) ficam atrás de
uma seção recolhida.

### Conta e carteira são conceitos separados do lançamento

Todos os produtos maduros modelam contas como entidades de primeira classe com
saldo próprio, e permitem excluir contas específicas do saldo consolidado
(poupança de terceiros, conta de investimento, vale-refeição). Cartão de crédito
recebe tratamento distinto de conta corrente porque o gasto não sai do saldo no
momento da compra.

**Impacto no Troqito:** cartão de crédito é uma entidade própria com fatura,
fechamento e vencimento, não um tipo de conta com saldo negativo. Toda conta tem
a opção "incluir no saldo consolidado".

### Transferência não é receita nem despesa

Um erro clássico de aplicativos imaturos é contabilizar transferência entre
contas próprias como entrada e saída, inflando os totais do mês. Os produtos
sérios criam um par de movimentações vinculadas e excluem esse par dos
relatórios de receita/despesa.

**Impacto no Troqito:** a transferência é um tipo de transação com origem e
destino, com `transfer_group_id` ligando as duas pernas, e é filtrada por padrão
de todos os agregados de receita e despesa.

### Parcelamento precisa de rastreabilidade da compra original

Mobills e Organizze tratam parcelamento vinculando todas as parcelas a uma compra
original, permitindo editar a série inteira, antecipar ou cancelar as futuras. O
erro comum é criar doze despesas soltas sem vínculo.

**Impacto no Troqito:** existe a entidade `installment_plans`, e cada parcela é
uma transação com referência ao plano e ao número da parcela. O arredondamento é
resolvido distribuindo os centavos restantes nas primeiras parcelas.

### Recorrência precisa de três modos de edição

Aplicativos de calendário resolveram esse problema há décadas e os apps
financeiros bons copiaram: editar apenas esta ocorrência, esta e as próximas, ou
a série toda. Quem não faz isso obriga o usuário a apagar e recriar tudo.

**Impacto no Troqito:** a recorrência é uma regra (`recurrence_rules`) que gera
ocorrências materializadas. Editar "apenas esta" cria uma exceção; editar "esta e
as próximas" encerra a regra atual e cria uma nova a partir da data.

### Orçamento: dois modelos coexistem no mercado

YNAB usa base zero — cada real recebido recebe uma função antes de ser gasto. É
poderoso mas exige disciplina semanal e curva de aprendizado, o que afasta o
usuário casual. Organizze, Mobills e Wallet usam o modelo de teto por categoria,
mais simples e imediatamente compreensível.

**Impacto no Troqito:** o MVP adota teto por categoria/período, que é o modelo que
a maioria dos usuários brasileiros já entende. A modelagem guarda o orçamento
como uma alocação por escopo e período, o que deixa a porta aberta para um modo
base zero futuro sem migração destrutiva.

### Divisão de despesas é um produto à parte

Splitwise domina esse nicho por focar em uma coisa: quem pagou, quem participa e
qual o saldo líquido entre as pessoas. O recurso de simplificação de dívidas
reduz o número de pagamentos necessários sem alterar o saldo total de ninguém —
se Ana deve a Bruno e Bruno deve a Carla o mesmo valor, Ana paga direto a Carla.
Wallet e Spendee oferecem carteiras compartilhadas, e o Organizze é citado como o
melhor compartilhamento entre cônjuges no Brasil, mas nenhum deles combina bem
finanças pessoais completas com divisão granular.

**Impacto no Troqito:** essa é a lacuna que o produto ataca. A divisão fica
integrada ao lançamento de despesa (não em um app separado), com divisão igual,
por valor e por porcentagem, e uma tela de saldos entre participantes da casa. A
simplificação de dívidas entra como funcionalidade posterior, com o saldo bruto
sempre visível para auditoria.

### Multimoeda e idioma

Toshl suporta 25+ idiomas, Wallet 15+, YNAB apenas inglês. Multimoeda importa
para viajantes e expatriados, mas adiciona complexidade grande (taxa de câmbio
histórica por lançamento).

**Impacto no Troqito:** o MVP é BRL e pt-BR, mas nenhum valor monetário é
formatado com string fixa `R$` no código, e a coluna de moeda existe desde a
primeira migration. Internacionalização é preparação arquitetural, não entrega do
MVP.

### Sincronização bancária (Open Finance) é o principal diferencial pago

Organizze e Mobills colocam o sync bancário atrás do plano pago; Wallet cita
15.000+ instituições, Spendee 2.500+. É caro, exige homologação regulatória e
parceria com agregadores.

**Impacto no Troqito:** fora de escopo, inclusive fora do roadmap de longo prazo,
por ser inviável para um projeto pessoal open source. A compensação é tornar o
lançamento manual e a importação por CSV/OFX muito boas.

## Lacunas identificadas

Pontos em que os produtos analisados deixam a desejar e que orientam o
posicionamento do Troqito:

1. **Finanças completas + divisão granular no mesmo app.** Quem quer controle
   pessoal sério usa Organizze/Mobills; quem divide contas usa Splitwise. Manter
   os dois em paralelo é retrabalho.
2. **Offline real.** Vários apps exigem conexão para abrir. Um app de finanças
   precisa registrar um gasto no caixa do supermercado sem sinal.
3. **Exportação dos próprios dados.** Frequentemente é recurso pago ou limitado.
   Exportar PDF/CSV/XLSX completo será gratuito e irrestrito no Troqito.
4. **Acessibilidade em gráficos.** Praticamente todos dependem só de cor para
   distinguir séries. O Troqito usará rótulo, padrão e valor textual, além de cor.
5. **Papéis e permissões em grupo.** O compartilhamento normalmente é "tudo ou
   nada". O Troqito terá proprietário, administrador, membro e visualizador.
6. **Privacidade.** Um app de finanças pessoais não precisa de telemetria
   comportamental. O Troqito não terá analytics de comportamento.

## Como isso define o Troqito

| Decisão | Origem no benchmark |
| --- | --- |
| Offline-first com banco local como fonte de verdade | Lacuna 2 |
| Cartão de crédito como entidade com fatura própria | Prática consolidada |
| Transferência como par vinculado fora dos agregados | Prática consolidada |
| Parcelamento vinculado à compra original | Mobills / Organizze |
| Recorrência com três modos de edição | Prática consolidada |
| Orçamento por teto de categoria no MVP | Organizze / Mobills / Wallet |
| Divisão de despesa integrada, com saldos entre pessoas | Splitwise + lacuna 1 |
| Papéis por casa validados no cliente e no banco | Lacuna 5 |
| Exportação completa e gratuita | Lacuna 3 |
| Gráficos que não dependem só de cor | Lacuna 4 |
| Sem telemetria comportamental | Lacuna 6 |
| Sem Open Finance | Inviabilidade prática |

## Fontes consultadas

- [Mobills x Organizze x FinVibe x Minhas Economias — FinVibe](https://www.finvibe.app/blog/mobills-x-organizze-x-finvibe-x-minhas-economias-qual-o-melhor-app-de-financas)
- [Melhores aplicativos de controle financeiro 2026 — Gazeta Brasília](https://gazetabrasilia.com.br/melhores-aplicativos-de-controle-financeiro-2026/)
- [Opções de aplicativo para controle financeiro — Serasa](https://www.serasa.com.br/score/blog/opcoes-de-aplicativo-para-controle-financeiro/)
- [Wallet by BudgetBakers Review 2026 — Finny](https://getfinny.app/blog/wallet-budgetbakers-review-2026)
- [Best Budgeting Apps for Europe 2026 — Monavio](https://monavio.app/blog/best-budget-apps-europe/)
- [Best YNAB Alternatives — The CFO Club](https://thecfoclub.com/tools/best-ynab-alternatives/)
- [What is Simplify Debts? — Splitwise Help Center](https://kb.splitwise.com/balances-and-expenses/what-is-simplify-debts)
- [Algorithm Behind Splitwise's Debt Simplification Feature](https://medium.com/@mithunmk93/algorithm-behind-splitwises-debt-simplification-feature-8ac485e97688)
- [Splitwise — Wikipedia](https://en.wikipedia.org/wiki/Splitwise)
