# Política de segurança

## Versões suportadas

O projeto está em fase pré-MVP. Até a `v0.1.0`, apenas a `main` recebe correções.

| Versão                         | Suporte |
| ------------------------------ | ------- |
| `main`                         | Sim     |
| Releases anteriores à `v0.1.0` | Não há  |

## Relatando uma vulnerabilidade

**Não abra uma issue pública** para falhas de segurança.

Use o canal privado do GitHub em
[Security Advisories](https://github.com/caio-kenai/Troqito/security/advisories/new).

Inclua, quando possível:

- Descrição da falha e do impacto
- Passos para reproduzir
- Versão e ambiente
- Sugestão de correção, se houver

O retorno inicial acontece em até 7 dias. Como este é um projeto pessoal, não há
programa de recompensa.

## Escopo

Interessa especialmente:

- Contorno das políticas de Row Level Security, permitindo acesso a dados de
  outro usuário ou de casa da qual não se participa
- Escalonamento de papel dentro de uma casa
- Vazamento de token de sessão ou de dado financeiro em log, backup ou anexo
- Falha na exclusão de conta que deixe dados residuais
- Contorno do bloqueio por biometria ou PIN

Fora de escopo: vulnerabilidades no Supabase, no Expo ou no Android que não
sejam causadas por uso incorreto neste projeto — reporte-as ao fornecedor.

## Práticas adotadas

- Tokens de sessão em armazenamento seguro do sistema (Android Keystore), nunca
  em armazenamento comum ou no banco local
- Autorização validada no aplicativo **e** no Postgres via RLS
- Relatórios gerados no dispositivo; dado financeiro não trafega para
  renderização no servidor
- Log sanitizado, sem valores monetários, tokens ou identificadores de conta
- Sem SDK de analytics comportamental
- Segredos fora do versionamento; apenas `.env.example` é versionado
