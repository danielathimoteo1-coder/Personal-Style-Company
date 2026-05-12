import { NextResponse } from "next/server";
import type { ClientProfile } from "@/lib/analysis";
import {
  ACCEPTED_ANALYSIS_IMAGE_TYPES,
  MAX_ANALYSIS_IMAGE_SIZE,
  runPersonalAnalysis,
} from "@/lib/personal-analysis";
import {
  downloadWhatsAppMedia,
  sendPaletteImage,
  sendPublicImageAsset,
  sendWhatsAppText,
  sendWhatsAppTextChunks,
} from "@/lib/whatsapp";
import { getStaticVisualAssetsForAnalysis } from "@/lib/style-assets";

export const runtime = "nodejs";
export const maxDuration = 300;

type WhatsAppMessage = {
  from: string;
  id: string;
  type: string;
  text?: { body?: string };
  image?: { id?: string; mime_type?: string };
  button?: { text?: string };
  interactive?: {
    button_reply?: { title?: string };
    list_reply?: { title?: string };
  };
};

type WhatsAppWebhookPayload = {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: WhatsAppMessage[];
        statuses?: Array<{
          id?: string;
          status?: string;
          recipient_id?: string;
          errors?: unknown[];
        }>;
      };
    }>;
  }>;
};

type Question =
  | {
      key: "photo";
      prompt: string;
      type: "image";
    }
  | {
      key: keyof ClientProfile;
      prompt: string;
      type: "text";
    };

type ConversationSession = {
  step: number;
  answers: Partial<ClientProfile>;
  photoMediaId?: string;
  status: "collecting" | "processing";
  updatedAt: number;
};

const QUESTIONS: Question[] = [
  {
    key: "photo",
    type: "image",
    prompt:
      "Para comecar, envie uma foto frontal em boa luz. Pode ser rosto/torso ou corpo inteiro.",
  },
  { key: "age", type: "text", prompt: "Qual sua idade?" },
  {
    key: "sex",
    type: "text",
    prompt: "Sexo/genero para orientar estilo? Ex.: feminino, masculino, nao-binario.",
  },
  { key: "height", type: "text", prompt: "Qual sua altura em cm? Ex.: 168" },
  {
    key: "skinTone",
    type: "text",
    prompt:
      "Como voce descreve seu tom de pele para colorimetria? Ex.: claro, medio, moreno, escuro, retinto, oliva. Se nao souber, responda pular.",
  },
  {
    key: "undertone",
    type: "text",
    prompt: "Voce sabe seu subtom? Ex.: quente, frio, neutro, oliva. Se nao souber, responda pular.",
  },
  { key: "hairColor", type: "text", prompt: "Qual a cor atual do seu cabelo?" },
  { key: "eyeColor", type: "text", prompt: "Qual a cor dos seus olhos?" },
  {
    key: "styleGoal",
    type: "text",
    prompt: "Qual seu objetivo de estilo? Ex.: elegante, profissional, moderno, leve.",
  },
  {
    key: "routine",
    type: "text",
    prompt: "Como e sua rotina? Ex.: trabalho presencial, eventos, casual, academia.",
  },
  {
    key: "climate",
    type: "text",
    prompt: "Qual o clima/temperatura que mais influencia suas roupas?",
  },
  {
    key: "budget",
    type: "text",
    prompt: "Orcamento para compras? Ex.: economico, medio, premium.",
  },
  {
    key: "dressCode",
    type: "text",
    prompt: "Existe dress code? Ex.: social, casual, uniforme, discreto.",
  },
  {
    key: "makeupLevel",
    type: "text",
    prompt: "Nivel de maquiagem desejado? Ex.: nenhuma, natural, media, marcante.",
  },
  {
    key: "favoriteColors",
    type: "text",
    prompt: "Quais cores voce gosta de usar?",
  },
  {
    key: "bodyFocus",
    type: "text",
    prompt: "O que voce quer valorizar ou equilibrar no visual?",
  },
  {
    key: "occasionNeeds",
    type: "text",
    prompt:
      "Quais ocasioes voce quer cobrir? Ex.: praia, casamento, trabalho, neve, igreja, faculdade, viagem, casa. Pode listar varias.",
  },
  {
    key: "comfortNeeds",
    type: "text",
    prompt:
      "O que e importante para seu conforto? Ex.: tecido fresco, nada apertado, roupa facil de lavar, sem salto.",
  },
  {
    key: "modestyPreference",
    type: "text",
    prompt:
      "Alguma preferencia de cobertura, decotes ou comprimentos? Ex.: mais discreto, curto ok, sem decote. Se nao tiver, responda pular.",
  },
  {
    key: "footwearPreference",
    type: "text",
    prompt: "Preferencia de calcados? Ex.: tenis, salto baixo, sandalia, sapato fechado, sem salto.",
  },
  {
    key: "accessoryPreference",
    type: "text",
    prompt:
      "Acessorios que usa ou evita? Ex.: oculos de sol, brincos grandes, relogio, bolsas pequenas.",
  },
  {
    key: "shoppingLimit",
    type: "text",
    prompt:
      "Quer comprar pecas novas ou prefere usar o que ja tem? Existe limite de compras?",
  },
  {
    key: "avoidedPieces",
    type: "text",
    prompt: "Tem pecas, tecidos, cores ou estilos que voce evita?",
  },
  {
    key: "restrictions",
    type: "text",
    prompt: "Alguma restricao ou preferencia final? Ex.: conforto, religiao, trabalho, alergias. Se nao tiver, responda pular.",
  },
];

