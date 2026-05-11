import Link from "next/link";

export const metadata = {
  title: "Politica de Privacidade | Personal Style Company",
  description: "Politica de privacidade da Personal Style Company.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="legalPage">
      <article className="legalDocument">
        <p className="eyebrow">Personal Style Company</p>
        <h1>Politica de Privacidade</h1>
        <p className="legalUpdated">Ultima atualizacao: 11 de maio de 2026</p>

        <p>
          A Personal Style Company oferece analises de imagem, estilo, cores,
          maquiagem e acessorios com apoio de tecnologia e inteligencia
          artificial. Esta Politica de Privacidade explica como coletamos,
          usamos e protegemos dados fornecidos por clientes no site e em canais
          de atendimento, incluindo WhatsApp e e-mail.
        </p>

        <h2>Dados que podemos coletar</h2>
        <p>
          Podemos coletar nome, e-mail, telefone, respostas a questionarios,
          preferencias de estilo, idade, altura, genero informado pela pessoa,
          fotos enviadas para analise e dados tecnicos necessarios para operar
          o servico.
        </p>

        <h2>Como usamos os dados</h2>
        <p>
          Usamos os dados para gerar analises personalizadas, responder
          solicitacoes, melhorar a experiencia do cliente, prestar suporte,
          cumprir obrigacoes legais e manter a seguranca do servico.
        </p>

        <h2>Fotos e dados sensiveis</h2>
        <p>
          Fotos e informacoes de aparencia sao usadas apenas para produzir a
          analise solicitada. Recomendamos que clientes enviem somente imagens
          proprias e adequadas para consultoria de imagem. Nao vendemos fotos
          ou dados pessoais.
        </p>

        <h2>Compartilhamento com fornecedores</h2>
        <p>
          Podemos usar provedores de tecnologia, hospedagem, e-mail, WhatsApp
          Business Platform e inteligencia artificial para processar as
          solicitacoes. Esses fornecedores recebem apenas os dados necessarios
          para executar suas funcoes.
        </p>

        <h2>Retencao e exclusao</h2>
        <p>
          Mantemos dados pelo tempo necessario para prestar o servico, cumprir
          obrigacoes legais e resolver suporte. A pessoa titular pode solicitar
          exclusao ou correcao de dados pelo e-mail de contato.
        </p>

        <h2>Direitos da pessoa titular</h2>
        <p>
          Voce pode solicitar acesso, correcao, portabilidade, limitacao de uso
          ou exclusao dos seus dados pessoais, conforme aplicavel pela LGPD.
        </p>

        <h2>Contato</h2>
        <p>
          Para privacidade e protecao de dados, entre em contato pelo e-mail{" "}
          <a href="mailto:contato@personalstylecompany.com.br">
            contato@personalstylecompany.com.br
          </a>
          .
        </p>

        <div className="legalActions">
          <Link href="/">Voltar ao site</Link>
          <Link href="/termos-de-uso">Termos de Uso</Link>
          <Link href="/exclusao-de-dados">Exclusao de Dados</Link>
        </div>
      </article>
    </main>
  );
}
