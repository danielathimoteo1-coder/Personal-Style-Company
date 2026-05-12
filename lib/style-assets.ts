export const VISUAL_ASSET_IDS = [
  "color-palette",
  "capsule-rack",
  "work-tailoring",
  "beach-light",
  "wedding-guest",
  "snow-layering",
  "church-elegant",
  "college-casual",
  "home-comfort",
  "night-event",
  "travel-capsule",
  "sunglasses",
  "eyeglasses",
  "gold-jewelry",
  "structured-bag",
  "belt",
  "natural-makeup",
  "bold-lip",
  "hair-accessories",
  "shopping-priority",
] as const;

export type VisualAssetId = (typeof VISUAL_ASSET_IDS)[number];

export type StaticVisualAsset = {
  id: VisualAssetId;
  title: string;
  src: string;
  alt: string;
  caption: string;
  tags: string[];
};

type AssetAnalysis = {
  roupas?: {
    ocasioes_especificas?: Array<{
      ocasiao?: string;
      asset_id?: string;
    }>;
  };
  maquiagem?: Record<string, unknown>;
  acessorios?: Record<string, unknown>;
  compras?: unknown[];
};

export const visualAssetCatalog: StaticVisualAsset[] = [
  {
    id: "color-palette",
    title: "Paleta aplicada",
    src: "/style-assets/color-palette.png",
    alt: "Amostras de cores coordenadas para roupas e beleza",
    caption: "Referencia para enxergar as cores em materiais e combinacoes.",
    tags: ["paleta", "cores", "tecidos"],
  },
  {
    id: "capsule-rack",
    title: "Base coordenada",
    src: "/style-assets/capsule-rack.png",
    alt: "Arara de roupas com pecas coordenadas",
    caption: "Base versatil para montar looks com menos compras avulsas.",
    tags: ["roupas", "base", "capsula"],
  },
  {
    id: "work-tailoring",
    title: "Trabalho",
    src: "/style-assets/work-tailoring.png",
    alt: "Referencia visual de alfaiataria para trabalho",
    caption: "Linhas limpas, terceira peca e cores com presenca profissional.",
    tags: ["trabalho", "reuniao", "profissional", "alfaiataria"],
  },
  {
    id: "beach-light",
    title: "Praia",
    src: "/style-assets/beach-light.png",
    alt: "Referencia visual para look de praia",
    caption: "Tecidos leves, protecao solar e cores frescas.",
    tags: ["praia", "verao", "piscina", "calor"],
  },
  {
    id: "wedding-guest",
    title: "Casamento",
    src: "/style-assets/wedding-guest.png",
    alt: "Referencia visual para convidada ou convidado de casamento",
    caption: "Acabamento elegante para cerimonias e eventos sociais.",
    tags: ["casamento", "festa", "cerimonia", "formatura"],
  },
  {
    id: "snow-layering",
    title: "Frio intenso",
    src: "/style-assets/snow-layering.png",
    alt: "Referencia visual de camadas para frio intenso",
    caption: "Camadas, casacos e textura para neve ou frio forte.",
    tags: ["neve", "frio", "inverno", "camadas"],
  },
  {
    id: "church-elegant",
    title: "Igreja ou cerimonia",
    src: "/style-assets/church-elegant.png",
    alt: "Referencia visual de roupa discreta para cerimonia",
    caption: "Elegancia discreta para ambientes que pedem mais sobriedade.",
    tags: ["igreja", "templo", "cerimonia", "discreto"],
  },
  {
    id: "college-casual",
    title: "Faculdade",
    src: "/style-assets/college-casual.png",
    alt: "Referencia visual para rotina de faculdade",
    caption: "Conforto, praticidade e identidade visual para rotina longa.",
    tags: ["faculdade", "estudo", "aula", "casual"],
  },
  {
    id: "home-comfort",
    title: "Casa e home office",
    src: "/style-assets/home-comfort.png",
    alt: "Referencia visual para casa e home office",
    caption: "Conforto com aparencia cuidada para casa e videochamadas.",
    tags: ["casa", "home office", "conforto", "rotina"],
  },
  {
    id: "night-event",
    title: "Evento noturno",
    src: "/style-assets/night-event.png",
    alt: "Referencia visual para evento noturno",
    caption: "Contraste, brilho pontual e acabamento para noite.",
    tags: ["noite", "jantar", "evento", "festa"],
  },
  {
    id: "travel-capsule",
    title: "Viagem",
    src: "/style-assets/travel-capsule.png",
    alt: "Referencia visual para mala inteligente de viagem",
    caption: "Pecas que repetem bem e combinam entre si na mala.",
    tags: ["viagem", "mala", "capsula", "aeroporto"],
  },
  {
    id: "sunglasses",
    title: "Oculos de sol",
    src: "/style-assets/sunglasses.png",
    alt: "Referencia visual de oculos de sol",
    caption: "Formato, escala e cor da armacao como ponto de estilo.",
    tags: ["oculos de sol", "oculos", "acessorios", "praia"],
  },
  {
    id: "eyeglasses",
    title: "Armacao de grau",
    src: "/style-assets/eyeglasses.png",
    alt: "Referencia visual de armacao de oculos",
    caption: "Linhas da armacao ajudam a equilibrar expressao e rosto.",
    tags: ["armacao", "oculos de grau", "rosto"],
  },
  {
    id: "gold-jewelry",
    title: "Joias e metais",
    src: "/style-assets/gold-jewelry.png",
    alt: "Referencia visual de joias e metais",
    caption: "Metais, escala e brilho para iluminar sem pesar.",
    tags: ["joias", "metais", "brincos", "colar"],
  },
  {
    id: "structured-bag",
    title: "Bolsa estruturada",
    src: "/style-assets/structured-bag.png",
    alt: "Referencia visual de bolsa estruturada",
    caption: "Acabamento de bolsa para organizar e elevar looks.",
    tags: ["bolsa", "couro", "trabalho", "acessorios"],
  },
  {
    id: "belt",
    title: "Cinto e acabamento",
    src: "/style-assets/belt.png",
    alt: "Referencia visual de cinto",
    caption: "Cinto, fivela e sapato coordenados fecham o look.",
    tags: ["cinto", "sapato", "acabamento", "couro"],
  },
  {
    id: "natural-makeup",
    title: "Maquiagem natural",
    src: "/style-assets/natural-makeup.png",
    alt: "Referencia visual de maquiagem natural",
    caption: "Textura leve e tons de beleza para uso frequente.",
    tags: ["maquiagem", "natural", "pele", "blush"],
  },
  {
    id: "bold-lip",
    title: "Batom marcante",
    src: "/style-assets/bold-lip.png",
    alt: "Referencia visual de batom marcante",
    caption: "Cor de boca como assinatura simples e forte.",
    tags: ["batom", "labios", "maquiagem", "noite"],
  },
  {
    id: "hair-accessories",
    title: "Cabelo e acessorios",
    src: "/style-assets/hair-accessories.png",
    alt: "Referencia visual de cabelo e acessorios",
    caption: "Cabelo, presilhas e acabamento perto do rosto.",
    tags: ["cabelo", "presilha", "acessorios"],
  },
  {
    id: "shopping-priority",
    title: "Compras prioritarias",
    src: "/style-assets/shopping-priority.png",
    alt: "Referencia visual de compras prioritarias",
    caption: "Ajuda a transformar recomendacoes em lista de compra enxuta.",
    tags: ["compras", "prioridade", "guarda roupa"],
  },
];

