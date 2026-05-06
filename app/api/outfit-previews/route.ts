import OpenAI, { toFile } from "openai";
import { NextResponse } from "next/server";
import sharp from "sharp";
import type { AnalysisResult } from "@/lib/analysis";
import {
  getOpenAIErrorDetails,
  getUserFacingOpenAIErrorMessage,
} from "@/lib/openai-errors";

export const runtime = "nodejs";
export const maxDuration = 180;

const MAX_IMAGE_SIZE = 12 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const PANEL_WIDTH = 768;
const PANEL_HEIGHT = 1024;
const CANVAS_WIDTH = PANEL_WIDTH * 2;
const CANVAS_HEIGHT = PANEL_HEIGHT;

function readString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function buildFallbackLook(analysis: AnalysisResult) {
  return {
    ocasiao: "Look recomendado",
    proposta: [
      analysis.roupas.estrategia_geral,
      analysis.roupas.pecas_chave.slice(0, 4).join(", "),
    ]
      .filter(Boolean)
      .join(" "),
  };
}

function getComparisonLooks(analysis: AnalysisResult) {
  const looks = analysis.roupas.looks_recomendados.slice(0, 2);

  if (looks.length >= 2) {
    return looks;
  }

  return [
    ...looks,
    {
      ...buildFallbackLook(analysis),
      ocasiao: looks.length ? "Look alternativo" : "Look 1",
    },
  ].slice(0, 2);
}

async function buildSideBySideSource(imageBytes: Buffer) {
  const panel = await sharp(imageBytes)
    .rotate()
    .resize(PANEL_WIDTH, PANEL_HEIGHT, {
      fit: "contain",
      background: { r: 246, g: 241, b: 232, alpha: 1 },
    })
    .jpeg({ quality: 95 })
    .toBuffer();

  return sharp({
    create: {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      channels: 3,
      background: { r: 246, g: 241, b: 232 },
    },
  })
    .composite([
      { input: panel, left: 0, top: 0 },
      { input: panel, left: PANEL_WIDTH, top: 0 },
    ])
    .jpeg({ quality: 95 })
    .toBuffer();
}

async function buildAutoClothingMask() {
  const leftMask = {
    x: Math.round(PANEL_WIDTH * 0.18),
    y: Math.round(PANEL_HEIGHT * 0.35),
    width: Math.round(PANEL_WIDTH * 0.64),
    height: Math.round(PANEL_HEIGHT * 0.58),
  };
  const rightMask = {
    ...leftMask,
    x: leftMask.x + PANEL_WIDTH,
  };
  const holes = [leftMask, rightMask]
    .map(
      (mask) =>
        `M${mask.x},${mask.y}H${mask.x + mask.width}V${mask.y + mask.height}H${mask.x}Z`,
    )
    .join(" ");
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" viewBox="0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}">
  <path fill="black" fill-rule="evenodd" d="M0,0H${CANVAS_WIDTH}V${CANVAS_HEIGHT}H0Z ${holes}" />
</svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

