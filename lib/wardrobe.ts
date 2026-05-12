import { generatedWardrobeCatalog } from "@/lib/wardrobe-catalog.generated";

export const WARDROBE_OCCASIONS = [
  "Praia",
  "Faculdade",
  "Casamento",
  "Trabalho formal",
  "Trabalho informal",
  "Passeio casual",
  "Evento noturno",
  "Igreja/cerimonia discreta",
  "Dias frios",
  "Dias quentes",
  "Viagem",
  "Casa/home office",
] as const;

export type WardrobeOccasion = (typeof WARDROBE_OCCASIONS)[number];

export type WardrobeItem = {
  id: string;
  titulo: string;
  categoria: string;
  subcategoria: string;
  cor: string;
  modelagem: string;
  ocasioes: readonly string[];
  generos: readonly string[];
  altura_recomendada: readonly string[];
  tom_pele: readonly string[];
  subtom: readonly string[];
  formalidade: string;
  clima: readonly string[];
  tags: readonly string[];
  src: string;
  fallback?: boolean;
};

export type WardrobeImageAsset = {
  id: string;
  title: string;
  src: string;
  alt: string;
  caption: string;
  tags: readonly string[];
  fallback: boolean;
};

type AnalysisWardrobeShape = {
  roupas?: {
    ocasioes_especificas?: Array<{
      ocasiao?: string;
      pecas?: string[];
    }>;
  };
  maquiagem?: Record<string, unknown>;
  acessorios?: Record<string, unknown>;
  compras?: unknown[];
};