const assetById = new Map(visualAssetCatalog.map((asset) => [asset.id, asset]));

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function getAssetById(id?: string) {
  return assetById.get(id as VisualAssetId) || assetById.get("capsule-rack")!;
}

export function pickAssetForOccasion(occasion: string): VisualAssetId {
  const normalized = normalizeText(occasion);

  if (/(praia|piscina|verao|calor)/.test(normalized)) return "beach-light";
  if (/(casamento|cerimonia|formatura|festa)/.test(normalized)) return "wedding-guest";
  if (/(neve|frio|inverno|camada)/.test(normalized)) return "snow-layering";
  if (/(igreja|templo|culto|religios|sobri|discreto)/.test(normalized)) {
    return "church-elegant";
  }
  if (/(faculdade|universidade|aula|estudo|campus)/.test(normalized)) {
    return "college-casual";
  }
  if (/(casa|home|remoto|videochamada)/.test(normalized)) return "home-comfort";
  if (/(noite|jantar|bar|evento)/.test(normalized)) return "night-event";
  if (/(viagem|mala|aeroporto)/.test(normalized)) return "travel-capsule";
  if (/(trabalho|reuniao|escritorio|profissional|entrevista)/.test(normalized)) {
    return "work-tailoring";
  }

  return "capsule-rack";
}

function addMatchIds(ids: Set<VisualAssetId>, text: string) {
  const normalized = normalizeText(text);

  if (/oculos de sol|solar|praia/.test(normalized)) ids.add("sunglasses");
  if (/oculos|armacao/.test(normalized)) ids.add("eyeglasses");
  if (/joia|brinco|colar|metal|pulseira/.test(normalized)) ids.add("gold-jewelry");
  if (/bolsa/.test(normalized)) ids.add("structured-bag");
  if (/cinto|sapato|calcado|loafer|sandalia/.test(normalized)) ids.add("belt");
  if (/maquiagem|blush|base|mascara|pele/.test(normalized)) ids.add("natural-makeup");
  if (/batom|labio/.test(normalized)) ids.add("bold-lip");
  if (/cabelo|presilha|penteado/.test(normalized)) ids.add("hair-accessories");
  if (/compra|prioridade|orcamento/.test(normalized)) ids.add("shopping-priority");
}

export function getStaticVisualAssetsForAnalysis(analysis: AssetAnalysis, limit = 12) {
  const ids = new Set<VisualAssetId>();

  analysis.roupas?.ocasioes_especificas?.forEach((occasion) => {
    const explicitId = VISUAL_ASSET_IDS.includes(occasion.asset_id as VisualAssetId)
      ? (occasion.asset_id as VisualAssetId)
      : pickAssetForOccasion(occasion.ocasiao || "");
    ids.add(explicitId);
  });

  addMatchIds(ids, JSON.stringify(analysis));

  [
    "color-palette",
    "capsule-rack",
    "work-tailoring",
    "sunglasses",
    "natural-makeup",
    "structured-bag",
  ].forEach((id) => ids.add(id as VisualAssetId));

  return Array.from(ids)
    .slice(0, limit)
    .map((id) => getAssetById(id));
}
