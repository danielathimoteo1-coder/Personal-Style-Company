export type ColorRecommendation = {
  nome: string;
  hex: string;
  uso: string;
};

export type LookRecommendation = {
  ocasiao: string;
  proposta: string;
};

export type ShoppingPriority = {
  prioridade: string;
  item: string;
  motivo: string;
};

export type IllustrationRecommendation = {
  titulo: string;
  legenda: string;
  direcao_visual: string;
};

export type AnalysisResult = {
  metadata: {
    modo: "ia" | "demo";
    aviso: string;
    confianca: string;
    resumo: string;
  };
  perfil_visual: {
    subtom_aparente: string;
    contraste: string;
    formato_rosto: string;
    linhas_visuais: string;
    observacoes: string[];
    limites_da_foto: string[];
  };
  paleta: {
    nome: string;
    descricao: string;
    cores_principais: ColorRecommendation[];
    neutros: ColorRecommendation[];
    cores_para_evitar: ColorRecommendation[];
    combinacoes: string[];
  };
  roupas: {
    estrategia_geral: string;
    modelagens: string[];
    tecidos: string[];
    pecas_chave: string[];
    looks_recomendados: LookRecommendation[];
    evitar_ou_adaptar: string[];
  };
  maquiagem: {
    pele: string[];
    olhos: string[];
    labios: string[];
    intensidade: string;
    produtos_chave: string[];
  };
  acessorios: {
    metais: string[];
    oculos: string[];
    joias: string[];
    bolsas_e_cintos: string[];
    cabelo: string[];
  };
  compras: ShoppingPriority[];
  proximos_passos: string[];
  imagens: {
    perfil_visual: IllustrationRecommendation;
    paleta: IllustrationRecommendation;
    roupas: IllustrationRecommendation;
    maquiagem: IllustrationRecommendation;
    acessorios: IllustrationRecommendation;
    compras: IllustrationRecommendation;
    proximos_passos: IllustrationRecommendation;
  };
};

export type ClientProfile = {
  age: string;
  sex: string;
  height: string;
  skinTone: string;
  undertone: string;
  hairColor: string;
  eyeColor: string;
  styleGoal: string;
  routine: string;
  climate: string;
  budget: string;
  dressCode: string;
  makeupLevel: string;
  favoriteColors: string;
  avoidedPieces: string;
  bodyFocus: string;
  restrictions: string;
};

const colorItemSchema = {
  type: "object",
  properties: {
    nome: { type: "string" },
    hex: { type: "string" },
    uso: { type: "string" },
  },
  required: ["nome", "hex", "uso"],
  additionalProperties: false,
};

const lookSchema = {
  type: "object",
  properties: {
    ocasiao: { type: "string" },
    proposta: { type: "string" },
  },
  required: ["ocasiao", "proposta"],
  additionalProperties: false,
};

const shoppingSchema = {
  type: "object",
  properties: {
    prioridade: { type: "string" },
    item: { type: "string" },
    motivo: { type: "string" },
  },
  required: ["prioridade", "item", "motivo"],
  additionalProperties: false,
};

const illustrationSchema = {
  type: "object",
  properties: {
    titulo: { type: "string" },
    legenda: { type: "string" },
    direcao_visual: { type: "string" },
  },
  required: ["titulo", "legenda", "direcao_visual"],
  additionalProperties: false,
};

