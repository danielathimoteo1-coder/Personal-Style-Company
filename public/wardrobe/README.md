# Guarda-roupa da Ellie

Coloque as fotos reais seguindo esta estrutura:

```text
public/wardrobe/categoria/subcategoria/cor/modelagem-ou-estilo/nome-da-peca.jpg
```

Exemplo:

```text
public/wardrobe/vestidos/vestidos-longos/vinho/tomara-que-caia/vestido-longo-vinho-001.jpg
```

Extensoes aceitas: `.jpg`, `.jpeg`, `.png` e `.webp`.

Depois de adicionar imagens, rode:

```bash
npm run generate:wardrobe-catalog
```

Esse comando atualiza `public/wardrobe/catalog.generated.json` e `lib/wardrobe-catalog.generated.ts`. A Ellie usa os IDs gerados no catalogo e nunca inventa caminhos de imagens.
