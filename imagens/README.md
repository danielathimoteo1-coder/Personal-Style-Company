# Imagens do guarda-roupa da Ellie

Coloque as fotos reais nesta pasta usando apenas a categoria principal.

Padrao simples:

```text
imagens/categoria/nome-da-peca.jpg
imagens/categoria/nome-da-peca_modelo.jpg
```

Exemplos:

```text
imagens/calcas/calca_jeans_reta.png
imagens/calcas/calca_jeans_reta_modelo.png
imagens/vestidos/vestido_longo_vinho.png
imagens/vestidos/vestido_longo_vinho_modelo.png
imagens/acessorios/oculos_sol_tartaruga.png
imagens/acessorios/oculos_sol_tartaruga_modelo.png
```

Regras:

- O nome do arquivo vira o nome da peca no catalogo.
- O arquivo terminado em `_modelo` e tratado como a foto da modelo usando a mesma peca.
- A IA escolhe apenas o ID da peca principal. O sistema mostra a foto da peca e, quando existir, a foto `_modelo` junto.
- As extensoes aceitas sao `.jpg`, `.jpeg`, `.png` e `.webp`.
- Subpastas antigas ainda sao lidas para nao quebrar imagens ja adicionadas, mas daqui para frente use o formato simples acima.

Depois de adicionar ou remover imagens, rode:

```bash
npm run generate:wardrobe-catalog
```

Esse comando copia as imagens para a pasta publica do site e atualiza o mapa que a Ellie usa para escolher as pecas.
