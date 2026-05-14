"use client";

import {
  AlertCircle,
  BadgeCheck,
  Camera,
  Download,
  Glasses,
  Images,
  Loader2,
  Palette,
  Shirt,
  ShoppingBag,
  Sparkles,
  Upload,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { AnalysisResult, ColorRecommendation } from "@/lib/analysis";
import {
  getFallbackItemForOccasion,
  getWardrobeAssetsForAnalysis,
  getWardrobeItemById,
  getWardrobeItemsByIds,
  itemToImageAsset,
  type WardrobeImageAsset,
} from "@/lib/wardrobe";

type ApiResponse = {
  mode: "ia" | "demo";
  analysis: AnalysisResult;
};

type OutfitPreview = {
  titulo: string;
  descricao: string;
  imageUrl: string;
};

const initialForm = {
  age: "",
  sex: "",
  height: "",
  skinTone: "",
  undertone: "",
  hairColor: "",
  eyeColor: "",
  styleGoal: "",
  routine: "",
  climate: "",
  budget: "",
  dressCode: "",
  makeupLevel: "",
  favoriteColors: "",
  favoriteNailPolishColor: "",
  avoidedPieces: "",
  bodyFocus: "",
  comfortNeeds: "",
  modestyPreference: "",
  footwearPreference: "",
  accessoryPreference: "",
  shoppingLimit: "",
  restrictions: "",
};

type FormState = typeof initialForm;
type IllustrationSlot = keyof AnalysisResult["imagens"];

const sectionVisuals: Record<IllustrationSlot, { src: string; alt: string }> = {
  perfil_visual: {
    src: getWardrobeItemById("fallback_capsule_rack").src,
    alt: "Referencia visual de leitura de estilo",
  },
  paleta: {
    src: getWardrobeItemById("fallback_color_palette").src,
    alt: "Amostras de cores coordenadas",
  },
  roupas: {
    src: getWardrobeItemById("fallback_capsule_rack").src,
    alt: "Arara de roupas organizada",
  },
  maquiagem: {
    src: getWardrobeItemById("fallback_natural_makeup").src,
    alt: "Referencia de maquiagem natural",
  },
  acessorios: {
    src: getWardrobeItemById("fallback_gold_jewelry").src,
    alt: "Joias e acessorios delicados",
  },
  compras: {
    src: getWardrobeItemById("fallback_shopping_priority").src,
    alt: "Compras prioritarias",
  },
  proximos_passos: {
    src: getWardrobeItemById("fallback_travel_capsule").src,
    alt: "Plano visual de proximos passos",
  },
};

function TagList({ items }: { items: string[] }) {
  return (
    <ul className="tagList">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function ColorStrip({ colors }: { colors: ColorRecommendation[] }) {
  return (
    <div className="colorGrid">
      {colors.map((color) => (
        <div className="colorItem" key={`${color.nome}-${color.hex}`}>
          <span className="swatch" style={{ background: color.hex }} />
          <div>
            <strong>{color.nome}</strong>
            <small>{color.uso}</small>
          </div>
        </div>
      ))}
    </div>
  );
}

function PaletteSwatchCard({
  color,
  avoid = false,
}: {
  color: ColorRecommendation;
  avoid?: boolean;
}) {
  const safeHex = /^#[0-9a-f]{6}$/i.test(color.hex) ? color.hex : "#8A3048";

  return (
    <article className={`paletteSwatchCard${avoid ? " avoid" : ""}`}>
      <span
        aria-hidden="true"
        className="paletteSwatchPreview"
        style={{ backgroundColor: safeHex }}
      />
      <div>
        <strong>{color.nome}</strong>
        <small>{color.uso}</small>
      </div>
    </article>
  );
}

function PaletteSwatchGroup({
  title,
  colors,
  avoid = false,
}: {
  title: string;
  colors: ColorRecommendation[];
  avoid?: boolean;
}) {
  if (!colors.length) {
    return null;
  }

  return (
    <section className="paletteBlock">
      <h3>{title}</h3>
      <div className="paletteSwatchGrid">
        {colors.map((color, index) => (
          <PaletteSwatchCard
            avoid={avoid}
            color={color}
            key={`${color.nome}-${color.hex}-${index}`}
          />
        ))}
      </div>
    </section>
  );
}

function PalettePoster({ analysis }: { analysis: AnalysisResult }) {
  return (
    <section aria-label={`Cartela visual ${analysis.paleta.nome}`} className="palettePoster">
      <header className="palettePosterHeader">
        <span>Cartela visual</span>
        <h2>{analysis.paleta.nome}</h2>
        <p>{analysis.paleta.descricao}</p>
      </header>

      <PaletteSwatchGroup
        colors={analysis.paleta.cores_principais}
        title="Cores que mais combinam"
      />
      <PaletteSwatchGroup colors={analysis.paleta.neutros} title="Neutros de base" />
      <PaletteSwatchGroup
        avoid
        colors={analysis.paleta.cores_para_evitar}
        title="Cores para evitar perto do rosto ou adaptar"
      />
    </section>
  );
}

function IllustrationCard({
  illustration,
  slot,
}: {
  illustration: AnalysisResult["imagens"][IllustrationSlot];
  slot: IllustrationSlot;
}) {
  const asset = sectionVisuals[slot];

  return (
    <figure className="illustrationCard">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={asset.src} alt={asset.alt} loading="lazy" />
      <figcaption>
        <strong>{illustration.titulo}</strong>
        <span>{illustration.legenda}</span>
        <small>{illustration.direcao_visual}</small>
      </figcaption>
    </figure>
  );
}

function WardrobeAssetImages({ asset }: { asset: WardrobeImageAsset }) {
  return (
    <div className={`wardrobeImagePair${asset.modelSrc ? " hasModel" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={asset.src} alt={asset.alt} loading="lazy" />
      {asset.modelSrc ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset.modelSrc} alt={`${asset.alt} na modelo`} loading="lazy" />
        </>
      ) : null}
    </div>
  );
}

function VisualReferenceGrid({ assets }: { assets: WardrobeImageAsset[] }) {
  return (
    <div className="visualReferenceGrid">
      {assets.map((asset) => (
        <figure className="visualReferenceCard" key={asset.id}>
          <WardrobeAssetImages asset={asset} />
          <figcaption>
            <strong>{asset.title}</strong>
            <span>{asset.caption}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function ReportSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="reportSection">
      <div className="sectionTitle">
        {icon}
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Nao foi possivel preparar uma imagem do relatorio."));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}

async function imageSourceToDataUrl(src: string) {
  const response = await fetch(src);

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar uma imagem do relatorio.");
  }

  return blobToDataUrl(await response.blob());
}

function getPageStylesForDownload() {
  return Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules)
          .map((rule) => rule.cssText)
          .join("\n");
      } catch {
        return "";
      }
    })
    .filter(Boolean)
    .join("\n");
}

function escapeDownloadHtmlText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function prepareReportClone(reportElement: HTMLElement) {
  const clone = reportElement.cloneNode(true) as HTMLElement;
  const clonedImages = Array.from(clone.querySelectorAll("img"));
  const sourceImages = Array.from(reportElement.querySelectorAll("img"));

  await Promise.all(
    clonedImages.map(async (image, index) => {
      const source = sourceImages[index];

      if (!source?.src) return;

      try {
        image.src = await imageSourceToDataUrl(source.src);
        image.removeAttribute("loading");
      } catch {
        image.src = source.src;
      }
    }),
  );

  return clone;
}

function buildReportDownloadHtml({
  reportHtml,
  styles,
  title,
}: {
  reportHtml: string;
  styles: string;
  title: string;
}) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeDownloadHtmlText(title)}</title>
  <style>
${styles}
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
}
  </style>
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

function downloadHtmlFile(html: string, filename: string) {
  const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function Home() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [outfitPreviews, setOutfitPreviews] = useState<OutfitPreview[]>([]);
  const [outfitError, setOutfitError] = useState("");
  const [downloadError, setDownloadError] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOutfitLoading, setIsOutfitLoading] = useState(false);
  const [isReportDownloading, setIsReportDownloading] = useState(false);
  const reportRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!photo) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(photo);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  const canSubmit = useMemo(
    () => Boolean(photo && form.age && form.sex && form.height && !isLoading),
    [photo, form.age, form.sex, form.height, isLoading],
  );
  const selectedVisualAssets = useMemo(
    () => (analysis ? getWardrobeAssetsForAnalysis(analysis, 16) : []),
    [analysis],
  );

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!photo) {
      setError("Selecione uma imagem antes de gerar a analise.");
      return;
    }

    const payload = new FormData();
    payload.append("photo", photo);
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));

    setIsLoading(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: payload,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Nao foi possivel gerar a analise.");
      }

      setAnalysis((data as ApiResponse).analysis);
      setOutfitPreviews([]);
      setOutfitError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGenerateOutfitPreviews() {
    setOutfitError("");

    if (!photo || !analysis) {
      setOutfitError("Gere a analise com uma foto antes de criar exemplos visuais.");
      return;
    }

    const payload = new FormData();
    payload.append("photo", photo);
    payload.append("analysis", JSON.stringify(analysis));

    setIsOutfitLoading(true);
    try {
      const response = await fetch("/api/outfit-previews", {
        method: "POST",
        body: payload,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Nao foi possivel gerar os exemplos visuais.");
      }

      setOutfitPreviews((data.previews || []) as OutfitPreview[]);
    } catch (caught) {
      setOutfitError(caught instanceof Error ? caught.message : "Erro inesperado.");
    } finally {
      setIsOutfitLoading(false);
    }
  }

  async function handleDownloadVisualReport() {
    setDownloadError("");

    if (!analysis || !reportRef.current) {
      setDownloadError("Gere a analise antes de baixar o relatorio visual.");
      return;
    }

    setIsReportDownloading(true);
    try {
      const clone = await prepareReportClone(reportRef.current);
      const html = buildReportDownloadHtml({
        reportHtml: clone.outerHTML,
        styles: getPageStylesForDownload(),
        title: `Relatorio Ellie - ${analysis.paleta.nome}`,
      });

      downloadHtmlFile(html, "relatorio-ellie.html");
    } catch (caught) {
      setDownloadError(
        caught instanceof Error
          ? caught.message
          : "Nao foi possivel baixar o relatorio visual agora.",
      );
    } finally {
      setIsReportDownloading(false);
    }
  }

  return (
    <main className="app">
      <header className="siteHeader">
        <div>
          <p className="eyebrow">Consultoria de imagem assistida por IA</p>
          <h1>Analise Pessoal</h1>
        </div>
        <div className="headerBadge">
          <BadgeCheck size={18} aria-hidden />
          <span>MVP local</span>
        </div>
      </header>

      <div className="workspace">
        <form className="formPanel" onSubmit={handleSubmit}>
          <div className="panelHeader">
            <div>
              <p className="eyebrow">Entrada</p>
              <h2>Foto e dados</h2>
            </div>
            <Sparkles size={22} aria-hidden />
          </div>

          <label className="uploadBox">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Previa da foto enviada" />
            ) : (
              <span className="uploadEmpty">
                <Upload size={26} aria-hidden />
                <strong>Selecionar foto</strong>
                <small>JPG, PNG ou WEBP ate 8 MB</small>
              </span>
            )}
            <input
              accept="image/jpeg,image/png,image/webp"
              name="photo"
              onChange={(event) => {
                setPhoto(event.target.files?.[0] ?? null);
                setOutfitPreviews([]);
                setOutfitError("");
              }}
              type="file"
            />
          </label>

          <div className="questionGroup">
            <div className="questionTitle">
              <span>Dados basicos</span>
            </div>

          <div className="fieldGrid">
            <label>
              Idade
              <input
                min="13"
                max="100"
                onChange={(event) => updateField("age", event.target.value)}
                placeholder="Ex.: 32"
                required
                type="number"
                value={form.age}
              />
            </label>

            <label>
              Sexo/genero
              <select
                onChange={(event) => updateField("sex", event.target.value)}
                required
                value={form.sex}
              >
                <option value="">Selecione</option>
                <option value="feminino">Feminino</option>
                <option value="masculino">Masculino</option>
                <option value="nao-binario">Nao-binario</option>
                <option value="prefiro-nao-informar">Prefiro nao informar</option>
              </select>
            </label>

            <label>
              Altura em cm
              <input
                min="120"
                max="230"
                onChange={(event) => updateField("height", event.target.value)}
                placeholder="Ex.: 168"
                required
                type="number"
                value={form.height}
              />
            </label>
          </div>
          </div>

          <div className="questionGroup">
            <div className="questionTitle">
              <span>Colorimetria</span>
            </div>

            <div className="fieldGrid">
              <label>
                Tom de pele
                <select
                  onChange={(event) => updateField("skinTone", event.target.value)}
                  value={form.skinTone}
                >
                  <option value="">Nao sei/prefiro nao informar</option>
                  <option value="muito claro">Muito claro</option>
                  <option value="claro">Claro</option>
                  <option value="medio">Medio</option>
                  <option value="moreno">Moreno</option>
                  <option value="escuro">Escuro</option>
                  <option value="retinto">Retinto</option>
                  <option value="oliva">Oliva</option>
                </select>
              </label>

              <label>
                Subtom
                <select
                  onChange={(event) => updateField("undertone", event.target.value)}
                  value={form.undertone}
                >
                  <option value="">Nao sei</option>
                  <option value="quente">Quente</option>
                  <option value="frio">Frio</option>
                  <option value="neutro">Neutro</option>
                  <option value="oliva">Oliva</option>
                </select>
              </label>

              <label>
                Cabelo
                <input
                  onChange={(event) => updateField("hairColor", event.target.value)}
                  placeholder="Ex.: castanho escuro"
                  type="text"
                  value={form.hairColor}
                />
              </label>

              <label>
                Olhos
                <input
                  onChange={(event) => updateField("eyeColor", event.target.value)}
                  placeholder="Ex.: castanhos"
                  type="text"
                  value={form.eyeColor}
                />
              </label>
            </div>
          </div>

          <div className="questionGroup">
            <div className="questionTitle">
              <span>Rotina</span>
            </div>

          <label>
            Objetivo de estilo
            <textarea
              onChange={(event) => updateField("styleGoal", event.target.value)}
              placeholder="Ex.: parecer mais profissional, moderno, elegante, leve..."
              rows={3}
              value={form.styleGoal}
            />
          </label>

            <label>
              Rotina e ocasioes
              <textarea
                onChange={(event) => updateField("routine", event.target.value)}
                placeholder="Ex.: trabalho presencial, eventos, dia a dia casual..."
                rows={3}
                value={form.routine}
              />
            </label>

            <div className="fieldGrid">
              <label>
                Clima
                <input
                  onChange={(event) => updateField("climate", event.target.value)}
                  placeholder="Ex.: calor, ar-condicionado"
                  type="text"
                  value={form.climate}
                />
              </label>

              <label>
                Dress code
                <input
                  onChange={(event) => updateField("dressCode", event.target.value)}
                  placeholder="Ex.: social, casual"
                  type="text"
                  value={form.dressCode}
                />
              </label>

              <label>
                Orcamento
                <select
                  onChange={(event) => updateField("budget", event.target.value)}
                  value={form.budget}
                >
                  <option value="">Nao informar</option>
                  <option value="economico">Economico</option>
                  <option value="medio">Medio</option>
                  <option value="premium">Premium</option>
                </select>
              </label>
            </div>

            <div className="fieldGrid">
              <label>
                Conforto
                <input
                  onChange={(event) => updateField("comfortNeeds", event.target.value)}
                  placeholder="Ex.: tecido fresco, nada apertado"
                  type="text"
                  value={form.comfortNeeds}
                />
              </label>

              <label>
                Calcados
                <input
                  onChange={(event) => updateField("footwearPreference", event.target.value)}
                  placeholder="Ex.: sem salto, tenis, sandalia"
                  type="text"
                  value={form.footwearPreference}
                />
              </label>

              <label>
                Limite de compras
                <input
                  onChange={(event) => updateField("shoppingLimit", event.target.value)}
                  placeholder="Ex.: poucas compras, usar o que ja tenho"
                  type="text"
                  value={form.shoppingLimit}
                />
              </label>
            </div>

            <label>
              Nivel de maquiagem
              <select
                onChange={(event) => updateField("makeupLevel", event.target.value)}
                value={form.makeupLevel}
              >
                <option value="">Nao informar</option>
                <option value="nenhuma">Nenhuma</option>
                <option value="natural">Natural</option>
                <option value="media">Media</option>
                <option value="marcante">Marcante</option>
              </select>
            </label>
          </div>

          <div className="questionGroup">
            <div className="questionTitle">
              <span>Preferencias</span>
            </div>

            <label>
              Cores favoritas
              <textarea
                onChange={(event) => updateField("favoriteColors", event.target.value)}
                placeholder="Ex.: azul, verde, preto, tons claros..."
                rows={2}
                value={form.favoriteColors}
              />
            </label>

            <label>
              Cor favorita de esmalte
              <input
                onChange={(event) => updateField("favoriteNailPolishColor", event.target.value)}
                placeholder="Ex.: nude rosado, vermelho, francesinha, vinho..."
                type="text"
                value={form.favoriteNailPolishColor}
              />
            </label>

            <label>
              Pontos que quer valorizar ou equilibrar
              <textarea
                onChange={(event) => updateField("bodyFocus", event.target.value)}
                placeholder="Ex.: alongar silhueta, destacar cintura, suavizar ombros..."
                rows={2}
                value={form.bodyFocus}
              />
            </label>

            <label>
              Cobertura, decotes e comprimentos
              <textarea
                onChange={(event) => updateField("modestyPreference", event.target.value)}
                placeholder="Ex.: prefiro roupas discretas, gosto de decote V, evito curto..."
                rows={2}
                value={form.modestyPreference}
              />
            </label>

            <label>
              Pecas ou estilos que evita
              <textarea
                onChange={(event) => updateField("avoidedPieces", event.target.value)}
                placeholder="Ex.: salto alto, roupas justas, estampas grandes..."
                rows={2}
                value={form.avoidedPieces}
              />
            </label>

            <label>
              Acessorios que usa ou evita
              <textarea
                onChange={(event) => updateField("accessoryPreference", event.target.value)}
                placeholder="Ex.: uso oculos de sol, evito brincos grandes, gosto de bolsas pequenas..."
                rows={2}
                value={form.accessoryPreference}
              />
            </label>

          <label>
            Preferencias ou restricoes
            <textarea
              onChange={(event) => updateField("restrictions", event.target.value)}
              placeholder="Ex.: cores que nao gosta, ambiente profissional, orcamento..."
              rows={3}
              value={form.restrictions}
            />
          </label>
          </div>

          {error ? (
            <div className="errorBox" role="alert">
              <AlertCircle size={18} aria-hidden />
              <span>{error}</span>
            </div>
          ) : null}

          <button className="primaryButton" disabled={!canSubmit} type="submit">
            {isLoading ? <Loader2 className="spin" size={18} aria-hidden /> : <Wand2 size={18} aria-hidden />}
            <span>{isLoading ? "Gerando analise" : "Gerar analise"}</span>
          </button>
        </form>

        <section className="resultPanel">
          <div className="resultHeader">
            <div>
              <p className="eyebrow">Relatorio</p>
              <h2>{analysis ? analysis.paleta.nome : "Aguardando analise"}</h2>
            </div>
            {analysis ? (
              <button
                className="ghostButton"
                disabled={isReportDownloading}
                onClick={handleDownloadVisualReport}
                type="button"
              >
                {isReportDownloading ? (
                  <Loader2 className="spin" size={18} aria-hidden />
                ) : (
                  <Download size={18} aria-hidden />
                )}
                <span>{isReportDownloading ? "Preparando" : "Baixar relatorio visual"}</span>
              </button>
            ) : null}
          </div>

          {downloadError ? (
            <div className="errorBox" role="alert">
              <AlertCircle size={18} aria-hidden />
              <span>{downloadError}</span>
            </div>
          ) : null}

          {!analysis ? (
            <div className="emptyState">
              <div className="emptyPreviewGrid" aria-hidden>
                {(["paleta", "roupas", "maquiagem", "acessorios"] as IllustrationSlot[]).map(
                  (slot) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={slot} src={sectionVisuals[slot].src} alt="" />
                  ),
                )}
              </div>
              <Palette size={40} aria-hidden />
              <h2>O resultado vai aparecer aqui.</h2>
              <p>
                A primeira versao entrega paleta de cores, roupas, maquiagem,
                acessorios, compras prioritarias e proximos passos.
              </p>
            </div>
          ) : (
            <article className="report" ref={reportRef}>
              <div className={`modeBanner ${analysis.metadata.modo}`}>
                <strong>{analysis.metadata.modo === "demo" ? "Modo demo" : "Analise com IA"}</strong>
                <span>{analysis.metadata.aviso}</span>
              </div>

              <div className="summaryBlock">
                <div>
                  <h2>{analysis.metadata.resumo}</h2>
                  <p>{analysis.paleta.descricao}</p>
                  <small>Confianca: {analysis.metadata.confianca}</small>
                </div>
                {previewUrl ? (
                  <figure className="clientPhoto">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl} alt="Foto enviada para a analise" />
                    <figcaption>
                      <Camera size={16} aria-hidden />
                      <span>Foto base da analise</span>
                    </figcaption>
                  </figure>
                ) : null}
              </div>

              <div className="reportPartTitle">
                <span>Parte 1</span>
                <h2>Analise geral</h2>
                <p>
                  Primeiro, a Ellie resume cores, caracteristicas visuais,
                  maquiagem, acessorios e direcao de guarda-roupa.
                </p>
              </div>

              <ReportSection icon={<Sparkles size={20} aria-hidden />} title="Perfil visual">
                <IllustrationCard
                  illustration={analysis.imagens.perfil_visual}
                  slot="perfil_visual"
                />
                <dl className="profileGrid">
                  <div>
                    <dt>Subtom aparente</dt>
                    <dd>{analysis.perfil_visual.subtom_aparente}</dd>
                  </div>
                  <div>
                    <dt>Contraste</dt>
                    <dd>{analysis.perfil_visual.contraste}</dd>
                  </div>
                  <div>
                    <dt>Formato do rosto</dt>
                    <dd>{analysis.perfil_visual.formato_rosto}</dd>
                  </div>
                  <div>
                    <dt>Linhas visuais</dt>
                    <dd>{analysis.perfil_visual.linhas_visuais}</dd>
                  </div>
                </dl>
                <TagList items={analysis.perfil_visual.observacoes} />
              </ReportSection>

              <ReportSection icon={<Palette size={20} aria-hidden />} title="Paleta de cores">
                <IllustrationCard illustration={analysis.imagens.paleta} slot="paleta" />
                <PalettePoster analysis={analysis} />
                <h3>Cores principais</h3>
                <ColorStrip colors={analysis.paleta.cores_principais} />
                <h3>Neutros</h3>
                <ColorStrip colors={analysis.paleta.neutros} />
                <h3>Combinacoes</h3>
                <TagList items={analysis.paleta.combinacoes} />
                <h3>Cores para evitar ou adaptar</h3>
                <ColorStrip colors={analysis.paleta.cores_para_evitar} />
              </ReportSection>

              <ReportSection icon={<Shirt size={20} aria-hidden />} title="Roupas">
                <IllustrationCard illustration={analysis.imagens.roupas} slot="roupas" />
                <p className="lead">{analysis.roupas.estrategia_geral}</p>
                <h3>Modelagens</h3>
                <TagList items={analysis.roupas.modelagens} />
                <h3>Tecidos</h3>
                <TagList items={analysis.roupas.tecidos} />
                <h3>Pecas-chave</h3>
                <TagList items={analysis.roupas.pecas_chave} />
                <div className="lookGrid">
                  {analysis.roupas.looks_recomendados.map((look) => {
                    const asset = itemToImageAsset(getFallbackItemForOccasion(look.ocasiao));

                    return (
                      <div className="lookItem" key={look.ocasiao}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={asset.src} alt={asset.alt} loading="lazy" />
                        <strong>{look.ocasiao}</strong>
                        <p>{look.proposta}</p>
                      </div>
                    );
                  })}
                </div>
                <h3>Evitar ou adaptar</h3>
                <TagList items={analysis.roupas.evitar_ou_adaptar} />
              </ReportSection>

              <div className="reportPartTitle">
                <span>Parte 2</span>
                <h2>Guia por ocasiao</h2>
                <p>
                  Depois, cada ocasiao recebe uma recomendacao propria com as
                  pecas e modelos selecionados do guarda-roupa.
                </p>
              </div>

              <ReportSection icon={<BadgeCheck size={20} aria-hidden />} title="Sugestoes por ocasiao">
                <div className="occasionGrid">
                  {analysis.roupas.ocasioes_especificas.map((occasion) => {
                    const pieces = getWardrobeItemsByIds(
                      occasion.pecas,
                      occasion.ocasiao,
                      4,
                    ).map(itemToImageAsset);

                    return (
                      <article className="occasionCard" key={occasion.ocasiao}>
                        <div className="occasionText">
                          <span>{occasion.objetivo_visual}</span>
                          <h3>{occasion.ocasiao}</h3>
                          <p>{occasion.look_completo}</p>
                          <h4>Por que essas pecas</h4>
                          <p>{occasion.motivo_da_escolha}</p>
                          <h4>Cores usadas</h4>
                          <TagList items={occasion.cores_usadas} />
                          <h4>Evitar ou adaptar</h4>
                          <TagList items={occasion.evitar_ou_adaptar} />
                        </div>
                        <div
                          aria-label={`Pecas indicadas para ${occasion.ocasiao}`}
                          className="occasionImages"
                        >
                          {pieces.map((piece) => (
                            <figure className="wardrobePiece" key={piece.id}>
                              <WardrobeAssetImages asset={piece} />
                              <figcaption>
                                <strong>{piece.title}</strong>
                                <small>{piece.fallback ? "Fallback visual" : piece.caption}</small>
                              </figcaption>
                            </figure>
                          ))}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </ReportSection>

              <ReportSection icon={<Images size={20} aria-hidden />} title="Referencias visuais">
                <VisualReferenceGrid assets={selectedVisualAssets} />
              </ReportSection>

              <ReportSection icon={<Images size={20} aria-hidden />} title="Exemplos na pessoa">
                <div className="outfitAction">
                  <div>
                    <p className="lead">
                      Comparativo com dois looks lado a lado usando mascara automatica para trocar apenas a roupa.
                    </p>
                  </div>
                  <button
                    className="secondaryButton"
                    disabled={isOutfitLoading || !photo || !analysis}
                    onClick={handleGenerateOutfitPreviews}
                    type="button"
                  >
                    {isOutfitLoading ? (
                      <Loader2 className="spin" size={18} aria-hidden />
                    ) : (
                      <Images size={18} aria-hidden />
                    )}
                    <span>{isOutfitLoading ? "Gerando comparativo" : "Gerar comparativo"}</span>
                  </button>
                </div>

                {outfitError ? (
                  <div className="errorBox" role="alert">
                    <AlertCircle size={18} aria-hidden />
                    <span>{outfitError}</span>
                  </div>
                ) : null}

                {outfitPreviews.length ? (
                  <div className="generatedLookGrid">
                    {outfitPreviews.map((preview) => (
                      <figure className="generatedLook" key={preview.titulo}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={preview.imageUrl} alt={`Exemplo visual: ${preview.titulo}`} />
                        <figcaption>
                          <strong>{preview.titulo}</strong>
                          <span>{preview.descricao}</span>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                ) : (
                  <div className="previewPlaceholder">
                    <Images size={24} aria-hidden />
                    <span>O comparativo lado a lado aparece aqui.</span>
                  </div>
                )}
              </ReportSection>

              <ReportSection icon={<Wand2 size={20} aria-hidden />} title="Maquiagem">
                <IllustrationCard illustration={analysis.imagens.maquiagem} slot="maquiagem" />
                <p className="lead">{analysis.maquiagem.intensidade}</p>
                <h3>Pele</h3>
                <TagList items={analysis.maquiagem.pele} />
                <h3>Olhos</h3>
                <TagList items={analysis.maquiagem.olhos} />
                <h3>Labios</h3>
                <TagList items={analysis.maquiagem.labios} />
                <h3>Produtos-chave</h3>
                <TagList items={analysis.maquiagem.produtos_chave} />
              </ReportSection>

              <ReportSection icon={<Glasses size={20} aria-hidden />} title="Acessorios">
                <IllustrationCard illustration={analysis.imagens.acessorios} slot="acessorios" />
                <h3>Metais</h3>
                <TagList items={analysis.acessorios.metais} />
                <h3>Oculos</h3>
                <TagList items={analysis.acessorios.oculos} />
                <h3>Joias</h3>
                <TagList items={analysis.acessorios.joias} />
                <h3>Bolsas e cintos</h3>
                <TagList items={analysis.acessorios.bolsas_e_cintos} />
                <h3>Cabelo</h3>
                <TagList items={analysis.acessorios.cabelo} />
              </ReportSection>

              <ReportSection icon={<ShoppingBag size={20} aria-hidden />} title="Compras">
                <IllustrationCard illustration={analysis.imagens.compras} slot="compras" />
                <div className="shoppingList">
                  {analysis.compras.map((item) => (
                    <div className="shoppingItem" key={`${item.prioridade}-${item.item}`}>
                      <span>{item.prioridade}</span>
                      <strong>{item.item}</strong>
                      <p>{item.motivo}</p>
                    </div>
                  ))}
                </div>
              </ReportSection>

              <ReportSection icon={<BadgeCheck size={20} aria-hidden />} title="Proximos passos">
                <IllustrationCard
                  illustration={analysis.imagens.proximos_passos}
                  slot="proximos_passos"
                />
                <TagList items={analysis.proximos_passos} />
                {analysis.perfil_visual.limites_da_foto.length ? (
                  <>
                    <h3>Limites da foto</h3>
                    <TagList items={analysis.perfil_visual.limites_da_foto} />
                  </>
                ) : null}
              </ReportSection>
            </article>
          )}
        </section>
      </div>
      <footer className="siteFooter">
        <span>Personal Style Company</span>
        <Link href="/politica-de-privacidade">Politica de Privacidade</Link>
        <Link href="/termos-de-uso">Termos de Uso</Link>
        <Link href="/exclusao-de-dados">Exclusao de Dados</Link>
        <a href="mailto:contato@personalstylecompany.com.br">
          contato@personalstylecompany.com.br
        </a>
      </footer>
    </main>
  );
}
