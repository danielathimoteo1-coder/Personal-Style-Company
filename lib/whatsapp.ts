import sharp from "sharp";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { buildPaletteSvg } from "@/lib/palette-card";
import type { AnalysisResult } from "@/lib/analysis";

type WhatsAppMediaInfo = {
  url: string;
  mime_type?: string;
};

function getGraphVersion() {
  return process.env.WHATSAPP_GRAPH_VERSION || "v24.0";
}

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Configure ${name} no .env.local.`);
  }

  return value;
}

function getMessagesUrl() {
  const phoneNumberId = getRequiredEnv("WHATSAPP_PHONE_NUMBER_ID");
  return `https://graph.facebook.com/${getGraphVersion()}/${phoneNumberId}/messages`;
}

function getMediaUrl() {
  const phoneNumberId = getRequiredEnv("WHATSAPP_PHONE_NUMBER_ID");
  return `https://graph.facebook.com/${getGraphVersion()}/${phoneNumberId}/media`;
}

async function graphFetch(url: string, init: RequestInit) {
  const token = getRequiredEnv("WHATSAPP_ACCESS_TOKEN");
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`WhatsApp API error ${response.status}: ${body}`);
  }

  return response;
}

export async function sendWhatsAppText(to: string, body: string) {
  await graphFetch(getMessagesUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: {
        preview_url: false,
        body,
      },
    }),
  });
}

export async function sendWhatsAppTextChunks(to: string, body: string) {
  const chunkSize = 3000;

  for (let index = 0; index < body.length; index += chunkSize) {
    await sendWhatsAppText(to, body.slice(index, index + chunkSize));
  }
}

export async function uploadWhatsAppMedia({
  buffer,
  filename,
  mimeType,
}: {
  buffer: Buffer;
  filename: string;
  mimeType: string;
}) {
  const formData = new FormData();
  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;

  formData.append("messaging_product", "whatsapp");
  formData.append("type", mimeType);
  formData.append("file", new Blob([arrayBuffer], { type: mimeType }), filename);

  const response = await graphFetch(getMediaUrl(), {
    method: "POST",
    body: formData,
  });
  const data = (await response.json()) as { id?: string };

  if (!data.id) {
    throw new Error("WhatsApp nao retornou id de midia.");
  }

  return data.id;
}

export async function sendWhatsAppImageById({
  to,
  mediaId,
  caption,
}: {
  to: string;
  mediaId: string;
  caption?: string;
}) {
  await graphFetch(getMessagesUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "image",
      image: {
        id: mediaId,
        ...(caption ? { caption } : {}),
      },
    }),
  });
}

export async function sendWhatsAppDocumentById({
  to,
  mediaId,
  filename,
  caption,
}: {
  to: string;
  mediaId: string;
  filename: string;
  caption?: string;
}) {
  await graphFetch(getMessagesUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "document",
      document: {
        id: mediaId,
        filename,
        ...(caption ? { caption } : {}),
      },
    }),
  });
}

export async function sendWhatsAppDocumentBuffer({
  to,
  buffer,
  filename,
  mimeType,
  caption,
}: {
  to: string;
  buffer: Buffer;
  filename: string;
  mimeType: string;
  caption?: string;
}) {
  const mediaId = await uploadWhatsAppMedia({
    buffer,
    filename,
    mimeType,
  });

  await sendWhatsAppDocumentById({
    to,
    mediaId,
    filename,
    caption,
  });
}

export async function downloadWhatsAppMedia(mediaId: string) {
  const phoneNumberId = getRequiredEnv("WHATSAPP_PHONE_NUMBER_ID");
  const infoUrl = `https://graph.facebook.com/${getGraphVersion()}/${mediaId}?phone_number_id=${phoneNumberId}`;
  const infoResponse = await graphFetch(infoUrl, { method: "GET" });
  const info = (await infoResponse.json()) as WhatsAppMediaInfo;

  if (!info.url) {
    throw new Error("WhatsApp nao retornou URL da midia.");
  }

  const mediaResponse = await graphFetch(info.url, { method: "GET" });
  const bytes = Buffer.from(await mediaResponse.arrayBuffer());

  return {
    bytes,
    mimeType: info.mime_type || mediaResponse.headers.get("content-type") || "image/jpeg",
  };
}

export async function buildPalettePng(analysis: AnalysisResult) {
  return sharp(Buffer.from(buildPaletteSvg(analysis))).png().toBuffer();
}

export async function sendPaletteImage(to: string, analysis: AnalysisResult) {
  const png = await buildPalettePng(analysis);
  const mediaId = await uploadWhatsAppMedia({
    buffer: png,
    filename: "cartela-de-cores.png",
    mimeType: "image/png",
  });

  await sendWhatsAppImageById({
    to,
    mediaId,
    caption: "Sua cartela visual de cores.",
  });
}

export async function sendPublicImageAsset({
  to,
  publicSrc,
  caption,
}: {
  to: string;
  publicSrc: string;
  caption: string;
}) {
  const cleanSrc = publicSrc.split("?")[0].replace(/^\/+/, "");

  if (!cleanSrc || cleanSrc.includes("..")) {
    throw new Error("Asset publico invalido.");
  }

  const filePath = path.join(process.cwd(), "public", cleanSrc);
  const buffer = await readFile(filePath);
  const extension = path.extname(cleanSrc).toLowerCase();
  const mimeType =
    extension === ".jpg" || extension === ".jpeg"
      ? "image/jpeg"
      : extension === ".webp"
        ? "image/webp"
        : "image/png";
  const mediaId = await uploadWhatsAppMedia({
    buffer,
    filename: path.basename(cleanSrc),
    mimeType,
  });

  await sendWhatsAppImageById({
    to,
    mediaId,
    caption,
  });
}
