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

interface ContactNotificationArgs {
  name: string;
  email: string;
  type: 'booking' | 'press' | 'general' | 'suggestion';
  message: string;
  language: 'es' | 'en';
  country: string | null;
}

export function renderContactNotification(args: ContactNotificationArgs): {
  subject: string;
  html: string;
  text: string;
} {
  const labels = {
    booking: 'Booking',
    press: 'Prensa',
    general: 'General',
    suggestion: 'Sugerencia',
  } as const;

  const subject = `[NORAC X · ${labels[args.type]}] ${args.name}`;

  const escapedMsg = escapeHtml(args.message);
  const country = args.country ? ` · ${args.country}` : '';

  const text = `Nuevo mensaje desde noracx.com

Tipo:    ${labels[args.type]}
Nombre:  ${args.name}
Email:   ${args.email}
Lang:    ${args.language}${country}

────────────────────────────────────
${args.message}
────────────────────────────────────

Respondé a este mail para contestarle directamente.`;

  const html = `<!doctype html>
<html lang="es">
  <head><meta charset="utf-8" /></head>
  <body style="margin:0;padding:24px;background:#f4ede0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1c1c1c;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #d4cdb8;">
      <tr>
        <td style="background:#b30707;padding:16px 24px;color:#f4ede0;font-family:Georgia,serif;font-size:14px;letter-spacing:0.2em;text-transform:uppercase;">
          NORAC X · ${labels[args.type]}
        </td>
      </tr>
      <tr>
        <td style="padding:24px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="font-size:14px;line-height:1.6;">
            <tr><td style="padding:4px 0;color:#6a625c;width:90px;">Nombre</td><td style="padding:4px 0;"><strong>${escapeHtml(args.name)}</strong></td></tr>
            <tr><td style="padding:4px 0;color:#6a625c;">Email</td><td style="padding:4px 0;"><a href="mailto:${args.email}" style="color:#b30707;">${escapeHtml(args.email)}</a></td></tr>
            <tr><td style="padding:4px 0;color:#6a625c;">Idioma</td><td style="padding:4px 0;">${args.language}</td></tr>
            ${args.country ? `<tr><td style="padding:4px 0;color:#6a625c;">País</td><td style="padding:4px 0;">${args.country}</td></tr>` : ''}
          </table>
          <hr style="border:none;border-top:1px solid #e8e0d0;margin:20px 0;" />
          <div style="font-size:15px;line-height:1.7;white-space:pre-wrap;">${escapedMsg}</div>
          <hr style="border:none;border-top:1px solid #e8e0d0;margin:20px 0;" />
          <p style="font-size:12px;color:#6a625c;margin:0;">Respondé a este mail para contestarle directamente — el reply-to apunta a ${escapeHtml(args.email)}.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html, text };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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