const fallbackWardrobeCatalog: readonly WardrobeItem[] = [
  {
    id: "fallback_color_palette",
    titulo: "Paleta aplicada",
    categoria: "paleta",
    subcategoria: "cores",
    cor: "multicolor",
    modelagem: "moodboard",
    ocasioes: WARDROBE_OCCASIONS,
    generos: ["feminino", "masculino", "nao-binario", "prefiro-nao-informar"],
    altura_recomendada: ["baixa", "media", "alta"],
    tom_pele: ["muito claro", "claro", "medio", "moreno", "escuro", "retinto", "oliva"],
    subtom: ["quente", "frio", "neutro", "oliva"],
    formalidade: "versatil",
    clima: ["todos"],
    tags: ["paleta", "cores", "tecidos"],
    src: "/style-assets/color-palette.png",
    fallback: true,
  },
  {
    id: "fallback_capsule_rack",
    titulo: "Base coordenada",
    categoria: "guarda-roupa",
    subcategoria: "capsula",
    cor: "neutros",
    modelagem: "base versatil",
    ocasioes: WARDROBE_OCCASIONS,
    generos: ["feminino", "masculino", "nao-binario", "prefiro-nao-informar"],
    altura_recomendada: ["baixa", "media", "alta"],
    tom_pele: ["muito claro", "claro", "medio", "moreno", "escuro", "retinto", "oliva"],
    subtom: ["quente", "frio", "neutro", "oliva"],
    formalidade: "versatil",
    clima: ["todos"],
    tags: ["roupas", "base", "capsula"],
    src: "/style-assets/capsule-rack.png",
    fallback: true,
  },
  {
    id: "fallback_work_tailoring",
    titulo: "Trabalho formal",
    categoria: "trabalho",
    subcategoria: "alfaiataria",
    cor: "neutros",
    modelagem: "terceira peca",
    ocasioes: ["Trabalho formal", "Trabalho informal"],
    generos: ["feminino", "masculino", "nao-binario", "prefiro-nao-informar"],
    altura_recomendada: ["baixa", "media", "alta"],
    tom_pele: ["muito claro", "claro", "medio", "moreno", "escuro", "retinto", "oliva"],
    subtom: ["quente", "frio", "neutro", "oliva"],
    formalidade: "formal",
    clima: ["ameno", "frio", "ar-condicionado"],
    tags: ["trabalho", "reuniao", "profissional", "alfaiataria"],
    src: "/style-assets/work-tailoring.png",
    fallback: true,
  },
  {
    id: "fallback_beach_light",
    titulo: "Praia",
    categoria: "praia",
    subcategoria: "look leve",
    cor: "claros",
    modelagem: "tecidos leves",
    ocasioes: ["Praia", "Dias quentes", "Viagem"],
    generos: ["feminino", "masculino", "nao-binario", "prefiro-nao-informar"],
    altura_recomendada: ["baixa", "media", "alta"],
    tom_pele: ["muito claro", "claro", "medio", "moreno", "escuro", "retinto", "oliva"],
    subtom: ["quente", "frio", "neutro", "oliva"],
    formalidade: "casual",
    clima: ["calor", "praia", "verao"],
    tags: ["praia", "verao", "piscina", "calor"],
    src: "/style-assets/beach-light.png",
    fallback: true,
  },
  {
    id: "fallback_wedding_guest",
    titulo: "Casamento",
    categoria: "eventos",
    subcategoria: "casamento",
    cor: "elegantes",
    modelagem: "festa",
    ocasioes: ["Casamento", "Evento noturno", "Igreja/cerimonia discreta"],
    generos: ["feminino", "masculino", "nao-binario", "prefiro-nao-informar"],
    altura_recomendada: ["baixa", "media", "alta"],
    tom_pele: ["muito claro", "claro", "medio", "moreno", "escuro", "retinto", "oliva"],
    subtom: ["quente", "frio", "neutro", "oliva"],
    formalidade: "social",
    clima: ["ameno", "noite"],
    tags: ["casamento", "festa", "cerimonia", "formatura"],
    src: "/style-assets/wedding-guest.png",
    fallback: true,
  },
  {
    id: "fallback_snow_layering",
    titulo: "Dias frios",
    categoria: "frio",
    subcategoria: "camadas",
    cor: "neutros escuros",
    modelagem: "casaco estruturado",
    ocasioes: ["Dias frios", "Viagem"],
    generos: ["feminino", "masculino", "nao-binario", "prefiro-nao-informar"],
    altura_recomendada: ["baixa", "media", "alta"],
    tom_pele: ["muito claro", "claro", "medio", "moreno", "escuro", "retinto", "oliva"],
    subtom: ["quente", "frio", "neutro", "oliva"],
    formalidade: "versatil",
    clima: ["frio", "neve", "inverno"],
    tags: ["neve", "frio", "inverno", "camadas"],
    src: "/style-assets/snow-layering.png",
    fallback: true,
  },
  {
    id: "fallback_church_elegant",
    titulo: "Igreja ou cerimonia discreta",
    categoria: "cerimonia",
    subcategoria: "discreto",
    cor: "neutros",
    modelagem: "cobertura sobria",
    ocasioes: ["Igreja/cerimonia discreta", "Casamento"],
    generos: ["feminino", "masculino", "nao-binario", "prefiro-nao-informar"],
    altura_recomendada: ["baixa", "media", "alta"],
    tom_pele: ["muito claro", "claro", "medio", "moreno", "escuro", "retinto", "oliva"],
    subtom: ["quente", "frio", "neutro", "oliva"],
    formalidade: "discreto",
    clima: ["ameno"],
    tags: ["igreja", "templo", "cerimonia", "discreto"],
    src: "/style-assets/church-elegant.png",
    fallback: true,
  },
  {
    id: "fallback_college_casual",
    titulo: "Faculdade",
    categoria: "casual",
    subcategoria: "faculdade",
    cor: "coordenados",
    modelagem: "confortavel",
    ocasioes: ["Faculdade", "Passeio casual", "Dias quentes"],
    generos: ["feminino", "masculino", "nao-binario", "prefiro-nao-informar"],
    altura_recomendada: ["baixa", "media", "alta"],
    tom_pele: ["muito claro", "claro", "medio", "moreno", "escuro", "retinto", "oliva"],
    subtom: ["quente", "frio", "neutro", "oliva"],
    formalidade: "casual",
    clima: ["ameno", "calor"],
    tags: ["faculdade", "estudo", "aula", "casual"],
    src: "/style-assets/college-casual.png",
    fallback: true,
  },
  {
    id: "fallback_home_comfort",
    titulo: "Casa e home office",
    categoria: "casa",
    subcategoria: "home office",
    cor: "neutros suaves",
    modelagem: "confortavel",
    ocasioes: ["Casa/home office", "Trabalho informal"],
    generos: ["feminino", "masculino", "nao-binario", "prefiro-nao-informar"],
    altura_recomendada: ["baixa", "media", "alta"],
    tom_pele: ["muito claro", "claro", "medio", "moreno", "escuro", "retinto", "oliva"],
    subtom: ["quente", "frio", "neutro", "oliva"],
    formalidade: "informal",
    clima: ["ameno", "casa"],
    tags: ["casa", "home office", "conforto", "rotina"],
    src: "/style-assets/home-comfort.png",
    fallback: true,
  },
  {
    id: "fallback_night_event",
    titulo: "Evento noturno",
    categoria: "eventos",
    subcategoria: "noturno",
    cor: "contraste",
    modelagem: "impacto controlado",
    ocasioes: ["Evento noturno", "Casamento"],
    generos: ["feminino", "masculino", "nao-binario", "prefiro-nao-informar"],
    altura_recomendada: ["baixa", "media", "alta"],
    tom_pele: ["muito claro", "claro", "medio", "moreno", "escuro", "retinto", "oliva"],
    subtom: ["quente", "frio", "neutro", "oliva"],
    formalidade: "social",
    clima: ["noite", "ameno"],
    tags: ["noite", "jantar", "evento", "festa"],
    src: "/style-assets/night-event.png",
    fallback: true,
  },
  {
    id: "fallback_travel_capsule",
    titulo: "Viagem",
    categoria: "viagem",
    subcategoria: "mala capsula",
    cor: "neutros coordenados",
    modelagem: "versatil",
    ocasioes: ["Viagem", "Passeio casual", "Dias frios", "Dias quentes"],
    generos: ["feminino", "masculino", "nao-binario", "prefiro-nao-informar"],
    altura_recomendada: ["baixa", "media", "alta"],
    tom_pele: ["muito claro", "claro", "medio", "moreno", "escuro", "retinto", "oliva"],
    subtom: ["quente", "frio", "neutro", "oliva"],
    formalidade: "versatil",
    clima: ["todos"],
    tags: ["viagem", "mala", "capsula", "aeroporto"],
    src: "/style-assets/travel-capsule.png",
    fallback: true,
  },
  {
    id: "fallback_sunglasses",
    titulo: "Oculos de sol",
    categoria: "acessorios",
    subcategoria: "oculos de sol",
    cor: "tartaruga ou escuro",
    modelagem: "armacao media",
    ocasioes: ["Praia", "Dias quentes", "Passeio casual", "Viagem"],
    generos: ["feminino", "masculino", "nao-binario", "prefiro-nao-informar"],
    altura_recomendada: ["baixa", "media", "alta"],
    tom_pele: ["muito claro", "claro", "medio", "moreno", "escuro", "retinto", "oliva"],
    subtom: ["quente", "frio", "neutro", "oliva"],
    formalidade: "casual",
    clima: ["sol", "calor"],
    tags: ["oculos de sol", "oculos", "acessorios", "praia"],
    src: "/style-assets/sunglasses.png",
    fallback: true,
  },
  {
    id: "fallback_eyeglasses",
    titulo: "Armacao de grau",
    categoria: "acessorios",
    subcategoria: "oculos de grau",
    cor: "neutros",
    modelagem: "armacao media",
    ocasioes: WARDROBE_OCCASIONS,
    generos: ["feminino", "masculino", "nao-binario", "prefiro-nao-informar"],
    altura_recomendada: ["baixa", "media", "alta"],
    tom_pele: ["muito claro", "claro", "medio", "moreno", "escuro", "retinto", "oliva"],
    subtom: ["quente", "frio", "neutro", "oliva"],
    formalidade: "versatil",
    clima: ["todos"],
    tags: ["armacao", "oculos de grau", "rosto"],
    src: "/style-assets/eyeglasses.png",
    fallback: true,
  },
  {
    id: "fallback_gold_jewelry",
    titulo: "Joias e metais",
    categoria: "acessorios",
    subcategoria: "joias",
    cor: "metal",
    modelagem: "escala media",
    ocasioes: WARDROBE_OCCASIONS,
    generos: ["feminino", "masculino", "nao-binario", "prefiro-nao-informar"],
    altura_recomendada: ["baixa", "media", "alta"],
    tom_pele: ["muito claro", "claro", "medio", "moreno", "escuro", "retinto", "oliva"],
    subtom: ["quente", "frio", "neutro", "oliva"],
    formalidade: "versatil",
    clima: ["todos"],
    tags: ["joias", "metais", "brincos", "colar"],
    src: "/style-assets/gold-jewelry.png",
    fallback: true,
  },
  {
    id: "fallback_structured_bag",
    titulo: "Bolsa estruturada",
    categoria: "acessorios",
    subcategoria: "bolsas",
    cor: "couro",
    modelagem: "estruturada",
    ocasioes: ["Trabalho formal", "Trabalho informal", "Passeio casual", "Igreja/cerimonia discreta"],
    generos: ["feminino", "masculino", "nao-binario", "prefiro-nao-informar"],
    altura_recomendada: ["baixa", "media", "alta"],
    tom_pele: ["muito claro", "claro", "medio", "moreno", "escuro", "retinto", "oliva"],
    subtom: ["quente", "frio", "neutro", "oliva"],
    formalidade: "versatil",
    clima: ["todos"],
    tags: ["bolsa", "couro", "trabalho", "acessorios"],
    src: "/style-assets/structured-bag.png",
    fallback: true,
  },
  {
    id: "fallback_belt",
    titulo: "Cinto e acabamento",
    categoria: "acessorios",
    subcategoria: "cintos",
    cor: "couro",
    modelagem: "fivela discreta",
    ocasioes: ["Trabalho formal", "Trabalho informal", "Passeio casual", "Faculdade"],
    generos: ["feminino", "masculino", "nao-binario", "prefiro-nao-informar"],
    altura_recomendada: ["baixa", "media", "alta"],
    tom_pele: ["muito claro", "claro", "medio", "moreno", "escuro", "retinto", "oliva"],
    subtom: ["quente", "frio", "neutro", "oliva"],
    formalidade: "versatil",
    clima: ["todos"],
    tags: ["cinto", "sapato", "acabamento", "couro"],
    src: "/style-assets/belt.png",
    fallback: true,
  },
  {
    id: "fallback_natural_makeup",
    titulo: "Maquiagem natural",
    categoria: "maquiagem-cabelo",
    subcategoria: "pele",
    cor: "tons naturais",
    modelagem: "textura leve",
    ocasioes: WARDROBE_OCCASIONS,
    generos: ["feminino", "masculino", "nao-binario", "prefiro-nao-informar"],
    altura_recomendada: ["baixa", "media", "alta"],
    tom_pele: ["muito claro", "claro", "medio", "moreno", "escuro", "retinto", "oliva"],
    subtom: ["quente", "frio", "neutro", "oliva"],
    formalidade: "versatil",
    clima: ["todos"],
    tags: ["maquiagem", "natural", "pele", "blush"],
    src: "/style-assets/natural-makeup.png",
    fallback: true,
  },
  {
    id: "fallback_bold_lip",
    titulo: "Batom marcante",
    categoria: "maquiagem-cabelo",
    subcategoria: "labios",
    cor: "vinho ou vermelho",
    modelagem: "ponto focal",
    ocasioes: ["Evento noturno", "Casamento", "Trabalho formal"],
    generos: ["feminino", "masculino", "nao-binario", "prefiro-nao-informar"],
    altura_recomendada: ["baixa", "media", "alta"],
    tom_pele: ["muito claro", "claro", "medio", "moreno", "escuro", "retinto", "oliva"],
    subtom: ["quente", "frio", "neutro", "oliva"],
    formalidade: "versatil",
    clima: ["todos"],
    tags: ["batom", "labios", "maquiagem", "noite"],
    src: "/style-assets/bold-lip.png",
    fallback: true,
  },
  {
    id: "fallback_hair_accessories",
    titulo: "Cabelo e acessorios",
    categoria: "maquiagem-cabelo",
    subcategoria: "acessorios de cabelo",
    cor: "coordenados",
    modelagem: "presilhas e acabamento",
    ocasioes: WARDROBE_OCCASIONS,
    generos: ["feminino", "masculino", "nao-binario", "prefiro-nao-informar"],
    altura_recomendada: ["baixa", "media", "alta"],
    tom_pele: ["muito claro", "claro", "medio", "moreno", "escuro", "retinto", "oliva"],
    subtom: ["quente", "frio", "neutro", "oliva"],
    formalidade: "versatil",
    clima: ["todos"],
    tags: ["cabelo", "presilha", "acessorios"],
    src: "/style-assets/hair-accessories.png",
    fallback: true,
  },
  {
    id: "fallback_shopping_priority",
    titulo: "Compras prioritarias",
    categoria: "compras",
    subcategoria: "prioridades",
    cor: "variado",
    modelagem: "lista visual",
    ocasioes: WARDROBE_OCCASIONS,
    generos: ["feminino", "masculino", "nao-binario", "prefiro-nao-informar"],
    altura_recomendada: ["baixa", "media", "alta"],
    tom_pele: ["muito claro", "claro", "medio", "moreno", "escuro", "retinto", "oliva"],
    subtom: ["quente", "frio", "neutro", "oliva"],
    formalidade: "versatil",
    clima: ["todos"],
    tags: ["compras", "prioridade", "guarda roupa"],
    src: "/style-assets/shopping-priority.png",
    fallback: true,
  },
] as const;

