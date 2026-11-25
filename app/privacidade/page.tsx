import type { Metadata } from "next";

export const metadata: Metadata = { title: "Política de Privacidade", robots: { index: true } };

export default function Privacidade() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="font-display text-3xl font-semibold">Política de Privacidade</h1>
      <p className="mt-2 text-sm text-[color:var(--color-mute)]">Em conformidade com a LGPD (Lei nº 13.709/2018).</p>
      <div className="mt-8 space-y-5 text-[color:var(--color-mute)]">
        <div className="rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-sand)]/70 p-5">
          <p className="font-semibold text-[color:var(--color-ink)]">Controlador dos dados</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li><strong className="text-[color:var(--color-ink)]">Razão social:</strong> Meira Lins Hotéis Ltda.</li>
            <li><strong className="text-[color:var(--color-ink)]">Nome fantasia:</strong> Nannai Muro Alto</li>
            <li><strong className="text-[color:var(--color-ink)]">CNPJ:</strong> 01.273.335/0001-46</li>
            <li><strong className="text-[color:var(--color-ink)]">Atividade:</strong> Hotéis (CNAE 55.10-8-01)</li>
            <li><strong className="text-[color:var(--color-ink)]">Endereço:</strong> Rodovia PE-09, s/n, Km 3 — Muro Alto, Ipojuca/PE, CEP 55590-000</li>
          </ul>
        </div>
        <p>Esta página descreve como os dados informados nos formulários das campanhas são tratados pelo controlador identificado acima. O cadastro em uma campanha coleta os dados que você fornece (como nome, e-mail e WhatsApp) com a finalidade de enviar informações e condições comerciais da oferta correspondente e de dar andamento à sua solicitação de reserva.</p>
        <p><strong className="text-[color:var(--color-ink)]">Base legal.</strong> O tratamento necessário para processar seu cadastro ocorre a partir do seu consentimento específico, registrado no momento do envio. O recebimento de comunicações promocionais é opcional e depende de um consentimento separado, não pré-marcado.</p>
        <p><strong className="text-[color:var(--color-ink)]">Seus direitos.</strong> Você pode solicitar acesso, correção, portabilidade ou exclusão dos seus dados, bem como revogar o consentimento a qualquer momento, pelos canais de contato informados no rodapé da campanha.</p>
        <p><strong className="text-[color:var(--color-ink)]">Cookies.</strong> Cookies de marketing (pixels de anúncios) só são ativados mediante seu aceite no aviso exibido na página.</p>
        <p className="text-sm">Observação: este é um modelo inicial. Revise e ajuste o texto com apoio jurídico antes de usar em produção.</p>
      </div>
    </main>
  );
}
