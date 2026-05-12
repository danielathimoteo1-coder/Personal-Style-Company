import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const outDir = path.join(process.cwd(), "public", "style-assets");

const assets = [
  {
    id: "color-palette",
    title: "Paleta aplicada",
    colors: ["#0F5B68", "#8A3048", "#C7797D", "#F2E9DA"],
    motif: "palette",
  },
  {
    id: "capsule-rack",
    title: "Base coordenada",
    colors: ["#f1e7d5", "#0F5B68", "#4B352B", "#747A7A"],
    motif: "rack",
  },
  {
    id: "work-tailoring",
    title: "Trabalho",
    colors: ["#0F5B68", "#f5efe5", "#3d4547", "#bd8a2e"],
    motif: "tailoring",
  },
  {
    id: "beach-light",
    title: "Praia",
    colors: ["#f5d7a7", "#58aeb5", "#fff8ea", "#bd8a2e"],
    motif: "beach",
  },
  {
    id: "wedding-guest",
    title: "Casamento",
    colors: ["#c7797d", "#f4dfd8", "#8a3048", "#bd8a2e"],
    motif: "dress",
  },
  {
    id: "snow-layering",
    title: "Frio intenso",
    colors: ["#dbe8e5", "#334348", "#f7f2ea", "#8a3048"],
    motif: "layers",
  },
  {
    id: "church-elegant",
    title: "Igreja ou cerimonia",
    colors: ["#f2e9da", "#66734d", "#4b352b", "#bd8a2e"],
    motif: "modest",
  },
  {
    id: "college-casual",
    title: "Faculdade",
    colors: ["#e7d7c2", "#0f5b68", "#7b6655", "#f8f3ea"],
    motif: "casual",
  },
  {
    id: "home-comfort",
    title: "Casa e home office",
    colors: ["#f7f2ea", "#c7797d", "#66734d", "#4b352b"],
    motif: "comfort",
  },
  {
    id: "night-event",
    title: "Evento noturno",
    colors: ["#20211f", "#8a3048", "#bd8a2e", "#f2e9da"],
    motif: "night",
  },
  {
    id: "travel-capsule",
    title: "Viagem",
    colors: ["#f1e7d5", "#12636a", "#bd8a2e", "#4b352b"],
    motif: "travel",
  },
  {
    id: "sunglasses",
    title: "Oculos de sol",
    colors: ["#20211f", "#bd8a2e", "#f5efe5", "#8a3048"],
    motif: "sunglasses",
  },
  {
    id: "eyeglasses",
    title: "Armacao de grau",
    colors: ["#4b352b", "#f7f2ea", "#12636a", "#747a7a"],
    motif: "eyeglasses",
  },
  {
    id: "gold-jewelry",
    title: "Joias e metais",
    colors: ["#fff8ea", "#bd8a2e", "#8a6b2f", "#f2e9da"],
    motif: "jewelry",
  },
  {
    id: "structured-bag",
    title: "Bolsa estruturada",
    colors: ["#4b352b", "#f2e9da", "#0f5b68", "#bd8a2e"],
    motif: "bag",
  },
  {
    id: "belt",
    title: "Cinto e acabamento",
    colors: ["#4b352b", "#bd8a2e", "#f2e9da", "#20211f"],
    motif: "belt",
  },
  {
    id: "natural-makeup",
    title: "Maquiagem natural",
    colors: ["#f1c5ad", "#c7797d", "#8a3048", "#f8eee8"],
    motif: "makeup",
  },
  {
    id: "bold-lip",
    title: "Batom marcante",
    colors: ["#8a3048", "#f7f2ea", "#bd8a2e", "#20211f"],
    motif: "lip",
  },
  {
    id: "hair-accessories",
    title: "Cabelo e acessorios",
    colors: ["#4b352b", "#f2e9da", "#c7797d", "#bd8a2e"],
    motif: "hair",
  },
  {
    id: "shopping-priority",
    title: "Compras prioritarias",
    colors: ["#f7f2ea", "#12636a", "#8a3048", "#bd8a2e"],
    motif: "shopping",
  },
];