export const realWardrobeCatalog = generatedWardrobeCatalog;
export const wardrobeCatalog: readonly WardrobeItem[] = [
  ...realWardrobeCatalog,
  ...fallbackWardrobeCatalog,
] as const;

export const WARDROBE_ITEM_IDS = wardrobeCatalog.map((item) => item.id);
export type WardrobeItemId = (typeof WARDROBE_ITEM_IDS)[number];

const wardrobeById = new Map(wardrobeCatalog.map((item) => [item.id, item]));
const fallbackById = new Map(fallbackWardrobeCatalog.map((item) => [item.id, item]));

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function getWardrobeItemById(id?: string) {
  return wardrobeById.get(id || "") || fallbackById.get("fallback_capsule_rack")!;
}

export function isWardrobeItemId(id?: string) {
  return Boolean(id && wardrobeById.has(id));
}

export function getFallbackItemForOccasion(occasion: string) {
  const normalized = normalizeText(occasion);

  if (/(praia|piscina|verao|calor)/.test(normalized)) return getWardrobeItemById("fallback_beach_light");
  if (/(casamento|cerimonia|formatura|festa)/.test(normalized)) return getWardrobeItemById("fallback_wedding_guest");
  if (/(neve|frio|inverno|camada)/.test(normalized)) return getWardrobeItemById("fallback_snow_layering");
  if (/(igreja|templo|culto|religios|sobri|discreto)/.test(normalized)) return getWardrobeItemById("fallback_church_elegant");
  if (/(faculdade|universidade|aula|estudo|campus)/.test(normalized)) return getWardrobeItemById("fallback_college_casual");
  if (/(casa|home|remoto|videochamada)/.test(normalized)) return getWardrobeItemById("fallback_home_comfort");
  if (/(noite|jantar|bar|evento)/.test(normalized)) return getWardrobeItemById("fallback_night_event");
  if (/(viagem|mala|aeroporto)/.test(normalized)) return getWardrobeItemById("fallback_travel_capsule");
  if (/(trabalho|reuniao|escritorio|profissional|entrevista)/.test(normalized)) return getWardrobeItemById("fallback_work_tailoring");

  return getWardrobeItemById("fallback_capsule_rack");
}

