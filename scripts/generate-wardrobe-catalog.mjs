import { copyFile, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourceImagesDir = path.join(root, "imagens");
const publicWardrobeDir = path.join(root, "public", "wardrobe");
const publicItemsDir = path.join(publicWardrobeDir, "items");
const jsonOut = path.join(publicWardrobeDir, "catalog.generated.json");
const tsOut = path.join(root, "lib", "wardrobe-catalog.generated.ts");
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const allOccasions = [
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
];

const defaultGeneros = ["feminino", "masculino", "nao-binario", "prefiro-nao-informar"];
const defaultAltura = ["baixa", "media", "alta"];
const defaultTons = ["muito claro", "claro", "medio", "moreno", "escuro", "retinto", "oliva"];
const defaultSubtons = ["quente", "frio", "neutro", "oliva"];

function slug(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleCase(value) {
  return String(value)
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalize(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function includesAny(text, words) {
  return words.some((word) => text.includes(word));
}

function inferOccasions(text) {
  const n = normalize(text);
  const result = new Set();

  if (includesAny(n, ["praia", "biquini", "bikini", "maio", "canga", "saida", "chapeu"])) {
    result.add("Praia");
    result.add("Dias quentes");
    result.add("Viagem");
  }
  if (includesAny(n, ["faculdade", "universidade", "aula", "campus", "mochila"])) {
    result.add("Faculdade");
  }
  if (includesAny(n, ["casamento", "festa", "madrinha", "social", "gala", "formatura"])) {
    result.add("Casamento");
    result.add("Evento noturno");
  }
  if (includesAny(n, ["vestidos-longos", "vestido-longo", "longo"]) && n.includes("vestido")) {
    result.add("Casamento");
    result.add("Evento noturno");
    result.add("Igreja/cerimonia discreta");
  }
  if (includesAny(n, ["vestidos-curtos", "vestido-curto", "curto"]) && n.includes("vestido")) {
    result.add("Passeio casual");
    result.add("Dias quentes");
  }
  if (includesAny(n, ["trabalho", "alfaiataria", "social", "blazer", "camisa", "loafer"])) {
    result.add("Trabalho formal");
  }
  if (includesAny(n, ["casual", "jeans", "camiseta", "tenis", "wide-leg"])) {
    result.add("Trabalho informal");
    result.add("Passeio casual");
    result.add("Faculdade");
  }
  if (includesAny(n, ["noite", "brilho", "cetim", "paete", "clutch"])) {
    result.add("Evento noturno");
  }
  if (includesAny(n, ["igreja", "cerimonia", "midi", "discreto", "sobrio"])) {
    result.add("Igreja/cerimonia discreta");
  }
  if (includesAny(n, ["frio", "inverno", "casaco", "trench", "jaqueta", "tricot", "cachecol", "bota"])) {
    result.add("Dias frios");
    result.add("Viagem");
  }
  if (includesAny(n, ["calor", "verao", "linho", "regata", "rasteira", "shorts"])) {
    result.add("Dias quentes");
  }
  if (includesAny(n, ["viagem", "mala", "capsula", "aeroporto"])) {
    result.add("Viagem");
  }
  if (includesAny(n, ["casa", "home", "pijama", "conforto", "cardigan"])) {
    result.add("Casa/home office");
  }

  if (!result.size) {
    result.add("Passeio casual");
  }

  return Array.from(result);
}

function inferFormality(text) {
  const n = normalize(text);
  if (includesAny(n, ["vestidos-longos", "vestido-longo", "longo"]) && n.includes("vestido")) {
    return "social";
  }
  if (includesAny(n, ["gala", "casamento", "madrinha", "social", "festa"])) return "social";
  if (includesAny(n, ["trabalho", "alfaiataria", "camisa", "blazer"])) return "formal";
  if (includesAny(n, ["igreja", "cerimonia", "discreto", "sobrio"])) return "discreto";
  if (includesAny(n, ["casa", "home", "conforto"])) return "informal";
  return "casual";
}

function inferClimate(text) {
  const n = normalize(text);
  const result = new Set();
  if (includesAny(n, ["frio", "inverno", "casaco", "trench", "jaqueta", "tricot", "cachecol", "bota"])) {
    result.add("frio");
  }
  if (includesAny(n, ["calor", "verao", "praia", "linho", "regata", "shorts", "biquini", "maio"])) {
    result.add("calor");
  }
  if (includesAny(n, ["noite", "festa"])) result.add("noite");
  if (includesAny(n, ["trabalho", "blazer", "camisa"])) result.add("ar-condicionado");
  if (!result.size) result.add("ameno");
  return Array.from(result);
}

function isModelImagePath(filePath) {
  const basename = path.basename(filePath, path.extname(filePath));
  return /[_-]modelo$/i.test(basename);
}

function withoutModelSuffix(value) {
  return value.replace(/[_-]modelo$/i, "");
}

function baseKeyForImage(filePath) {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const basename = path.basename(filePath, ext);
  return path.join(dir, withoutModelSuffix(basename));
}

async function walk(dir) {
  let entries = [];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else if (imageExtensions.has(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }

  return files;
}

async function readManifest() {
  const manifestPath = path.join(sourceImagesDir, "wardrobe.manifest.json");
  try {
    return JSON.parse(await readFile(manifestPath, "utf8"));
  } catch {
    return { items: {}, defaults: {} };
  }
}

function itemFromPath(filePath, manifest, modelByBaseKey) {
  const relative = path.relative(sourceImagesDir, filePath).replaceAll(path.sep, "/");
  const parts = relative.split("/");
  const folders = parts.slice(0, -1);
  const filename = parts.at(-1) || "";
  const basename = filename.replace(/\.[^.]+$/, "");
  const categoria = folders[0] || "geral";
  const modelagem = titleCase(basename);
  const modelPath = modelByBaseKey.get(baseKeyForImage(filePath));
  const modelRelative = modelPath
    ? path.relative(sourceImagesDir, modelPath).replaceAll(path.sep, "/")
    : undefined;
  const text = `${relative} ${basename} ${folders.join(" ")}`;
  const override = manifest.items?.[relative] || manifest.items?.[basename] || {};
  const defaults = manifest.defaults || {};

  const item = {
    id: override.id || `wardrobe_${slug(relative.replace(/\.[^.]+$/, ""))}`,
    titulo: override.titulo || titleCase(basename),
    categoria: override.categoria || categoria,
    subcategoria: override.subcategoria || "geral",
    cor: override.cor || "variado",
    modelagem: override.modelagem || modelagem,
    ocasioes: override.ocasioes || inferOccasions(text),
    generos: override.generos || defaults.generos || defaultGeneros,
    altura_recomendada: override.altura_recomendada || defaults.altura_recomendada || defaultAltura,
    tom_pele: override.tom_pele || defaults.tom_pele || defaultTons,
    subtom: override.subtom || defaults.subtom || defaultSubtons,
    formalidade: override.formalidade || inferFormality(text),
    clima: override.clima || inferClimate(text),
    tags: Array.from(
      new Set([categoria, ...folders.slice(1), basename, ...(override.tags || [])].map(slug).filter(Boolean)),
    ),
    src: `/wardrobe/items/${relative}`,
    ...(modelRelative ? { modeloSrc: `/wardrobe/items/${modelRelative}` } : {}),
  };

  return item;
}

async function syncPublicImages(files) {
  if (!publicItemsDir.startsWith(publicWardrobeDir)) {
    throw new Error("Diretorio publico de imagens invalido.");
  }

  await rm(publicItemsDir, { recursive: true, force: true });
  await mkdir(publicItemsDir, { recursive: true });

  await Promise.all(
    files.map(async (file) => {
      const relative = path.relative(sourceImagesDir, file);
      const target = path.join(publicItemsDir, relative);
      await mkdir(path.dirname(target), { recursive: true });
      await copyFile(file, target);
    }),
  );
}

const manifest = await readManifest();
const files = await walk(sourceImagesDir);
const modelByBaseKey = new Map(
  files.filter(isModelImagePath).map((file) => [baseKeyForImage(file), file]),
);

const catalog = files
  .filter((file) => !isModelImagePath(file))
  .map((file) => itemFromPath(file, manifest, modelByBaseKey))
  .sort((a, b) => a.id.localeCompare(b.id));

const duplicateIds = catalog
  .map((item) => item.id)
  .filter((id, index, ids) => ids.indexOf(id) !== index);

if (duplicateIds.length) {
  throw new Error(`IDs duplicados no catalogo: ${Array.from(new Set(duplicateIds)).join(", ")}`);
}

await syncPublicImages(files);
await writeFile(jsonOut, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
await writeFile(
  tsOut,
  `import type { WardrobeItem } from "@/lib/wardrobe";\n\nexport const generatedWardrobeCatalog = ${JSON.stringify(
    catalog,
    null,
    2,
  )} as const satisfies readonly WardrobeItem[];\n`,
  "utf8",
);

console.log(`Generated ${catalog.length} wardrobe items from ./imagens.`);
