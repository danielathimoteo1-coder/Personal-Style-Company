# Imagens do guarda-roupa da Ellie

Coloque todas as fotos reais nesta pasta, usando subpastas livres.

Padrao recomendado:

```text
imagens/categoria/subcategoria/cor/modelagem-ou-estilo/nome-da-peca.jpg
```

Exemplos:

```text
imagens/vestidos/vestidos-longos/vinho/tomara-que-caia/vestido-longo-vinho-001.jpg
imagens/acessorios/oculos-de-sol/preto/quadrado/oculos-sol-preto-001.jpg
imagens/sapatos/sandalias/dourado/salto-fino/sandalia-dourada-001.jpg
imagens/praia/biquinis/verde-musgo/cortininha/biquini-verde-musgo-001.jpg
```

Extensoes aceitas: `.jpg`, `.jpeg`, `.png` e `.webp`.

Depois de adicionar ou remover imagens, rode:

```bash
npm run generate:wardrobe-catalog
```

O sistema copia tudo para a pasta publica do site e atualiza o mapa que a Ellie usa para escolher as pecas.