export function getWardrobeItemsForOccasion(occasion: string, limit = 4) {
  const normalized = normalizeText(occasion);
  const direct = wardrobeCatalog.filter((item) =>
    item.ocasioes.some((itemOccasion) => normalizeText(itemOccasion) === normalized),
  );
  const fuzzy = wardrobeCatalog.filter((item) => {
    const haystack = normalizeText(
      [
        item.categoria,
        item.subcategoria,
        item.modelagem,
        item.formalidade,
        ...item.ocasioes,
        ...item.tags,
      ].join(" "),
    );

    return normalized
      .split(/[\s/]+/)
      .filter(Boolean)
      .some((part) => haystack.includes(part));
  });
  const merged = [...direct, ...fuzzy, getFallbackItemForOccasion(occasion)];
  const unique = Array.from(new Map(merged.map((item) => [item.id, item])).values());

  return unique.slice(0, limit);
}

export function getWardrobeItemsByIds(ids: string[] | undefined, occasion = "", limit = 4) {
  const selected = (ids || [])
    .map((id) => wardrobeById.get(id))
    .filter((item): item is WardrobeItem => Boolean(item));

  const fillers = getWardrobeItemsForOccasion(occasion, limit);
  const merged = [...selected, ...fillers];
  return Array.from(new Map(merged.map((item) => [item.id, item])).values()).slice(0, limit);
}

