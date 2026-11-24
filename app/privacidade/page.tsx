import type { Metadata } from "next";

export const metadata: Metadata = { title: "Política de Privacidade", robots: { index: true } };

export default function Privacidade() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="font-display text-3xl font-semibold">Política de Privacidade</h1>
      <p className="mt-2 text-sm text-[color:var(--color-mute)]">Em conformidade com a LGPD (Lei nº 13.709/2018).</p>
      <div className="mt-8 space-y-5 text-[color:var(--color-mute)]">
        <p>Esta página descreve como os dados informados nos formulários das campanhas são tratados. O cadastro em uma campanha coleta os dados que você fornece (como nome, e-mail e WhatsApp) com a finalidade de enviar informações e condições comerciais da oferta correspondente.</p>
        <p><strong className="text-[color:var(--color-ink)]">Base legal.</strong> O tratamento necessário para processar seu cadastro ocorre a partir do seu consentimento específico, registrado no momento do envio. O recebimento de comunicações promocionais é opcional e depende de um consentimento separado, não pré-marcado.</p>
        <p><strong className="text-[color:var(--color-ink)]">Seus direitos.</strong> Você pode solicitar acesso, correção, portabilidade ou exclusão dos seus dados, bem como revogar o consentimento a qualquer momento, pelos canais de contato informados no rodapé da campanha.</p>
        <p><strong className="text-[color:var(--color-ink)]">Cookies.</strong> Cookies de marketing (pixels de anúncios) só são ativados mediante seu aceite no aviso exibido na página.</p>
        <p className="text-sm">Observação: este é um modelo inicial. Revise e ajuste o texto com apoio jurídico antes de usar em produção.</p>
      </div>
    </main>
  );
}