function buildComparisonPrompt(
  analysis: AnalysisResult,
  looks: Array<{ ocasiao: string; proposta: string }>,
) {
  const colors = analysis.paleta.cores_principais
    .concat(analysis.paleta.neutros)
    .slice(0, 8)
    .map((color) => `${color.nome} (${color.hex})`)
    .join(", ");
  const fabrics = analysis.roupas.tecidos.slice(0, 5).join(", ");
  const accessories = [
    ...analysis.acessorios.metais.slice(0, 2),
    ...analysis.acessorios.joias.slice(0, 2),
    ...analysis.acessorios.bolsas_e_cintos.slice(0, 2),
  ].join(", ");

  return `
This is a masked image edit. The provided source image is already a side-by-side duplicate of the same original client photo. Only the transparent masked areas may be edited.

Output layout:
- Keep the existing landscape side-by-side layout exactly as provided.
- LEFT PANEL: change only clothing inside the masked garment area to Look 1.
- RIGHT PANEL: change only clothing inside the masked garment area to Look 2.
- Preserve every unmasked pixel as close to the source as possible.

Look 1 (${looks[0]?.ocasiao || "Look 1"}):
${looks[0]?.proposta || analysis.roupas.estrategia_geral}

Look 2 (${looks[1]?.ocasiao || "Look 2"}):
${looks[1]?.proposta || buildFallbackLook(analysis).proposta}

Recommended palette: ${colors}
Suggested fabrics: ${fabrics || "quality everyday fabrics"}
Accessories: ${accessories || "subtle accessories that match the outfit"}

EXTREMELY STRICT CLOTHING-ONLY EDIT RULES:
- Do not create a new image. Do not create a new person. Do not redraw the face.
- This must look like the original photo with clothing digitally composited onto the body.
- The face, hair, head, neck, exposed skin, hands, body silhouette, background, lighting, shadows, camera angle, crop, expression, and pose must remain unchanged.
- Edit only clothing pixels inside the masked regions. Unmasked areas are protected and must stay visually identical to the source image.
- If any part of the mask touches skin, hands, face, hair, or background, leave that part unchanged and edit only the garment surface.
- Use flat realistic garment overlays that follow the existing folds, pose, shoulders, waist, and visible body outline.
- Keep coverage and modesty similar to the original clothing. Do not generate lingerie, swimwear, nudity, transparent clothing, or sexualized styling.
- No text, labels, logos, watermarks, captions, before/after graphics, or UI elements inside the image.
- If preserving the person exactly conflicts with an outfit idea, prioritize preserving the person and simplify the outfit.
`;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("photo");
    const analysisText = readString(formData.get("analysis"));

    if (!(image instanceof File)) {
      return NextResponse.json(
        { error: "Envie a imagem original para gerar os exemplos de roupas." },
        { status: 400 },
      );
    }

    if (!ACCEPTED_IMAGE_TYPES.has(image.type)) {
      return NextResponse.json(
        { error: "Use uma imagem JPG, PNG ou WEBP." },
        { status: 400 },
      );
    }

    if (image.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "A imagem deve ter ate 12 MB para gerar exemplos visuais." },
        { status: 400 },
      );
    }

    if (!analysisText) {
      return NextResponse.json(
        { error: "Gere a analise antes de criar exemplos visuais." },
        { status: 400 },
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Configure OPENAI_API_KEY no .env.local para gerar imagens." },
        { status: 400 },
      );
    }

    const analysis = JSON.parse(analysisText) as AnalysisResult;
    const looks = getComparisonLooks(analysis);

    const bytes = Buffer.from(await image.arrayBuffer());
    const comparisonSource = await buildSideBySideSource(bytes);
    const clothingMask = await buildAutoClothingMask();
    const sourceImage = await toFile(comparisonSource, "comparativo-base.jpg", {
      type: "image/jpeg",
    });
    const mask = await toFile(clothingMask, "mascara-roupa.png", {
      type: "image/png",
    });
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const imageModel = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";
    const canUseInputFidelity = !imageModel.includes("mini");

    const result = await openai.images.edit({
      model: imageModel,
      image: sourceImage,
      mask,
      prompt: buildComparisonPrompt(analysis, looks),
      n: 1,
      size: "1536x1024",
      quality: "medium",
      output_format: "jpeg",
      ...(canUseInputFidelity ? { input_fidelity: "high" as const } : {}),
    });
    const b64 = result.data?.[0]?.b64_json;

    if (!b64) {
      throw new Error("A OpenAI nao retornou a imagem comparativa.");
    }

    return NextResponse.json({
      previews: [
        {
          titulo: "Comparativo lado a lado",
          descricao: looks
            .map((look, index) => `Look ${index + 1}: ${look.ocasiao}`)
            .join(" | "),
          imageUrl: `data:image/jpeg;base64,${b64}`,
        },
      ],
    });
  } catch (error) {
    console.error("Outfit previews API error", getOpenAIErrorDetails(error));
    return NextResponse.json(
      {
        error: getUserFacingOpenAIErrorMessage(error),
      },
      { status: 500 },
    );
  }
}