export function sanitizeWardrobeIds(ids: string[] | undefined, occasion: string, limit = 4) {
  return getWardrobeItemsByIds(ids, occasion, limit).map((item) => item.id);
}

export function itemToImageAsset(item: WardrobeItem): WardrobeImageAsset {
  return {
    id: item.id,
    title: item.titulo,
    src: item.src,
    alt: `${item.titulo} - ${item.categoria}, ${item.subcategoria}, ${item.cor}`,
    caption: `${item.categoria} / ${item.subcategoria} / ${item.cor} / ${item.modelagem}`,
    tags: item.tags,
    fallback: Boolean(item.fallback),
  };
}

function addMatchIds(ids: Set<string>, text: string) {
  const normalized = normalizeText(text);

  if (/oculos de sol|solar|praia/.test(normalized)) ids.add("fallback_sunglasses");
  if (/oculos|armacao/.test(normalized)) ids.add("fallback_eyeglasses");
  if (/joia|brinco|colar|metal|pulseira/.test(normalized)) ids.add("fallback_gold_jewelry");
  if (/bolsa/.test(normalized)) ids.add("fallback_structured_bag");
  if (/cinto|sapato|calcado|loafer|sandalia/.test(normalized)) ids.add("fallback_belt");
  if (/maquiagem|blush|base|mascara|pele/.test(normalized)) ids.add("fallback_natural_makeup");
  if (/batom|labio/.test(normalized)) ids.add("fallback_bold_lip");
  if (/cabelo|presilha|penteado/.test(normalized)) ids.add("fallback_hair_accessories");
  if (/compra|prioridade|orcamento/.test(normalized)) ids.add("fallback_shopping_priority");
}