const SESSION_TTL_MS = 1000 * 60 * 60 * 4;

function getSessionStore() {
  const globalStore = globalThis as typeof globalThis & {
    whatsappStyleSessions?: Map<string, ConversationSession>;
  };
  globalStore.whatsappStyleSessions ||= new Map();
  return globalStore.whatsappStyleSessions;
}

function cleanOldSessions() {
  const now = Date.now();
  const store = getSessionStore();

  for (const [phone, session] of store.entries()) {
    if (now - session.updatedAt > SESSION_TTL_MS) {
      store.delete(phone);
    }
  }
}

function createSession(): ConversationSession {
  return {
    step: 0,
    answers: {},
    status: "collecting",
    updatedAt: Date.now(),
  };
}

function getMessageText(message: WhatsAppMessage) {
  return (
    message.text?.body ||
    message.button?.text ||
    message.interactive?.button_reply?.title ||
    message.interactive?.list_reply?.title ||
    ""
  ).trim();
}

function normalizeCommand(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function getMessages(payload: WhatsAppWebhookPayload) {
  return (
    payload.entry?.flatMap((entry) =>
      entry.changes?.flatMap((change) => change.value?.messages || []) || [],
    ) || []
  );
}

function getStatuses(payload: WhatsAppWebhookPayload) {
  return (
    payload.entry?.flatMap((entry) =>
      entry.changes?.flatMap((change) => change.value?.statuses || []) || [],
    ) || []
  );
}

function buildProfile(answers: Partial<ClientProfile>): ClientProfile {
  return {
    age: answers.age || "",
    sex: answers.sex || "",
    height: answers.height || "",
    skinTone: answers.skinTone || "",
    undertone: answers.undertone || "",
    hairColor: answers.hairColor || "",
    eyeColor: answers.eyeColor || "",
    styleGoal: answers.styleGoal || "",
    routine: answers.routine || "",
    climate: answers.climate || "",
    budget: answers.budget || "",
    dressCode: answers.dressCode || "",
    makeupLevel: answers.makeupLevel || "",
    favoriteColors: answers.favoriteColors || "",
    avoidedPieces: answers.avoidedPieces || "",
    bodyFocus: answers.bodyFocus || "",
    occasionNeeds: answers.occasionNeeds || "",
    comfortNeeds: answers.comfortNeeds || "",
    modestyPreference: answers.modestyPreference || "",
    footwearPreference: answers.footwearPreference || "",
    accessoryPreference: answers.accessoryPreference || "",
    shoppingLimit: answers.shoppingLimit || "",
    restrictions: answers.restrictions || "",
  };
}

function formatQuestion(session: ConversationSession) {
  const question = QUESTIONS[session.step];
  return `Pergunta ${session.step + 1}/${QUESTIONS.length}\n\n${question.prompt}`;
}

function formatAnalysisForWhatsApp(analysis: Awaited<ReturnType<typeof runPersonalAnalysis>>) {
  const bestColors = analysis.paleta.cores_principais
    .slice(0, 6)
    .map((color) => `${color.nome} (${color.hex})`)
    .join(", ");
  const avoidColors = analysis.paleta.cores_para_evitar
    .slice(0, 4)
    .map((color) => `${color.nome} (${color.hex})`)
    .join(", ");
  const pieces = analysis.roupas.pecas_chave.slice(0, 6).join(", ");
  const looks = analysis.roupas.looks_recomendados
    .slice(0, 3)
    .map((look) => `- ${look.ocasiao}: ${look.proposta}`)
    .join("\n");
  const occasions = analysis.roupas.ocasioes_especificas
    .slice(0, 8)
    .map((occasion) => `- ${occasion.ocasiao}: ${occasion.look}`)
    .join("\n");
  const makeup = [
    ...analysis.maquiagem.pele.slice(0, 2),
    ...analysis.maquiagem.olhos.slice(0, 2),
    ...analysis.maquiagem.labios.slice(0, 2),
  ].join("\n- ");
  const accessories = [
    ...analysis.acessorios.metais.slice(0, 2),
    ...analysis.acessorios.oculos.slice(0, 2),
    ...analysis.acessorios.joias.slice(0, 2),
  ].join("\n- ");

  return `*Sua analise pessoal ficou pronta*

*Resumo*
${analysis.metadata.resumo}

*Paleta*
${analysis.paleta.nome}
${analysis.paleta.descricao}

Melhores cores: ${bestColors}
Cores para evitar/adaptar: ${avoidColors}

*Roupas*
${analysis.roupas.estrategia_geral}

Pecas-chave: ${pieces}

*Looks sugeridos*
${looks}

*Por ocasiao*
${occasions}

*Maquiagem*
- ${makeup}

*Acessorios*
- ${accessories}

*Proximos passos*
${analysis.proximos_passos.map((step) => `- ${step}`).join("\n")}

Vou enviar tambem sua cartela visual e algumas referencias visuais em imagem.`;
}

async function finalizeAnalysis(to: string, session: ConversationSession) {
  if (!session.photoMediaId) {
    await sendWhatsAppText(to, "Nao encontrei a foto. Envie reiniciar para comecar de novo.");
    return;
  }

  const photo = await downloadWhatsAppMedia(session.photoMediaId);

  if (!ACCEPTED_ANALYSIS_IMAGE_TYPES.has(photo.mimeType)) {
    await sendWhatsAppText(to, "A foto precisa ser JPG, PNG ou WEBP. Envie reiniciar e mande outra imagem.");
    return;
  }

  if (photo.bytes.length > MAX_ANALYSIS_IMAGE_SIZE) {
    await sendWhatsAppText(to, "A foto passou de 8 MB. Envie reiniciar e mande uma imagem menor.");
    return;
  }

  const analysis = await runPersonalAnalysis({
    imageBytes: photo.bytes,
    imageType: photo.mimeType,
    profile: buildProfile(session.answers),
  });

  await sendWhatsAppTextChunks(to, formatAnalysisForWhatsApp(analysis));
  await sendPaletteImage(to, analysis);

  const visualAssets = getStaticVisualAssetsForAnalysis(analysis, 4);
  for (const asset of visualAssets) {
    await sendPublicImageAsset({
      to,
      publicSrc: asset.src,
      caption: `${asset.title}\n${asset.caption}`,
    });
  }
}

async function handleIncomingMessage(message: WhatsAppMessage) {
  cleanOldSessions();

  const to = message.from;
  const text = getMessageText(message);
  const normalized = normalizeCommand(text);
  const store = getSessionStore();

  if (["reiniciar", "comecar", "novo", "cancelar"].includes(normalized)) {
    const session = createSession();
    store.set(to, session);
    await sendWhatsAppText(
      to,
      "Vamos fazer sua analise pessoal pelo WhatsApp. Responda uma pergunta por vez. Se nao souber alguma, responda pular.",
    );
    await sendWhatsAppText(to, formatQuestion(session));
    return;
  }

  let session = store.get(to);

  if (!session) {
    session = createSession();
    store.set(to, session);
    await sendWhatsAppText(
      to,
      "Oi! Vou conduzir sua analise pessoal por aqui. Responda uma pergunta por vez. Se nao souber alguma, responda pular.",
    );
  }

  if (session.status === "processing") {
    await sendWhatsAppText(to, "Sua analise ainda esta sendo processada. Ja te envio aqui.");
    return;
  }

  const question = QUESTIONS[session.step];

  if (question.type === "image") {
    if (message.type !== "image" || !message.image?.id) {
      await sendWhatsAppText(to, formatQuestion(session));
      return;
    }

    session.photoMediaId = message.image.id;
  } else {
    if (!text) {
      await sendWhatsAppText(to, "Responda em texto, por favor. Voce tambem pode escrever pular.");
      return;
    }

    session.answers[question.key] = normalized === "pular" ? "" : text;
  }

  session.step += 1;
  session.updatedAt = Date.now();

  if (session.step < QUESTIONS.length) {
    await sendWhatsAppText(to, formatQuestion(session));
    return;
  }

  session.status = "processing";
  await sendWhatsAppText(to, "Perfeito. Agora vou gerar sua analise e a cartela visual. Pode levar alguns instantes.");

  try {
    await finalizeAnalysis(to, session);
    store.delete(to);
  } catch (error) {
    console.error("WhatsApp analysis error", error);
    session.status = "collecting";
    await sendWhatsAppText(
      to,
      "Nao consegui finalizar a analise agora. Verifique a configuracao da API ou envie reiniciar para tentar novamente.",
    );
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token &&
    token === process.env.WHATSAPP_VERIFY_TOKEN &&
    challenge
  ) {
    return new Response(challenge, { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as WhatsAppWebhookPayload;
  const messages = getMessages(payload);
  const statuses = getStatuses(payload);

  console.log(
    "WhatsApp webhook POST",
    JSON.stringify(
      {
        entries: payload.entry?.length || 0,
        messages: messages.length,
        types: messages.map((message) => message.type),
        from: messages.map((message) => message.from),
        statuses,
      },
      null,
      2,
    ),
  );

  for (const message of messages) {
    try {
      await handleIncomingMessage(message);
    } catch (error) {
      console.error("WhatsApp webhook handler error", error);
    }
  }

  return NextResponse.json({ ok: true });
}
