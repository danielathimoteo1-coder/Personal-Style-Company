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
import { getWardrobeItemsByIds, itemToImageAsset } from "@/lib/wardrobe";

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
    prompt:
      "Voce sabe seu subtom? Subtom e a temperatura da sua pele por baixo do tom aparente: quente costuma combinar mais com dourado, caramelo e pessego; frio costuma combinar mais com prata, rosados e azulados; neutro transita bem entre os dois; oliva pode ter um fundo esverdeado/acinzentado. Para tentar identificar, veja se suas veias parecem mais verdes (quente), azuladas/roxas (frio) ou misturadas (neutro). Ex.: quente, frio, neutro, oliva. Se nao souber, responda pular.",
  },
  { key: "hairColor", type: "text", prompt: "Qual a cor atual do seu cabelo?" },
  { key: "eyeColor", type: "text", prompt: "Qual a cor dos seus olhos?" },
  {
    key: "climate",
    type: "text",
    prompt: "Qual o clima/temperatura que mais influencia suas roupas?",
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
    key: "favoriteNailPolishColor",
    type: "text",
    prompt: "Qual e sua cor favorita de esmalte?",
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
    key: "avoidedPieces",
    type: "text",
    prompt: "Tem pecas, tecidos, cores ou estilos que voce evita?",
  },
];

const SESSION_TTL_MS = 1000 * 60 * 60 * 4;

const WELCOME_MESSAGE =
  "Oi, eu sou a Ellie, sua assistente de estilo da Personal Style Company. Vou te guiar por uma analise pessoal de cores, roupas, maquiagem e acessorios. Vou fazer algumas perguntas rapidinhas e, se voce nao souber alguma resposta, pode escrever pular.";

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
    favoriteNailPolishColor: answers.favoriteNailPolishColor || "",
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
  return `Ellie aqui: pergunta ${session.step + 1}/${QUESTIONS.length}\n\n${question.prompt}`;
}

function formatColorList(colors: Array<{ nome: string; uso: string }>, limit = 6) {
  return colors
    .slice(0, limit)
    .map((color) => `- ${color.nome}: ${color.uso}`)
    .join("\n");
}

function formatGeneralAnalysisForWhatsApp(analysis: Awaited<ReturnType<typeof runPersonalAnalysis>>) {
  const bestColors = formatColorList(analysis.paleta.cores_principais, 6);
  const neutrals = formatColorList(analysis.paleta.neutros, 4);
  const avoidColors = formatColorList(analysis.paleta.cores_para_evitar, 4);
  const pieces = analysis.roupas.pecas_chave.slice(0, 7).map((piece) => `- ${piece}`).join("\n");
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

  return `*Parte 1: analise geral da Ellie*

Prontinho, sua analise pessoal ficou pronta. Primeiro vou te entregar a leitura geral; depois vou mandar uma mensagem separada para cada ocasiao com roupas e acessorios.

*Resumo*
${analysis.metadata.resumo}

*Caracteristicas observadas*
- Subtom aparente: ${analysis.perfil_visual.subtom_aparente}
- Contraste: ${analysis.perfil_visual.contraste}
- Formato do rosto: ${analysis.perfil_visual.formato_rosto}
- Linhas visuais: ${analysis.perfil_visual.linhas_visuais}

*Paleta*
${analysis.paleta.nome}
${analysis.paleta.descricao}

*Cores que combinam*
${bestColors}

*Neutros de base*
${neutrals}

*Cores para evitar/adaptar*
${avoidColors}

*Direcao geral de roupas*
${analysis.roupas.estrategia_geral}

*Pecas-chave*
${pieces}

*Maquiagem*
- ${makeup}

*Acessorios*
- ${accessories}

Agora vou separar as recomendacoes por ocasiao.`;
}

