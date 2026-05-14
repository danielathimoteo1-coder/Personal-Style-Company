import { readFile } from "node:fs/promises";
import path from "node:path";
import type { AnalysisResult, ColorRecommendation } from "@/lib/analysis";
import {
  getFallbackItemForOccasion,
  getWardrobeAssetsForAnalysis,
  getWardrobeItemById,
  getWardrobeItemsByIds,
  itemToImageAsset,
  type WardrobeImageAsset,
} from "@/lib/wardrobe";

type ReportPhoto = {
  bytes: Buffer;
  mimeType: string;
};

type IllustrationSlot = keyof AnalysisResult["imagens"];

const sectionVisualIds: Record<IllustrationSlot, string> = {
  perfil_visual: "fallback_capsule_rack",
  paleta: "fallback_color_palette",
  roupas: "fallback_capsule_rack",
  maquiagem: "fallback_natural_makeup",
  acessorios: "fallback_gold_jewelry",
  compras: "fallback_shopping_priority",
  proximos_passos: "fallback_travel_capsule",
};

const sectionVisualAlts: Record<IllustrationSlot, string> = {
  perfil_visual: "Referencia visual de leitura de estilo",
  paleta: "Amostras de cores coordenadas",
  roupas: "Arara de roupas organizada",
  maquiagem: "Referencia de maquiagem natural",
  acessorios: "Joias e acessorios delicados",
  compras: "Compras prioritarias",
  proximos_passos: "Plano visual de proximos passos",
};

function escapeHtml(value: string | number | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeHex(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value) ? value : "#8A3048";
}

function mimeTypeForPublicSrc(src: string) {
  const extension = path.extname(src.split("?")[0]).toLowerCase();

  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";
  if (extension === ".svg") return "image/svg+xml";
  return "image/png";
}

async function publicSrcToDataUrl(src: string) {
  const cleanSrc = src.split("?")[0].replace(/^\/+/, "");

  if (!cleanSrc || cleanSrc.includes("..")) {
    return src;
  }

  try {
    const buffer = await readFile(path.join(process.cwd(), "public", cleanSrc));
    return `data:${mimeTypeForPublicSrc(cleanSrc)};base64,${buffer.toString("base64")}`;
  } catch {
    return src;
  }
}

function photoToDataUrl(photo?: ReportPhoto) {
  if (!photo) return "";
  return `data:${photo.mimeType};base64,${photo.bytes.toString("base64")}`;
}

