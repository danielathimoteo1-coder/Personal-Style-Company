import type { AnalysisResult, ColorRecommendation } from "@/lib/analysis";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function normalizeHex(hex: string) {
  return /^#[0-9a-f]{6}$/i.test(hex) ? hex : "#8A3048";
}

export function buildPaletteSvg(analysis: AnalysisResult) {
  const bestColors = analysis.paleta.cores_principais.slice(0, 8);
  const neutrals = analysis.paleta.neutros.slice(0, 5);
  const avoid = analysis.paleta.cores_para_evitar.slice(0, 5);
  const swatch = (
    color: ColorRecommendation,
    x: number,
    y: number,
    width: number,
    height: number,
  ) => `
    <g>
      <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="20" fill="${normalizeHex(color.hex)}"/>
      <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="20" fill="none" stroke="rgba(32,33,31,0.18)" stroke-width="2"/>
      <text x="${x}" y="${y + height + 34}" font-size="24" font-weight="800" fill="#20211F">${escapeXml(color.nome)}</text>
      <text x="${x}" y="${y + height + 66}" font-size="18" fill="#67625B">${escapeXml(color.uso.slice(0, 46))}</text>
    </g>`;
  const bestMarkup = bestColors
    .map((color, index) => {
      const x = 70 + (index % 4) * 310;
      const y = 270 + Math.floor(index / 4) * 200;
      return swatch(color, x, y, 250, 96);
    })
    .join("");
  const neutralMarkup = neutrals
    .map((color, index) => swatch(color, 70 + index * 246, 715, 200, 84))
    .join("");
  const avoidMarkup = avoid
    .map((color, index) => {
      const x = 70 + index * 246;
      return `
      <g>
        <rect x="${x}" y="960" width="200" height="84" rx="18" fill="${normalizeHex(color.hex)}"/>
        <line x1="${x + 18}" y1="1026" x2="${x + 182}" y2="978" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round" opacity="0.9"/>
        <line x1="${x + 18}" y1="1026" x2="${x + 182}" y2="978" stroke="#8A3048" stroke-width="5" stroke-linecap="round"/>
        <text x="${x}" y="1084" font-size="22" font-weight="800" fill="#20211F">${escapeXml(color.nome)}</text>
        <text x="${x}" y="1114" font-size="17" fill="#67625B">${escapeXml(color.uso.slice(0, 38))}</text>
      </g>`;
    })
    .join("");

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1180" viewBox="0 0 1400 1180">
  <rect width="1400" height="1180" fill="#FFFAF1"/>
  <rect x="32" y="32" width="1336" height="1116" rx="36" fill="#F6F1E8" stroke="#DED5C7" stroke-width="2"/>
  <text x="70" y="105" font-family="Inter, Arial, sans-serif" font-size="26" font-weight="800" fill="#9A2F56">CARTELA DE CORES</text>
  <text x="70" y="158" font-family="Inter, Arial, sans-serif" font-size="54" font-weight="900" fill="#20211F">${escapeXml(analysis.paleta.nome)}</text>
  <text x="70" y="196" font-family="Inter, Arial, sans-serif" font-size="22" fill="#67625B">${escapeXml(analysis.paleta.descricao.slice(0, 112))}</text>
  <text x="70" y="240" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="900" fill="#0A4248">Cores que mais combinam</text>
  ${bestMarkup}
  <text x="70" y="685" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="900" fill="#0A4248">Neutros de base</text>
  ${neutralMarkup}
  <text x="70" y="930" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="900" fill="#8A3048">Evitar perto do rosto ou adaptar</text>
  ${avoidMarkup}
</svg>`;
}

export function buildPaletteDataUrl(analysis: AnalysisResult) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(buildPaletteSvg(analysis))}`;
}