function formatOccasionForWhatsApp(
  occasion: Awaited<ReturnType<typeof runPersonalAnalysis>>["roupas"]["ocasioes_especificas"][number],
) {
  const pieces = getWardrobeItemsByIds(occasion.pecas, occasion.ocasiao, 4);
  const pieceNames = pieces.map((piece) => `- ${piece.titulo}`).join("\n");

  return `*${occasion.ocasiao}*

*Objetivo visual*
${occasion.objetivo_visual}

*Look recomendado*
${occasion.look_completo}

*Roupas e acessorios escolhidos*
${pieceNames}

*Por que funciona*
${occasion.motivo_da_escolha}

*Cores usadas*
${occasion.cores_usadas.map((color) => `- ${color}`).join("\n")}

*Evitar ou adaptar*
${occasion.evitar_ou_adaptar.map((item) => `- ${item}`).join("\n")}`;
}

function formatFinalStepsForWhatsApp(analysis: Awaited<ReturnType<typeof runPersonalAnalysis>>) {
  return `*Proximos passos*
${analysis.proximos_passos.map((step) => `- ${step}`).join("\n")}`;
}

async function finalizeAnalysis(to: string, session: ConversationSession) {
  if (!session.photoMediaId) {
    await sendWhatsAppText(to, "Eu nao encontrei sua foto por aqui. Envie reiniciar para eu comecar de novo com voce.");
    return;
  }

  const photo = await downloadWhatsAppMedia(session.photoMediaId);

  if (!ACCEPTED_ANALYSIS_IMAGE_TYPES.has(photo.mimeType)) {
    await sendWhatsAppText(to, "Essa foto veio em um formato que eu nao consigo ler. Me envie JPG, PNG ou WEBP depois de escrever reiniciar.");
    return;
  }

  if (photo.bytes.length > MAX_ANALYSIS_IMAGE_SIZE) {
    await sendWhatsAppText(to, "A foto ficou um pouquinho pesada. Ela precisa ter ate 8 MB. Escreva reiniciar e me mande uma imagem menor.");
    return;
  }

  const analysis = await runPersonalAnalysis({
    imageBytes: photo.bytes,
    imageType: photo.mimeType,
    profile: buildProfile(session.answers),
  });

  await sendWhatsAppTextChunks(to, formatGeneralAnalysisForWhatsApp(analysis));
  await sendPaletteImage(to, analysis);

  for (const occasion of analysis.roupas.ocasioes_especificas) {
    await sendWhatsAppTextChunks(to, formatOccasionForWhatsApp(occasion));

    const occasionAssets = getWardrobeItemsByIds(occasion.pecas, occasion.ocasiao, 4)
      .slice(0, 2)
      .map(itemToImageAsset);

    for (const asset of occasionAssets) {
      await sendPublicImageAsset({
        to,
        publicSrc: asset.src,
        caption: `${occasion.ocasiao}: ${asset.title}\n${asset.fallback ? "Referencia visual temporaria enquanto o guarda-roupa real e preenchido." : asset.caption}`,
      });

      if (asset.modelSrc) {
        await sendPublicImageAsset({
          to,
          publicSrc: asset.modelSrc,
          caption: `${occasion.ocasiao}: ${asset.title} na modelo`,
        });
      }
    }
  }

  await sendWhatsAppTextChunks(to, formatFinalStepsForWhatsApp(analysis));
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
    await sendWhatsAppText(to, WELCOME_MESSAGE);
    await sendWhatsAppText(to, formatQuestion(session));
    return;
  }

  let session = store.get(to);

  if (!session) {
    session = createSession();
    store.set(to, session);
    await sendWhatsAppText(to, WELCOME_MESSAGE);
  }

  if (session.status === "processing") {
    await sendWhatsAppText(to, "Ainda estou preparando sua analise. Assim que terminar, eu te envio tudo por aqui.");
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
      await sendWhatsAppText(to, "Me responde em texto, por favor. Se nao souber essa parte, pode escrever pular.");
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
  await sendWhatsAppText(to, "Perfeito. Agora eu vou montar sua analise, sua cartela visual e algumas referencias de estilo. Pode levar alguns instantes.");

  try {
    await finalizeAnalysis(to, session);
    store.delete(to);
  } catch (error) {
    console.error("WhatsApp analysis error", error);
    session.status = "collecting";
    await sendWhatsAppText(
      to,
      "Tive um problema para finalizar sua analise agora. Pode enviar reiniciar para tentarmos de novo em alguns instantes.",
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
