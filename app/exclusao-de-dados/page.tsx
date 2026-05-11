import Link from "next/link";

export const metadata = {
  title: "Exclusao de Dados | Personal Style Company",
  description: "Como solicitar exclusao de dados na Personal Style Company.",
};

export default function DataDeletionPage() {
  return (
    <main className="legalPage">
      <article className="legalDocument">
        <p className="eyebrow">Personal Style Company</p>
        <h1>Exclusao de Dados</h1>
        <p className="legalUpdated">Ultima atualizacao: 11 de maio de 2026</p>

        <p>
          Voce pode solicitar a exclusao dos seus dados pessoais tratados pela
          Personal Style Company, incluindo dados enviados pelo site, WhatsApp
          ou e-mail.
        </p>

        <h2>Como solicitar</h2>
        <p>
          Envie um e-mail para{" "}
          <a href="mailto:contato@personalstylecompany.com.br">
            contato@personalstylecompany.com.br
          </a>{" "}
          com o assunto "Exclusao de dados" e informe o telefone ou e-mail usado
          no atendimento.
        </p>

        <h2>Prazo</h2>
        <p>
          Confirmaremos o recebimento e processaremos a solicitacao em prazo
          razoavel, observadas obrigacoes legais, antifraude, seguranca e
          registros necessarios para cumprimento de deveres legais.
        </p>

        <h2>Dados em fornecedores</h2>
        <p>
          Quando aplicavel, tambem solicitaremos a exclusao ou anonimizacao de
          dados mantidos por fornecedores usados para hospedagem, mensagens,
          e-mail e processamento tecnico.
        </p>

        <div className="legalActions">
          <Link href="/">Voltar ao site</Link>
          <Link href="/politica-de-privacidade">Politica de Privacidade</Link>
          <Link href="/termos-de-uso">Termos de Uso</Link>
        </div>
      </article>
    </main>
  );
}
