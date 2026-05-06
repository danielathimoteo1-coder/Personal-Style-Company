export function getOpenAIErrorDetails(error: unknown) {
  if (!error || typeof error !== "object") {
    return {
      status: undefined,
      code: undefined,
      type: undefined,
      message: "Erro desconhecido ao chamar a OpenAI.",
      requestID: undefined,
    };
  }

  const candidate = error as {
    status?: number;
    code?: string;
    type?: string;
    message?: string;
    requestID?: string;
    error?: {
      code?: string;
      type?: string;
      message?: string;
    };
  };

  return {
    status: candidate.status,
    code: candidate.code || candidate.error?.code,
    type: candidate.type || candidate.error?.type,
    message: candidate.error?.message || candidate.message || "Erro ao chamar a OpenAI.",
    requestID: candidate.requestID,
  };
}

export function getUserFacingOpenAIErrorMessage(error: unknown) {
  const details = getOpenAIErrorDetails(error);

  if (details.status === 401) {
    return "A chave da OpenAI foi recusada. Confira se OPENAI_API_KEY esta correta no .env.local e reinicie o servidor.";
  }

  if (details.status === 429 || details.code === "insufficient_quota") {
    return "A chave esta ativa, mas a conta/projeto esta sem cota ou credito de API. Adicione credito em https://platform.openai.com/settings/organization/billing e tente novamente.";
  }

  if (details.status === 404 || details.code === "model_not_found") {
    return "O modelo configurado nao esta disponivel para essa chave. Confira OPENAI_MODEL ou OPENAI_IMAGE_MODEL no .env.local e reinicie o servidor.";
  }

  return "Nao foi possivel concluir a chamada da OpenAI agora. Verifique a chave da API, o modelo configurado e tente novamente.";
}
