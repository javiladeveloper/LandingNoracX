/**
 * Cliente mínimo de Resend usando fetch directo (sin SDK).
 * El SDK oficial de Resend pesa más y no aporta nada que no podamos hacer
 * con fetch en el Worker.
 */

interface SendArgs {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendEmail(args: SendArgs): Promise<{ ok: boolean; id?: string; error?: string }> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${args.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: args.from,
      to: args.to,
      subject: args.subject,
      html: args.html,
      text: args.text,
      reply_to: args.replyTo,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error('[resend] send failed', res.status, errBody);
    return { ok: false, error: errBody };
  }

  const data = (await res.json()) as { id: string };
  return { ok: true, id: data.id };
}

type Lang = 'es' | 'en';

interface WelcomeArgs {
  email: string;
  lang: Lang;
}

export function renderWelcomeEmail({ email: _email, lang }: WelcomeArgs): { subject: string; html: string; text: string } {
  if (lang === 'en') {
    return {
      subject: 'Welcome to the roar — NORAC X',
      html: welcomeHtml('en'),
      text: welcomeText('en'),
    };
  }
  return {
    subject: 'Gracias por unirte al grito — NORAC X',
    html: welcomeHtml('es'),
    text: welcomeText('es'),
  };
}

function welcomeHtml(lang: Lang): string {
  const t = lang === 'en' ? CONTENT.en : CONTENT.es;
  return `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${t.subject}</title>
  </head>
  <body style="margin:0;padding:0;background:#000000;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#b8b0a8;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#000000;padding:40px 20px;">
      <tr>
        <td align="center">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:560px;background:#0a0a0a;border:1px solid rgba(179,7,7,0.3);">
            <tr>
              <td style="padding:48px 32px 16px;text-align:center;">
                <div style="display:inline-block;height:8px;width:8px;background:#e60a0a;box-shadow:0 0 10px #e60a0a;margin-bottom:24px;"></div>
                <h1 style="margin:0;font-size:36px;letter-spacing:-0.02em;color:#f4ede0;font-weight:900;font-family:Georgia,serif;">
                  NORAC <span style="color:#e60a0a;font-style:italic;">X</span>
                </h1>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 32px;">
                <p style="margin:0 0 16px;font-size:18px;line-height:1.5;color:#f4ede0;">${t.greeting}</p>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#b8b0a8;">${t.body1}</p>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#b8b0a8;">${t.body2}</p>
              </td>
            </tr>

            <tr>
              <td style="padding:0 32px 32px;text-align:center;">
                <a href="https://noracx.com" style="display:inline-block;padding:14px 28px;background:#b30707;color:#f4ede0;text-decoration:none;font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;font-weight:700;border:1px solid #e60a0a;">
                  ${t.cta}
                </a>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 32px;border-top:1px solid rgba(179,7,7,0.2);text-align:center;">
                <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#6a625c;font-family:'Courier New',monospace;">
                  ${t.tag}
                </p>
                <p style="margin:0;font-size:10px;color:#6a625c;">
                  ${t.unsubscribe}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function welcomeText(lang: Lang): string {
  const t = lang === 'en' ? CONTENT.en : CONTENT.es;
  return `${t.greeting}\n\n${t.body1}\n\n${t.body2}\n\n→ ${t.cta}: https://noracx.com\n\n--\nNORAC X — ${t.tag}\n${t.unsubscribe}`;
}

const CONTENT = {
  es: {
    subject: 'Gracias por unirte al grito',
    greeting: 'Bienvenido al grito.',
    body1:
      'Acabás de sumarte a la lista de NORAC X. Vas a recibir cada lanzamiento, letras inéditas, videos exclusivos y novedades del proyecto antes que en redes.',
    body2:
      'Sin spam. Sin ruido. Solo el próximo grito cuando esté listo. Si en algún momento querés bajarte, hay un link al final de cada email.',
    cta: 'Escuchar ahora',
    tag: 'Metal peruano con mensaje',
    unsubscribe: 'Te suscribiste desde noracx.com. Si fue por error, ignorá este mail.',
  },
  en: {
    subject: 'Welcome to the roar',
    greeting: 'Welcome to the roar.',
    body1:
      "You're now on the NORAC X list. You'll get every release, unreleased lyrics, exclusive videos and project news before they hit social media.",
    body2:
      'No spam. No noise. Just the next roar when it lands. If you ever want out, every email has an unsubscribe link.',
    cta: 'Listen now',
    tag: 'Peruvian metal with a message',
    unsubscribe: "You subscribed from noracx.com. If this wasn't you, just ignore this email.",
  },
} as const;