function tagListHtml(items: string[] | readonly string[]) {
  return `<ul class="tagList">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function colorStripHtml(colors: ColorRecommendation[]) {
  return `<div class="colorGrid">${colors
    .map(
      (color) => `<div class="colorItem">
        <span class="swatch" style="background: ${safeHex(color.hex)}"></span>
        <div>
          <strong>${escapeHtml(color.nome)}</strong>
          <small>${escapeHtml(color.uso)}</small>
        </div>
      </div>`,
    )
    .join("")}</div>`;
}

function paletteSwatchGroupHtml(title: string, colors: ColorRecommendation[], avoid = false) {
  if (!colors.length) return "";

  return `<section class="paletteBlock">
    <h3>${escapeHtml(title)}</h3>
    <div class="paletteSwatchGrid">
      ${colors
        .map(
          (color) => `<article class="paletteSwatchCard${avoid ? " avoid" : ""}">
            <span aria-hidden="true" class="paletteSwatchPreview" style="background-color: ${safeHex(color.hex)}"></span>
            <div>
              <strong>${escapeHtml(color.nome)}</strong>
              <small>${escapeHtml(color.uso)}</small>
            </div>
          </article>`,
        )
        .join("")}
    </div>
  </section>`;
}

function palettePosterHtml(analysis: AnalysisResult) {
  return `<section aria-label="Cartela visual ${escapeHtml(analysis.paleta.nome)}" class="palettePoster">
    <header class="palettePosterHeader">
      <span>Cartela visual</span>
      <h2>${escapeHtml(analysis.paleta.nome)}</h2>
      <p>${escapeHtml(analysis.paleta.descricao)}</p>
    </header>
    ${paletteSwatchGroupHtml("Cores que mais combinam", analysis.paleta.cores_principais)}
    ${paletteSwatchGroupHtml("Neutros de base", analysis.paleta.neutros)}
    ${paletteSwatchGroupHtml(
      "Cores para evitar perto do rosto ou adaptar",
      analysis.paleta.cores_para_evitar,
      true,
    )}
  </section>`;
}

async function illustrationCardHtml(
  illustration: AnalysisResult["imagens"][IllustrationSlot],
  slot: IllustrationSlot,
) {
  const asset = getWardrobeItemById(sectionVisualIds[slot]);
  const src = await publicSrcToDataUrl(asset.src);

  return `<figure class="illustrationCard">
    <img src="${src}" alt="${escapeHtml(sectionVisualAlts[slot])}" />
    <figcaption>
      <strong>${escapeHtml(illustration.titulo)}</strong>
      <span>${escapeHtml(illustration.legenda)}</span>
      <small>${escapeHtml(illustration.direcao_visual)}</small>
    </figcaption>
  </figure>`;
}

async function wardrobeAssetImagesHtml(asset: WardrobeImageAsset) {
  const src = await publicSrcToDataUrl(asset.src);
  const modelSrc = asset.modelSrc ? await publicSrcToDataUrl(asset.modelSrc) : "";

  return `<div class="wardrobeImagePair${modelSrc ? " hasModel" : ""}">
    <img src="${src}" alt="${escapeHtml(asset.alt)}" />
    ${modelSrc ? `<img src="${modelSrc}" alt="${escapeHtml(`${asset.alt} na modelo`)}" />` : ""}
  </div>`;
}

async function visualReferenceGridHtml(assets: WardrobeImageAsset[]) {
  const cards = await Promise.all(
    assets.map(async (asset) => `<figure class="visualReferenceCard">
      ${await wardrobeAssetImagesHtml(asset)}
      <figcaption>
        <strong>${escapeHtml(asset.title)}</strong>
        <span>${escapeHtml(asset.caption)}</span>
      </figcaption>
    </figure>`),
  );

  return `<div class="visualReferenceGrid">${cards.join("")}</div>`;
}

async function reportSectionHtml(title: string, icon: string, body: string | Promise<string>) {
  return `<section class="reportSection">
    <div class="sectionTitle">
      <span class="sectionIcon" aria-hidden="true">${escapeHtml(icon)}</span>
      <h2>${escapeHtml(title)}</h2>
    </div>
    ${await body}
  </section>`;
}

async function buildOccasionCardsHtml(analysis: AnalysisResult) {
  const cards = await Promise.all(
    analysis.roupas.ocasioes_especificas.map(async (occasion) => {
      const pieces = getWardrobeItemsByIds(occasion.pecas, occasion.ocasiao, 4).map(itemToImageAsset);
      const pieceCards = await Promise.all(
        pieces.map(async (piece) => `<figure class="wardrobePiece">
          ${await wardrobeAssetImagesHtml(piece)}
          <figcaption>
            <strong>${escapeHtml(piece.title)}</strong>
            <small>${escapeHtml(piece.fallback ? "Fallback visual" : piece.caption)}</small>
          </figcaption>
        </figure>`),
      );

      return `<article class="occasionCard">
        <div class="occasionText">
          <span>${escapeHtml(occasion.objetivo_visual)}</span>
          <h3>${escapeHtml(occasion.ocasiao)}</h3>
          <p>${escapeHtml(occasion.look_completo)}</p>
          <h4>Por que essas pecas</h4>
          <p>${escapeHtml(occasion.motivo_da_escolha)}</p>
          <h4>Cores usadas</h4>
          ${tagListHtml(occasion.cores_usadas)}
          <h4>Evitar ou adaptar</h4>
          ${tagListHtml(occasion.evitar_ou_adaptar)}
        </div>
        <div aria-label="Pecas indicadas para ${escapeHtml(occasion.ocasiao)}" class="occasionImages">
          ${pieceCards.join("")}
        </div>
      </article>`;
    }),
  );

  return `<div class="occasionGrid">${cards.join("")}</div>`;
}

async function buildLookGridHtml(analysis: AnalysisResult) {
  const looks = await Promise.all(
    analysis.roupas.looks_recomendados.map(async (look) => {
      const asset = itemToImageAsset(getFallbackItemForOccasion(look.ocasiao));
      const src = await publicSrcToDataUrl(asset.src);

      return `<div class="lookItem">
        <img src="${src}" alt="${escapeHtml(asset.alt)}" />
        <strong>${escapeHtml(look.ocasiao)}</strong>
        <p>${escapeHtml(look.proposta)}</p>
      </div>`;
    }),
  );

  return `<div class="lookGrid">${looks.join("")}</div>`;
}

function shoppingListHtml(analysis: AnalysisResult) {
  return `<div class="shoppingList">${analysis.compras
    .map(
      (item) => `<div class="shoppingItem">
        <span>${escapeHtml(item.prioridade)}</span>
        <strong>${escapeHtml(item.item)}</strong>
        <p>${escapeHtml(item.motivo)}</p>
      </div>`,
    )
    .join("")}</div>`;
}

async function readGlobalCss() {
  try {
    return await readFile(path.join(process.cwd(), "app", "globals.css"), "utf8");
  } catch {
    return "";
  }
}

function reportDownloadCss(globalCss: string) {
  return `${globalCss}
body {
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.reportDownloadShell {
  min-height: 100vh;
}
.reportDownloadPanel {
  margin: 0 auto;
  max-width: 1180px;
}
.reportDownloadPanel .report {
  margin-top: 0;
}
.sectionIcon {
  align-items: center;
  background: #f7f2ea;
  border: 1px solid var(--line);
  border-radius: 999px;
  color: var(--berry);
  display: inline-flex;
  font-size: 0.82rem;
  font-weight: 900;
  height: 30px;
  justify-content: center;
  width: 30px;
}
@media print {
  body {
    background:
      linear-gradient(135deg, rgba(18, 99, 106, 0.08), transparent 36%),
      linear-gradient(315deg, rgba(154, 47, 86, 0.08), transparent 38%),
      var(--bg) !important;
  }

  .reportDownloadShell {
    padding: 18px !important;
  }

  .reportDownloadPanel {
    box-shadow: none !important;
  }
}`;
}

export async function buildStandaloneReportHtml({
  analysis,
  photo,
}: {
  analysis: AnalysisResult;
  photo?: ReportPhoto;
}) {
  const globalCss = await readGlobalCss();
  const photoDataUrl = photoToDataUrl(photo);
  const visualAssets = getWardrobeAssetsForAnalysis(analysis, 16);

  const reportHtml = `<article class="report">
    <div class="modeBanner ${escapeHtml(analysis.metadata.modo)}">
      <strong>${analysis.metadata.modo === "demo" ? "Modo demo" : "Analise com IA"}</strong>
      <span>${escapeHtml(analysis.metadata.aviso)}</span>
    </div>

    <div class="summaryBlock">
      <div>
        <h2>${escapeHtml(analysis.metadata.resumo)}</h2>
        <p>${escapeHtml(analysis.paleta.descricao)}</p>
        <small>Confianca: ${escapeHtml(analysis.metadata.confianca)}</small>
      </div>
      ${
        photoDataUrl
          ? `<figure class="clientPhoto">
              <img src="${photoDataUrl}" alt="Foto enviada para a analise" />
              <figcaption><span class="sectionIcon" aria-hidden="true">F</span><span>Foto base da analise</span></figcaption>
            </figure>`
          : ""
      }
    </div>

    <div class="reportPartTitle">
      <span>Parte 1</span>
      <h2>Analise geral</h2>
      <p>Primeiro, a Ellie resume cores, caracteristicas visuais, maquiagem, acessorios e direcao de guarda-roupa.</p>
    </div>

    ${await reportSectionHtml(
      "Perfil visual",
      "1",
      `${await illustrationCardHtml(analysis.imagens.perfil_visual, "perfil_visual")}
      <dl class="profileGrid">
        <div><dt>Subtom aparente</dt><dd>${escapeHtml(analysis.perfil_visual.subtom_aparente)}</dd></div>
        <div><dt>Contraste</dt><dd>${escapeHtml(analysis.perfil_visual.contraste)}</dd></div>
        <div><dt>Formato do rosto</dt><dd>${escapeHtml(analysis.perfil_visual.formato_rosto)}</dd></div>
        <div><dt>Linhas visuais</dt><dd>${escapeHtml(analysis.perfil_visual.linhas_visuais)}</dd></div>
      </dl>
      ${tagListHtml(analysis.perfil_visual.observacoes)}`,
    )}

    ${await reportSectionHtml(
      "Paleta de cores",
      "2",
      `${await illustrationCardHtml(analysis.imagens.paleta, "paleta")}
      ${palettePosterHtml(analysis)}
      <h3>Cores principais</h3>
      ${colorStripHtml(analysis.paleta.cores_principais)}
      <h3>Neutros</h3>
      ${colorStripHtml(analysis.paleta.neutros)}
      <h3>Combinacoes</h3>
      ${tagListHtml(analysis.paleta.combinacoes)}
      <h3>Cores para evitar ou adaptar</h3>
      ${colorStripHtml(analysis.paleta.cores_para_evitar)}`,
    )}

    ${await reportSectionHtml(
      "Roupas",
      "3",
      `${await illustrationCardHtml(analysis.imagens.roupas, "roupas")}
      <p class="lead">${escapeHtml(analysis.roupas.estrategia_geral)}</p>
      <h3>Modelagens</h3>
      ${tagListHtml(analysis.roupas.modelagens)}
      <h3>Tecidos</h3>
      ${tagListHtml(analysis.roupas.tecidos)}
      <h3>Pecas-chave</h3>
      ${tagListHtml(analysis.roupas.pecas_chave)}
      ${await buildLookGridHtml(analysis)}
      <h3>Evitar ou adaptar</h3>
      ${tagListHtml(analysis.roupas.evitar_ou_adaptar)}`,
    )}

    <div class="reportPartTitle">
      <span>Parte 2</span>
      <h2>Guia por ocasiao</h2>
      <p>Depois, cada ocasiao recebe uma recomendacao propria com as pecas e modelos selecionados do guarda-roupa.</p>
    </div>

    ${await reportSectionHtml("Sugestoes por ocasiao", "4", buildOccasionCardsHtml(analysis))}
    ${await reportSectionHtml("Referencias visuais", "5", visualReferenceGridHtml(visualAssets))}

    ${await reportSectionHtml(
      "Maquiagem",
      "6",
      `${await illustrationCardHtml(analysis.imagens.maquiagem, "maquiagem")}
      <p class="lead">${escapeHtml(analysis.maquiagem.intensidade)}</p>
      <h3>Pele</h3>
      ${tagListHtml(analysis.maquiagem.pele)}
      <h3>Olhos</h3>
      ${tagListHtml(analysis.maquiagem.olhos)}
      <h3>Labios</h3>
      ${tagListHtml(analysis.maquiagem.labios)}
      <h3>Produtos-chave</h3>
      ${tagListHtml(analysis.maquiagem.produtos_chave)}`,
    )}

    ${await reportSectionHtml(
      "Acessorios",
      "7",
      `${await illustrationCardHtml(analysis.imagens.acessorios, "acessorios")}
      <h3>Metais</h3>
      ${tagListHtml(analysis.acessorios.metais)}
      <h3>Oculos</h3>
      ${tagListHtml(analysis.acessorios.oculos)}
      <h3>Joias</h3>
      ${tagListHtml(analysis.acessorios.joias)}
      <h3>Bolsas e cintos</h3>
      ${tagListHtml(analysis.acessorios.bolsas_e_cintos)}
      <h3>Cabelo</h3>
      ${tagListHtml(analysis.acessorios.cabelo)}`,
    )}

    ${await reportSectionHtml(
      "Compras",
      "8",
      `${await illustrationCardHtml(analysis.imagens.compras, "compras")}
      ${shoppingListHtml(analysis)}`,
    )}

    ${await reportSectionHtml(
      "Proximos passos",
      "9",
      `${await illustrationCardHtml(analysis.imagens.proximos_passos, "proximos_passos")}
      ${tagListHtml(analysis.proximos_passos)}
      ${
        analysis.perfil_visual.limites_da_foto.length
          ? `<h3>Limites da foto</h3>${tagListHtml(analysis.perfil_visual.limites_da_foto)}`
          : ""
      }`,
    )}
  </article>`;

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Relatorio Ellie - ${escapeHtml(analysis.paleta.nome)}</title>
  <style>${reportDownloadCss(globalCss)}</style>
</head>
<body>
  <main class="app reportDownloadShell">
    <section class="resultPanel reportDownloadPanel">
      ${reportHtml}
    </section>
  </main>
</body>
</html>`;
}
