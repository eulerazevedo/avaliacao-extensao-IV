# Pitch Extensão IV · Avaliação

Site para os empresários convidados avaliarem os 8 pitches de Extensão IV (Uninorte), com o mesmo tema do portfólio. HTML, CSS e JS puros mais funções serverless da Vercel, sem build e sem dependências. Cabe no plano **Hobby (gratuito)**.

| Rota | Quem usa | O que faz |
|---|---|---|
| `/` | todos | Projetos na ordem sorteada, pedido de cada equipe e os critérios |
| `/avaliar` | empresários | Nome + senha de avaliação, depois 6 critérios de 0 a 10 por equipe |
| `/resultado` | só você | Senha própria: ranking, notas por critério e por avaliador, comentários, CSV |

## Como a nota é calculada

Cada avaliador dá 0 a 10 (de 0,5 em 0,5) em 6 critérios: problema e relevância, solução e produto, inovação e diferencial, valor para empresas, impacto social, clareza e apresentação. A nota do avaliador é a média dos 6; a nota do projeto é a média entre os avaliadores. Fica sempre entre 0 e 10. Cada avaliador pode reabrir e alterar a própria nota (vale a última salva).

## Publicar na Vercel (uma vez, uns 5 minutos)

1. Crie o repositório no GitHub e suba esta pasta.
2. Na Vercel: **Add New > Project**, importe o repositório. Framework **Other**, sem build command.
3. Em **Settings > Environment Variables**, crie:
   - `AVALIACAO_SENHA`: a senha curta que os empresários vão digitar (uma palavra fácil de digitar).
   - `RESULTADO_SENHA`: a sua, só para ver as notas.
   - `SESSION_SECRET` (opcional): qualquer texto longo.
4. Em **Storage** (ou Marketplace), crie um banco **Upstash Redis** no plano gratuito e conecte ao projeto. A Vercel preenche sozinha `KV_REST_API_URL` e `KV_REST_API_TOKEN`.
5. Faça **Redeploy** (variável nova só vale em deploy novo).

Para conferir: abra `/resultado`. Se aparecer o aviso vermelho "Banco não conectado", o passo 4 ficou faltando.

## Antes do evento

- Teste uma avaliação sua e depois use **Zerar todas as avaliações** em `/resultado` (digite ZERAR).
- Passe aos empresários só o endereço `/avaliar` e a senha de avaliação.
- Equipes, ordem, textos e critérios ficam em `api/_config.js`.

## Testar no computador

```bash
npm run dev    # http://localhost:4173, senhas locais: dev-avaliar e dev-resultado
```

Sem as variáveis do Redis as notas ficam só na memória e somem ao reiniciar. É só para teste.

## Segurança

Senhas só no servidor (variáveis de ambiente), comparação em tempo constante, sessão assinada em cookie `HttpOnly` + `SameSite=Strict` (12 h), bloqueio de 10 minutos após 8 senhas erradas por IP, notas validadas no servidor, páginas com `noindex`.
