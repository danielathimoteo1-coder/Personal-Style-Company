# Saida publica do guarda-roupa

Nao coloque imagens manualmente aqui.

Use a pasta raiz `imagens/` com o formato:

```text
imagens/categoria/nome-da-peca.jpg
imagens/categoria/nome-da-peca_modelo.jpg
```

Depois rode:

```bash
npm run generate:wardrobe-catalog
```

Arquivos gerados:

```text
public/wardrobe/items/...
public/wardrobe/catalog.generated.json
lib/wardrobe-catalog.generated.ts
```