function iconSvg(motif, colors) {
  const [a, b, c, d] = colors;

  const common = `stroke="${a}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"`;

  const motifs = {
    palette: `
      <circle cx="230" cy="270" r="62" fill="${a}"/>
      <circle cx="340" cy="235" r="54" fill="${b}"/>
      <circle cx="448" cy="278" r="48" fill="${c}"/>
      <rect x="192" y="365" width="310" height="32" rx="16" fill="${d}" opacity=".95"/>`,
    rack: `
      <path d="M190 180h340" ${common}/>
      <path d="M250 180v260M470 180v260" ${common}/>
      <rect x="220" y="225" width="92" height="170" rx="26" fill="${b}"/>
      <rect x="324" y="225" width="92" height="170" rx="26" fill="${c}"/>
      <rect x="428" y="225" width="92" height="170" rx="26" fill="${a}"/>`,
    tailoring: `
      <path d="M278 174l-72 56v220h260V230l-72-56-58 96z" fill="${b}" stroke="${a}" stroke-width="7"/>
      <path d="M336 270l-58-96M336 270l58-96M336 270v180" ${common}/>
      <circle cx="336" cy="326" r="8" fill="${d}"/><circle cx="336" cy="368" r="8" fill="${d}"/>`,
    beach: `
      <path d="M175 380c92-64 231-64 322 0" stroke="${d}" stroke-width="22" fill="none"/>
      <path d="M220 214h232l-42 120H260z" fill="${b}"/>
      <circle cx="480" cy="178" r="42" fill="${a}"/>
      <path d="M245 214c28-52 150-52 178 0" stroke="${c}" stroke-width="18" fill="none"/>`,
    dress: `
      <path d="M335 164c-36 54-84 76-105 286h210c-22-210-70-232-105-286z" fill="${b}" stroke="${a}" stroke-width="7"/>
      <path d="M286 244h98M252 370h166" stroke="${d}" stroke-width="9" stroke-linecap="round"/>`,
    layers: `
      <rect x="205" y="190" width="260" height="260" rx="54" fill="${b}"/>
      <rect x="250" y="235" width="170" height="215" rx="42" fill="${a}"/>
      <path d="M228 214l-60 88M442 214l60 88" ${common}/>
      <path d="M286 178c24-28 74-28 98 0" stroke="${c}" stroke-width="20" fill="none"/>`,
    modest: `
      <rect x="235" y="172" width="200" height="278" rx="62" fill="${d}" opacity=".9"/>
      <path d="M254 226c46 34 118 34 164 0" ${common}/>
      <path d="M282 310h108M270 372h132" stroke="${b}" stroke-width="16" stroke-linecap="round"/>`,
    casual: `
      <rect x="212" y="204" width="150" height="210" rx="42" fill="${b}"/>
      <rect x="375" y="230" width="105" height="185" rx="30" fill="${a}"/>
      <path d="M250 420h95M390 420h76" ${common}/>
      <circle cx="438" cy="184" r="28" fill="${d}"/>`,
    comfort: `
      <path d="M198 318c36-78 238-78 274 0v72H198z" fill="${b}"/>
      <rect x="230" y="210" width="210" height="120" rx="46" fill="${a}"/>
      <path d="M250 390h170" stroke="${d}" stroke-width="18" stroke-linecap="round"/>`,
    night: `
      <rect x="225" y="185" width="220" height="270" rx="42" fill="${b}"/>
      <path d="M270 230h130M270 280h88" stroke="${c}" stroke-width="12" stroke-linecap="round"/>
      <circle cx="460" cy="185" r="34" fill="${d}"/>`,
    travel: `
      <rect x="220" y="210" width="230" height="220" rx="32" fill="${c}" stroke="${a}" stroke-width="7"/>
      <path d="M280 210v-32h110v32M220 278h230" ${common}/>
      <circle cx="285" cy="382" r="12" fill="${d}"/><circle cx="385" cy="382" r="12" fill="${d}"/>`,
    sunglasses: `
      <path d="M190 280c54-38 120-38 174 0M370 280c54-38 120-38 174 0" ${common}/>
      <rect x="178" y="272" width="150" height="82" rx="32" fill="${a}"/>
      <rect x="374" y="272" width="150" height="82" rx="32" fill="${a}"/>
      <path d="M328 306h46" stroke="${d}" stroke-width="12" stroke-linecap="round"/>`,
    eyeglasses: `
      <rect x="182" y="264" width="146" height="86" rx="34" fill="none" stroke="${a}" stroke-width="12"/>
      <rect x="374" y="264" width="146" height="86" rx="34" fill="none" stroke="${a}" stroke-width="12"/>
      <path d="M328 306h46M182 296l-56-32M520 296l56-32" stroke="${b}" stroke-width="11" stroke-linecap="round"/>`,
    jewelry: `
      <circle cx="336" cy="280" r="96" fill="none" stroke="${b}" stroke-width="18"/>
      <circle cx="336" cy="176" r="18" fill="${d}"/>
      <circle cx="225" cy="380" r="38" fill="${b}"/><circle cx="447" cy="380" r="38" fill="${b}"/>`,
    bag: `
      <rect x="220" y="245" width="230" height="185" rx="34" fill="${a}"/>
      <path d="M280 245v-34c0-42 110-42 110 0v34" stroke="${c}" stroke-width="13" fill="none"/>
      <path d="M260 326h150" stroke="${d}" stroke-width="11" stroke-linecap="round"/>`,
    belt: `
      <rect x="165" y="280" width="340" height="78" rx="26" fill="${a}"/>
      <rect x="255" y="258" width="118" height="122" rx="28" fill="none" stroke="${b}" stroke-width="16"/>
      <path d="M373 319h125" stroke="${d}" stroke-width="11" stroke-linecap="round"/>`,
    makeup: `
      <rect x="210" y="270" width="86" height="160" rx="22" fill="${b}"/>
      <rect x="330" y="200" width="70" height="230" rx="28" fill="${a}"/>
      <circle cx="470" cy="330" r="60" fill="${c}"/>
      <path d="M452 330h36" stroke="${d}" stroke-width="10" stroke-linecap="round"/>`,
    lip: `
      <rect x="280" y="255" width="105" height="175" rx="28" fill="${a}"/>
      <path d="M304 254l56-84 26 84z" fill="${a}"/>
      <rect x="255" y="405" width="155" height="34" rx="15" fill="${c}"/>`,
    hair: `
      <path d="M235 316c0-86 46-138 106-138s106 52 106 138c0 70-44 120-106 120s-106-50-106-120z" fill="${a}"/>
      <path d="M278 214c28 34 98 38 130 0" stroke="${c}" stroke-width="14" fill="none"/>
      <circle cx="430" cy="235" r="26" fill="${d}"/>`,
    shopping: `
      <rect x="210" y="250" width="120" height="170" rx="28" fill="${a}"/>
      <rect x="350" y="215" width="120" height="205" rx="28" fill="${b}"/>
      <path d="M246 250v-32c0-34 52-34 52 0v32M386 215v-32c0-34 52-34 52 0v32" stroke="${d}" stroke-width="11" fill="none"/>`,
  };

  return motifs[motif] || motifs.palette;
}

