import OpenAI from "openai";
import {
  analysisJsonSchema,
  buildDemoAnalysis,
  type AnalysisResult,
  type ClientProfile,
} from "@/lib/analysis";
import {
  WARDROBE_OCCASIONS,
  getWardrobeCatalogPrompt,
  sanitizeWardrobeIds,
  type WardrobeItemId,
} from "@/lib/wardrobe";

export const MAX_ANALYSIS_IMAGE_SIZE = 8 * 1024 * 1024;
export const ACCEPTED_ANALYSIS_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function buildPrompt(profile: ClientProfile) {
  return `
Voce e a Ellie, assistente de consultoria de imagem pessoal da Personal Style Company. Analise a foto e os dados fornecidos para gerar um relatorio completo, pratico, respeitoso e acolhedor em portugues do Brasil.

Dados declarados pela pessoa:
- Idade: ${profile.age || "nao informada"}
- Sexo/genero informado para orientar estilo: ${profile.sex || "nao informado"}
- Altura: ${profile.height || "nao informada"} cm
- Tom de pele autodeclarado para colorimetria: ${profile.skinTone || "nao informado"}
- Subtom autodeclarado/percebido: ${profile.undertone || "nao informado"}
- Cor de cabelo: ${profile.hairColor || "nao informada"}
- Cor dos olhos: ${profile.eyeColor || "nao informada"}
- Objetivo de estilo: ${profile.styleGoal || "nao informado"}
- Rotina: ${profile.routine || "nao informado"}
- Clima/cidade ou temperatura usual: ${profile.climate || "nao informado"}
- Orcamento: ${profile.budget || "nao informado"}
- Dress code: ${profile.dressCode || "nao informado"}
- Nivel de maquiagem desejado: ${profile.makeupLevel || "nao informado"}
- Cores favoritas: ${profile.favoriteColors || "nao informado"}
- Pecas, caimentos ou estilos que evita: ${profile.avoidedPieces || "nao informado"}
- Pontos que quer valorizar/equilibrar: ${profile.bodyFocus || "nao informado"}
- Conforto e praticidade: ${profile.comfortNeeds || "nao informado"}
- Preferencia de cobertura, decotes e comprimentos: ${profile.modestyPreference || "nao informado"}
- Preferencia de calcados: ${profile.footwearPreference || "nao informado"}
- Acessorios que usa ou evita: ${profile.accessoryPreference || "nao informado"}
- Limite de compras ou pecas que ja tem: ${profile.shoppingLimit || "nao informado"}
- Restricoes/preferencias: ${profile.restrictions || "nao informado"}

Catalogo oficial de guarda-roupa disponivel:
${getWardrobeCatalogPrompt()}

O relatorio deve cobrir obrigatoriamente estas 12 ocasioes, nesta ordem:
${WARDROBE_OCCASIONS.map((occasion, index) => `${index + 1}. ${occasion}`).join("\n")}

Regras importantes:
- Nao identifique a pessoa.
- Nao estime raca, etnia, saude, gravidez, religiao, classe social, orientacao sexual ou qualquer atributo sensivel nao declarado.
- Use tom de pele e subtom somente quando forem declarados pela pessoa ou claramente apresentados como leitura de colorimetria aparente.
- Nao faca julgamento de beleza, valor, peso ou atratividade.
- Fale em termos de "aparente pela foto", "sugere", "pode favorecer", "vale testar".
- Se a foto nao permitir alguma leitura, diga isso em limites_da_foto.
- Use recomendacoes acionaveis: roupas, paleta, maquiagem, acessorios, compras e proximos passos.
- A pessoa nao escolhe ocasiao. Sempre entregue o guia completo para todas as 12 ocasioes fixas.
- Em roupas.ocasioes_especificas, devolva exatamente 12 itens, um por ocasiao fixa, sem repetir ocasiao e na mesma ordem.
- Para cada ocasiao, selecione de 2 a 4 IDs em pecas, usando somente IDs existentes no catalogo oficial acima.
- Nunca invente caminhos, URLs, arquivos, nomes de imagem ou IDs.
- Se o catalogo real ainda nao tiver uma peca ideal, use os itens fallback disponiveis e adapte o texto.
- Para igreja/cerimonia discreta, trate como contexto de roupa sobria. Nao inferir religiao da pessoa.
- Em paleta.cores_principais, paleta.neutros e paleta.cores_para_evitar, preencha sempre nome, hex e uso. Use hex real no formato #RRGGBB.
- Em paleta.cores_para_evitar, inclua cores especificas que a pessoa deve evitar perto do rosto ou adaptar, nao apenas frases genericas.
- Em imagens, escreva titulos e legendas curtas que ajudem a ilustrar cada secao do relatorio. Nao inclua URLs.
- Retorne somente JSON compativel com o schema solicitado.
`;
}

function normalizeAnalysisResult(analysis: AnalysisResult): AnalysisResult {
  const byOccasion = new Map(
    analysis.roupas.ocasioes_especificas.map((occasion) => [occasion.ocasiao, occasion]),
  );
  const normalizedOccasions = WARDROBE_OCCASIONS.map((occasion) => {
    const current = byOccasion.get(occasion);

    return {
      ocasiao: occasion,
      objetivo_visual: current?.objetivo_visual || "Montar uma proposta coerente para essa ocasiao.",
      look_completo:
        current?.look_completo ||
        "Use uma base coordenada, uma peca principal do catalogo e acessorios proporcionais ao contexto.",
      pecas: sanitizeWardrobeIds(current?.pecas, occasion, 4) as WardrobeItemId[],
      motivo_da_escolha:
        current?.motivo_da_escolha ||
        "Selecao ajustada para manter IDs validos do catalogo visual.",
      cores_usadas: current?.cores_usadas?.length ? current.cores_usadas : ["Neutros coordenados"],
      evitar_ou_adaptar: current?.evitar_ou_adaptar?.length
        ? current.evitar_ou_adaptar
        : ["Ajustar cobertura, caimento e intensidade ao conforto da pessoa."],
    };
  });

  return {
    ...analysis,
    roupas: {
      ...analysis.roupas,
      ocasioes_especificas: normalizedOccasions,
    },
  };
}

export async function runPersonalAnalysis({
  imageBytes,
  imageType,
  profile,
}: {
  imageBytes: Buffer;
  imageType: string;
  profile: ClientProfile;
}): Promise<AnalysisResult> {
  if (!process.env.OPENAI_API_KEY) {
    return normalizeAnalysisResult(buildDemoAnalysis(profile));
  }

  const imageUrl = `data:${imageType};base64,${imageBytes.toString("base64")}`;
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  const response = await openai.responses.create({
    model,
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: buildPrompt(profile) },
          { type: "input_image", image_url: imageUrl, detail: "auto" },
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "analise_pessoal",
        strict: true,
        schema: analysisJsonSchema,
      },
    },
    max_output_tokens: 9000,
  });

  const parsed = JSON.parse(response.output_text) as AnalysisResult;

  return normalizeAnalysisResult({
    ...parsed,
    metadata: {
      ...parsed.metadata,
      modo: "ia",
    },
  });
}
