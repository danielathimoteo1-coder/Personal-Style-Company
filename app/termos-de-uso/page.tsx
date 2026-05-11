import Link from "next/link";

export const metadata = {
  title: "Termos de Uso | Personal Style Company",
  description: "Termos de uso da Personal Style Company.",
};

export default function TermsPage() {
  return (
    <main className="legalPage">
      <article className="legalDocument">
        <p className="eyebrow">Personal Style Company</p>
        <h1>Termos de Uso</h1>
        <p className="legalUpdated">Ultima atualizacao: 11 de maio de 2026</p>

        <p>
          Estes Termos de Uso regulam o acesso ao site e aos servicos da
          Personal Style Company. Ao usar nossos canais, voce concorda com estes
          termos.
        </p>

        <h2>Servico oferecido</h2>
        <p>
          A Personal Style Company fornece orientacoes de imagem e estilo, como
          paleta de cores, roupas, maquiagem, acessorios e proximos passos. As
          analises podem usar inteligencia artificial e devem ser entendidas
          como recomendacoes consultivas.
        </p>

        <h2>Responsabilidade da pessoa usuaria</h2>
        <p>
          A pessoa usuaria deve fornecer informacoes verdadeiras, enviar apenas
          fotos que tenha direito de usar e evitar conteudos ilegais,
          ofensivos, sensiveis ou de terceiros sem autorizacao.
        </p>

        <h2>Limitacoes</h2>
        <p>
          As recomendacoes nao substituem aconselhamento medico, psicologico,
          juridico ou financeiro. Resultados podem variar conforme qualidade da
          foto, informacoes fornecidas e interpretacao visual disponivel.
        </p>

        <h2>Uso do WhatsApp e e-mail</h2>
        <p>
          Ao iniciar contato por WhatsApp ou e-mail, voce autoriza o envio de
          mensagens relacionadas ao atendimento solicitado, incluindo perguntas,
          analises, resultados e suporte.
        </p>

        <h2>Propriedade intelectual</h2>
        <p>
          Textos, interfaces, fluxos, marcas e materiais da Personal Style
          Company nao podem ser copiados ou revendidos sem autorizacao. A pessoa
          cliente pode usar sua propria analise para fins pessoais.
        </p>

        <h2>Alteracoes</h2>
        <p>
          Podemos atualizar estes termos para refletir melhorias no servico,
          mudancas legais ou operacionais. A versao mais recente ficara
          disponivel nesta pagina.
        </p>

        <h2>Contato</h2>
        <p>
          Em caso de duvidas, fale conosco pelo e-mail{" "}
          <a href="mailto:contato@personalstylecompany.com.br">
            contato@personalstylecompany.com.br
          </a>
          .
        </p>

        <div className="legalActions">
          <Link href="/">Voltar ao site</Link>
          <Link href="/politica-de-privacidade">Politica de Privacidade</Link>
          <Link href="/exclusao-de-dados">Exclusao de Dados</Link>
        </div>
      </article>
    </main>
  );
}