function svgFor(asset) {
  const [a, b, c, d] = asset.colors;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760" viewBox="0 0 1200 760">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="${d}"/>
      <stop offset=".52" stop-color="#fffaf1"/>
      <stop offset="1" stop-color="${c}"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="22" stdDeviation="20" flood-color="#2f2518" flood-opacity=".18"/>
    </filter>
  </defs>
  <rect width="1200" height="760" fill="url(#bg)"/>
  <circle cx="1030" cy="120" r="180" fill="${a}" opacity=".10"/>
  <circle cx="80" cy="660" r="170" fill="${b}" opacity=".13"/>
  <rect x="98" y="76" width="1004" height="608" rx="46" fill="#fffaf1" opacity=".92" filter="url(#shadow)"/>
  <rect x="146" y="118" width="908" height="524" rx="36" fill="#f7f2ea"/>
  <g transform="translate(262 74) scale(1.22)">
    ${iconSvg(asset.motif, asset.colors)}
  </g>
  <text x="600" y="626" text-anchor="middle" fill="#20211f" font-family="Arial, sans-serif" font-size="46" font-weight="800">${asset.title}</text>
  <g transform="translate(440 668)">
    <circle cx="0" cy="0" r="15" fill="${a}"/>
    <circle cx="46" cy="0" r="15" fill="${b}"/>
    <circle cx="92" cy="0" r="15" fill="${c}"/>
    <circle cx="138" cy="0" r="15" fill="${d}"/>
  </g>
</svg>`;
}

await mkdir(outDir, { recursive: true });

for (const asset of assets) {
  await sharp(Buffer.from(svgFor(asset)))
    .png()
    .resize(1200, 760)
    .toFile(path.join(outDir, `${asset.id}.png`));
}

console.log(`Generated ${assets.length} style assets in ${outDir}`);