export function getWardrobeAssetsForAnalysis(analysis: AnalysisWardrobeShape, limit = 16) {
  const ids = new Set<string>();

  analysis.roupas?.ocasioes_especificas?.forEach((occasion) => {
    getWardrobeItemsByIds(occasion.pecas, occasion.ocasiao || "", 4).forEach((item) => {
      ids.add(item.id);
    });
  });

  addMatchIds(ids, JSON.stringify(analysis));

  [
    "fallback_color_palette",
    "fallback_capsule_rack",
    "fallback_work_tailoring",
    "fallback_sunglasses",
    "fallback_natural_makeup",
    "fallback_structured_bag",
  ].forEach((id) => ids.add(id));

  return Array.from(ids)
    .slice(0, limit)
    .map((id) => itemToImageAsset(getWardrobeItemById(id)));
}

export function getWardrobeCatalogPrompt() {
  const promptLimit = Number(process.env.WARDROBE_PROMPT_LIMIT || 260);
  const items = wardrobeCatalog.slice(0, Number.isFinite(promptLimit) ? promptLimit : 260);
  const compact = items.map((item) => ({
    id: item.id,
    titulo: item.titulo,
    categoria: item.categoria,
    subcategoria: item.subcategoria,
    cor: item.cor,
    modelagem: item.modelagem,
    ocasioes: item.ocasioes,
    generos: item.generos,
    altura_recomendada: item.altura_recomendada,
    tom_pele: item.tom_pele,
    subtom: item.subtom,
    formalidade: item.formalidade,
    clima: item.clima,
    tags: item.tags,
    fallback: Boolean(item.fallback),
  }));

  const suffix =
    wardrobeCatalog.length > items.length
      ? `\nItens omitidos por limite tecnico: ${wardrobeCatalog.length - items.length}. Use apenas IDs listados acima.`
      : "";

  return `${JSON.stringify(compact)}${suffix}`;
}
