import OpenAI from "openai";
import {
  analysisJsonSchema,
  buildDemoAnalysis,
  type AnalysisResult,
  type ClientProfile,
} from "@/lib/analysis";

export const MAX_ANALYSIS_IMAGE_SIZE = 8 * 1024 * 1024;
export const ACCEPTED_ANALYSIS_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function buildPrompt(profile: ClientProfile) {
  return `
Voce e um assistente de consultoria de imagem pessoal. Analise a foto e os dados fornecidos para gerar um relatorio completo, pratico e respeitoso em portugues do Brasil.

Dados declarados pela pessoa:
- Idade: ${profile.age || "nao informada"}
- Sexo/genero informado para orientar estilo: ${profile.sex || "nao informado"}
- Altura: ${profile.height || "nao informada"} cm
- Tom de pele autodeclarado para colorimetria: ${profile.skinTone || "nao informado"}
- Subtom autodeclarado/percebido: ${profile.undertone || "nao informado"}
- Cor de cabelo: ${profile.hairColor || "nao informada"}
- Cor dos olhos: ${profile.eyeColor || "nao informada"}
- Objetivo de estilo: ${profile.styleGoal || "nao informado"}
- Rotina/ocasioes: ${profile.routine || "nao informado"}
- Clima/cidade ou temperatura usual: ${profile.climate || "nao informado"}
- Orcamento: ${profile.budget || "nao informado"}
- Dress code: ${profile.dressCode || "nao informado"}
- Nivel de maquiagem desejado: ${profile.makeupLevel || "nao informado"}
- Cores favoritas: ${profile.favoriteColors || "nao informado"}
- Pecas, caimentos ou estilos que evita: ${profile.avoidedPieces || "nao informado"}
- Pontos que quer valorizar/equilibrar: ${profile.bodyFocus || "nao informado"}
- Restricoes/preferencias: ${profile.restrictions || "nao informado"}

Regras importantes:
- Nao identifique a pessoa.
- Nao estime raca, etnia, saude, gravidez, religiao, classe social, orientacao sexual ou qualquer atributo sensivel nao declarado.
- Use tom de pele e subtom somente quando forem declarados pela pessoa ou claramente apresentados como leitura de colorimetria aparente.
- Nao faca julgamento de beleza, valor, peso ou atratividade.
- Fale em termos de "aparente pela foto", "sugere", "pode favorecer", "vale testar".
- Se a foto nao permitir alguma leitura, diga isso em limites_da_foto.
- Use recomendacoes acionaveis: roupas, paleta, maquiagem, acessorios, compras e proximos passos.
- Em paleta.cores_principais, paleta.neutros e paleta.cores_para_evitar, preencha sempre nome, hex e uso. Use hex real no formato #RRGGBB.
- Em paleta.cores_para_evitar, inclua cores especificas que a pessoa deve evitar perto do rosto ou adaptar, nao apenas frases genericas.
- Em imagens, escreva titulos e legendas curtas que ajudem a ilustrar cada secao do relatorio. Nao inclua URLs.
- Retorne somente JSON compativel com o schema solicitado.
`;
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
    return buildDemoAnalysis(profile);
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
    max_output_tokens: 4800,
  });

  const parsed = JSON.parse(response.output_text) as AnalysisResult;

  return {
    ...parsed,
    metadata: {
      ...parsed.metadata,
      modo: "ia",
    },
  };
}