export const analysisJsonSchema = {
  type: "object",
  properties: {
    metadata: {
      type: "object",
      properties: {
        modo: { type: "string", enum: ["ia", "demo"] },
        aviso: { type: "string" },
        confianca: { type: "string" },
        resumo: { type: "string" },
      },
      required: ["modo", "aviso", "confianca", "resumo"],
      additionalProperties: false,
    },
    perfil_visual: {
      type: "object",
      properties: {
        subtom_aparente: { type: "string" },
        contraste: { type: "string" },
        formato_rosto: { type: "string" },
        linhas_visuais: { type: "string" },
        observacoes: {
          type: "array",
          items: { type: "string" },
        },
        limites_da_foto: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: [
        "subtom_aparente",
        "contraste",
        "formato_rosto",
        "linhas_visuais",
        "observacoes",
        "limites_da_foto"
      ],
      additionalProperties: false,
    },
    paleta: {
      type: "object",
      properties: {
        nome: { type: "string" },
        descricao: { type: "string" },
        cores_principais: {
          type: "array",
          items: colorItemSchema,
        },
        neutros: {
          type: "array",
          items: colorItemSchema,
        },
        cores_para_evitar: {
          type: "array",
          items: colorItemSchema,
        },
        combinacoes: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: [
        "nome",
        "descricao",
        "cores_principais",
        "neutros",
        "cores_para_evitar",
        "combinacoes"
      ],
      additionalProperties: false,
    },
    roupas: {
      type: "object",
      properties: {
        estrategia_geral: { type: "string" },
        modelagens: {
          type: "array",
          items: { type: "string" },
        },
        tecidos: {
          type: "array",
          items: { type: "string" },
        },
        pecas_chave: {
          type: "array",
          items: { type: "string" },
        },
        looks_recomendados: {
          type: "array",
          items: lookSchema,
        },
        evitar_ou_adaptar: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: [
        "estrategia_geral",
        "modelagens",
        "tecidos",
        "pecas_chave",
        "looks_recomendados",
        "evitar_ou_adaptar"
      ],
      additionalProperties: false,
    },
    maquiagem: {
      type: "object",
      properties: {
        pele: {
          type: "array",
          items: { type: "string" },
        },
        olhos: {
          type: "array",
          items: { type: "string" },
        },
        labios: {
          type: "array",
          items: { type: "string" },
        },
        intensidade: { type: "string" },
        produtos_chave: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: ["pele", "olhos", "labios", "intensidade", "produtos_chave"],
      additionalProperties: false,
    },
    acessorios: {
      type: "object",
      properties: {
        metais: {
          type: "array",
          items: { type: "string" },
        },
        oculos: {
          type: "array",
          items: { type: "string" },
        },
        joias: {
          type: "array",
          items: { type: "string" },
        },
        bolsas_e_cintos: {
          type: "array",
          items: { type: "string" },
        },
        cabelo: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: ["metais", "oculos", "joias", "bolsas_e_cintos", "cabelo"],
      additionalProperties: false,
    },
    compras: {
      type: "array",
      items: shoppingSchema,
    },
    proximos_passos: {
      type: "array",
      items: { type: "string" },
    },
    imagens: {
      type: "object",
      properties: {
        perfil_visual: illustrationSchema,
        paleta: illustrationSchema,
        roupas: illustrationSchema,
        maquiagem: illustrationSchema,
        acessorios: illustrationSchema,
        compras: illustrationSchema,
        proximos_passos: illustrationSchema,
      },
      required: [
        "perfil_visual",
        "paleta",
        "roupas",
        "maquiagem",
        "acessorios",
        "compras",
        "proximos_passos"
      ],
      additionalProperties: false,
    },
  },
  required: [
    "metadata",
    "perfil_visual",
    "paleta",
    "roupas",
    "maquiagem",
    "acessorios",
    "compras",
    "proximos_passos",
    "imagens"
  ],
  additionalProperties: false,
};

export function buildDemoAnalysis(profile: ClientProfile): AnalysisResult {
  const height = profile.height ? `${profile.height} cm` : "altura informada";
  const goal = profile.styleGoal || "um visual coerente, atual e facil de usar";

  return {
    metadata: {
      modo: "demo",
      aviso:
        "Modo demonstrativo: configure OPENAI_API_KEY em .env.local para analisar a foto de verdade. Este exemplo usa recomendações genéricas.",
      confianca: "Baixa para foto, media para estrutura do relatorio",
      resumo: `Perfil com ${profile.age || "idade informada"}, ${height}, buscando ${goal}.`,
    },
    perfil_visual: {
      subtom_aparente: "Indefinido no modo demo",
      contraste: "Medio como ponto de partida",
      formato_rosto: "A confirmar com foto em luz natural",
      linhas_visuais: "Equilibrar linhas limpas com pontos de interesse no rosto",
      observacoes: [
        "Use uma foto frontal, sem filtro e com luz natural para melhorar a precisao.",
        "A leitura de cor muda bastante com iluminacao amarela, maquiagem forte ou sombra no rosto.",
        "O relatorio final deve ser tratado como recomendacao estetica, nao como regra fixa.",
      ],
      limites_da_foto: [
        "Sem chave de IA, a imagem nao foi processada.",
        "Uma unica foto nao confirma subtom, contraste ou proporcoes com total seguranca.",
      ],
    },
    paleta: {
      nome: "Neutros sofisticados com acentos vivos",
      descricao:
        "Uma paleta segura para validar o MVP: base neutra, cores medias proximas ao rosto e acentos estrategicos em acessorios.",
      cores_principais: [
        { nome: "Azul petroleo", hex: "#0F5B68", uso: "Blazers, camisas e vestidos" },
        { nome: "Verde oliva", hex: "#66734D", uso: "Calcas, jaquetas e malhas" },
        { nome: "Vinho suave", hex: "#8A3048", uso: "Batom, blusas e detalhes" },
        { nome: "Rosa queimado", hex: "#C7797D", uso: "Blusas, blush e lenços" },
      ],
      neutros: [
        { nome: "Marfim", hex: "#F2E9DA", uso: "Camisas e pontos de luz" },
        { nome: "Cinza medio", hex: "#747A7A", uso: "Alfaiataria e bases" },
        { nome: "Chocolate", hex: "#4B352B", uso: "Bolsas, cintos e sapatos" },
      ],
      cores_para_evitar: [
        { nome: "Amarelo neon", hex: "#DFFF00", uso: "Usar longe do rosto ou em detalhe pequeno" },
        { nome: "Preto absoluto", hex: "#050505", uso: "Quebrar com ponto de luz se usar perto do rosto" },
        { nome: "Bege apagado", hex: "#C9BFAE", uso: "Evitar em grandes areas se a intencao for presenca" },
      ],
      combinacoes: [
        "Marfim + azul petroleo + metal dourado claro",
        "Cinza medio + vinho suave + sapato chocolate",
        "Verde oliva + rosa queimado + acessorio em couro natural",
      ],
    },
    roupas: {
      estrategia_geral:
        "Criar uma base pratica com linhas limpas, bom caimento e uma cor de destaque por look.",
      modelagens: [
        "Blazer levemente acinturado ou reto, conforme conforto",
        "Calca reta ou wide leg com cintura bem posicionada",
        "Camisas com gola aberta ou decote discreto em V",
        "Vestidos midi com estrutura suave",
      ],
      tecidos: [
        "Viscose encorpada",
        "Linho misto",
        "Crepe",
        "Malha premium",
      ],
      pecas_chave: [
        "Blazer neutro",
        "Camisa clara",
        "Calca de alfaiataria",
        "Tricot fino",
        "Sapato versatil em couro",
      ],
      looks_recomendados: [
        {
          ocasiao: "Trabalho",
          proposta: "Calca reta cinza, camisa marfim, blazer azul petroleo e acessorios discretos.",
        },
        {
          ocasiao: "Casual arrumado",
          proposta: "Jeans escuro, malha verde oliva, cinto chocolate e tenis ou loafer limpo.",
        },
        {
          ocasiao: "Noite",
          proposta: "Base escura, terceira peca vinho suave e ponto de brilho proximo ao rosto.",
        },
      ],
      evitar_ou_adaptar: [
        "Tecidos finos demais quando a intencao for imagem profissional",
        "Muitas estampas pequenas competindo com acessorios",
        "Modelagens sem ajuste de barra ou ombro",
      ],
    },
    maquiagem: {
      pele: [
        "Base leve a media, priorizando textura natural",
        "Blush rosa queimado ou pessego fechado",
        "Iluminador sutil somente nos pontos altos",
      ],
      olhos: [
        "Marrom medio, bronze suave ou oliva acinzentado",
        "Mascara de cilios para definir sem pesar",
        "Delineado esfumado em vez de traco muito grafico",
      ],
      labios: [
        "Nude rosado",
        "Vinho suave",
        "Terracota equilibrado",
      ],
      intensidade: "Media, ajustando para rotina e ocasiao",
      produtos_chave: [
        "Corretivo pontual",
        "Blush cremoso",
        "Mascara de cilios",
        "Batom versatil",
      ],
    },
    acessorios: {
      metais: ["Dourado claro", "Prata envelhecida", "Mistura de metais em pecas pequenas"],
      oculos: [
        "Armacoes medias, com linhas levemente ascendentes",
        "Cores tartaruga, vinho escuro ou grafite",
      ],
      joias: [
        "Argolas medias",
        "Colares curtos para iluminar o rosto",
        "Pulseiras finas em composicao",
      ],
      bolsas_e_cintos: [
        "Couro chocolate",
        "Estruturas medias",
        "Fivelas discretas para uso recorrente",
      ],
      cabelo: [
        "Manter contraste coerente com sobrancelhas e pele",
        "Evitar mudancas radicais de cor sem teste de mechas",
      ],
    },
    compras: [
      {
        prioridade: "Alta",
        item: "Blazer neutro de bom caimento",
        motivo: "Eleva rapidamente looks de trabalho e eventos.",
      },
      {
        prioridade: "Alta",
        item: "Camisa clara com tecido encorpado",
        motivo: "Funciona como ponto de luz perto do rosto.",
      },
      {
        prioridade: "Media",
        item: "Batom assinatura",
        motivo: "Ajuda a fechar a identidade visual com baixo custo.",
      },
      {
        prioridade: "Media",
        item: "Cinto e sapato coordenados",
        motivo: "Dá acabamento ao look sem excesso de informacao.",
      },
    ],
    proximos_passos: [
      "Enviar foto frontal com luz natural e fundo simples.",
      "Adicionar duas fotos de corpo inteiro para melhorar recomendacoes de caimento.",
      "Responder preferencias de estilo, rotina e restricoes de compra.",
      "Validar paleta com tecidos reais perto do rosto.",
    ],
    imagens: {
      perfil_visual: {
        titulo: "Leitura visual",
        legenda: "Referencia para observar contraste, linhas e pontos de luz perto do rosto.",
        direcao_visual: "Retrato editorial em luz natural com styling limpo.",
      },
      paleta: {
        titulo: "Paleta aplicada",
        legenda: "Cores principais e neutros aparecem como materiais proximos ao uso real.",
        direcao_visual: "Tecidos, cabides e amostras de cor organizadas como moodboard.",
      },
      roupas: {
        titulo: "Silhuetas e caimento",
        legenda: "Imagem para traduzir modelagens, camadas e acabamento de look.",
        direcao_visual: "Arara de roupas com alfaiataria, malhas e pecas-chave.",
      },
      maquiagem: {
        titulo: "Beleza sugerida",
        legenda: "Referencia para intensidade, textura de pele e familia de cores.",
        direcao_visual: "Produtos de maquiagem com tons rosados, terrosos e vinho suave.",
      },
      acessorios: {
        titulo: "Acabamentos",
        legenda: "Metais, oculos, joias e couro ajudam a fechar a identidade visual.",
        direcao_visual: "Acessorios sofisticados em composicao de mesa.",
      },
      compras: {
        titulo: "Prioridades de compra",
        legenda: "A lista visual facilita decidir o que entra primeiro no guarda-roupa.",
        direcao_visual: "Sacolas, provador e selecao enxuta de pecas versateis.",
      },
      proximos_passos: {
        titulo: "Plano de evolucao",
        legenda: "O moodboard orienta testes, fotos futuras e refinamento da consultoria.",
        direcao_visual: "Painel de referencias com cores, textura e styling.",
      },
    },
  };
}
