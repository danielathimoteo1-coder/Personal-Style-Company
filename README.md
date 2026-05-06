# Analise Pessoal IA

MVP local para gerar uma analise pessoal a partir de foto, idade, sexo/genero, altura e contexto de estilo. A aplicacao entrega paleta de cores, roupas, maquiagem, acessorios, compras prioritarias, proximos passos, imagens ilustrativas e exemplos visuais de looks usando a foto enviada como referencia.

A cartela de cores e gerada localmente a partir dos codigos hex retornados na analise, sem usar API de imagem. Ela mostra cores principais, neutros e cores para evitar/adaptar, com opcao de baixar a cartela em SVG.

## Rodar localmente

```bash
npm install
npm run dev
```

Acesse:

```text
http://127.0.0.1:3000
```

## Configurar IA real

Crie um arquivo `.env.local` na raiz do projeto:

```bash
OPENAI_API_KEY=sua_chave_aqui
OPENAI_MODEL=gpt-4.1-mini
OPENAI_IMAGE_MODEL=gpt-image-1-mini
```

Sem `OPENAI_API_KEY`, o app funciona em modo demonstrativo e nao processa a foto com IA.

Os exemplos visuais de looks usam `OPENAI_IMAGE_MODEL` e consomem creditos adicionais da API de imagens. Por padrao, o app usa `gpt-image-1`, duplica a foto original lado a lado e aplica uma mascara automatica na area provavel da roupa para reduzir alteracoes no rosto, corpo, fundo e iluminacao. Para reduzir custo, voce pode trocar para `gpt-image-1-mini`, com menor fidelidade visual.

## Validacao

```bash
npm run build
npm run typecheck
npm audit
```

## Privacidade do MVP

- As fotos nao sao salvas em banco de dados.
- Com `OPENAI_API_KEY`, a imagem enviada e encaminhada para a API da OpenAI para gerar a analise.
- Sem `OPENAI_API_KEY`, a resposta e gerada localmente como exemplo estrutural.

## WhatsApp Cloud API

O MVP tambem inclui um webhook para conduzir a analise pelo WhatsApp:

```text
GET/POST /api/whatsapp/webhook
```

Variaveis necessarias no `.env.local`:

```bash
WHATSAPP_GRAPH_VERSION=v24.0
WHATSAPP_VERIFY_TOKEN=um_token_criado_por_voce
WHATSAPP_ACCESS_TOKEN=token_da_meta
WHATSAPP_PHONE_NUMBER_ID=id_do_numero_da_meta
```

Fluxo:

1. A pessoa envia uma mensagem para o numero do WhatsApp Cloud API.
2. O webhook pergunta foto, idade, altura, colorimetria, rotina, preferencias e restricoes.
3. Ao final, o app baixa a foto enviada pelo WhatsApp, gera a analise e envia o texto de volta.
4. O app gera localmente a cartela visual em PNG e envia como imagem no WhatsApp.

Para testar localmente, publique o servidor com um tunel HTTPS, por exemplo ngrok ou Cloudflare Tunnel, e configure a URL publica:

```text
https://seu-tunel-ou-dominio/api/whatsapp/webhook
```

No painel da Meta, use o mesmo valor de `WHATSAPP_VERIFY_TOKEN` como token de verificacao e assine o evento `messages`.

Observacao de producao: o estado da conversa fica em memoria neste MVP. Para uso real, troque por banco de dados e fila de processamento.
