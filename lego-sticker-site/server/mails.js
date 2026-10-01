import { site, packages, occasions, priceRanges, styles } from '../shared/site.config.js'

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

function greeting(firstName) {
  return firstName ? `Hallo ${firstName},` : 'Hallo,'
}

function layout({ title, body, publicUrl }) {
  return `<!doctype html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;background:#fff7e6;font-family:Arial,Helvetica,sans-serif;color:#1d1b2f;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff7e6;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;border:2px solid #1d1b2f;">
        <tr><td style="background:#ffc928;border-radius:14px 14px 0 0;padding:20px 28px;font-size:22px;font-weight:bold;">
          ${escapeHtml(site.brand)}
          <span style="font-size:14px;font-weight:normal;"> · ${escapeHtml(site.tagline)}</span>
        </td></tr>
        <tr><td style="padding:28px;font-size:16px;line-height:1.6;">${body}</td></tr>
        <tr><td style="padding:0 28px 24px;font-size:12px;line-height:1.5;color:#6b6880;">
          ${escapeHtml(site.brand)} · <a href="${publicUrl}/impressum" style="color:#6b6880;">Impressum</a> ·
          <a href="${publicUrl}/datenschutz" style="color:#6b6880;">Datenschutz</a><br>
          LEGO® ist eine Marke der LEGO Gruppe, durch die dieses Angebot weder gesponsert noch autorisiert oder unterstützt wird.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function button(href, label) {
  return `<p style="margin:28px 0;"><a href="${href}" style="display:inline-block;background:#e8432e;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 26px;border-radius:12px;border:2px solid #1d1b2f;">${escapeHtml(label)}</a></p>`
}

export function confirmationMail({ firstName, confirmUrl, publicUrl }) {
  const subject = `Bitte bestätige deine E-Mail-Adresse – ${site.brand}`
  const html = layout({
    title: subject,
    publicUrl,
    body: `
      <p>${escapeHtml(greeting(firstName))}</p>
      <p>schön, dass du dich für ${escapeHtml(site.brand)} interessierst! Bitte bestätige mit einem Klick,
      dass wir dir schreiben dürfen, sobald die Sticker bestellbar sind.</p>
      ${button(confirmUrl, 'Ja, ich will dabei sein')}
      <p style="font-size:14px;color:#6b6880;">Der Link ist 7 Tage gültig. Falls du dich nicht selbst eingetragen hast,
      ignoriere diese E-Mail einfach – dann passiert nichts.</p>`,
  })
  const text = `${greeting(firstName)}

schön, dass du dich für ${site.brand} interessierst! Bitte bestätige über diesen Link, dass wir dir schreiben dürfen, sobald die Sticker bestellbar sind:

${confirmUrl}

Der Link ist 7 Tage gültig. Falls du dich nicht selbst eingetragen hast, ignoriere diese E-Mail einfach.`
  return { subject, html, text }
}

export function welcomeMail({ firstName, publicUrl }) {
  const subject = `Du bist auf der Liste! – ${site.brand}`
  const html = layout({
    title: subject,
    publicUrl,
    body: `
      <p>${escapeHtml(greeting(firstName))}</p>
      <p>danke für deine Bestätigung – du stehst jetzt auf unserer Frühbucher-Liste. Sobald es losgeht
      (geplant: ${escapeHtml(site.launchHint)}), erfährst du es als Erste:r und bekommst
      <strong>${site.earlyBirdDiscount}&nbsp;% Rabatt</strong> auf deine erste Bestellung.</p>
      <p><strong>Eine kleine Bitte:</strong> Antworte gern kurz auf diese E-Mail und erzähl uns, für wen oder welchen
      Anlass du die Sticker machen würdest. Das hilft uns enorm, das Produkt richtig zu bauen.</p>
      <p>Bis bald!<br>Dein ${escapeHtml(site.brand)}-Team</p>`,
  })
  const text = `${greeting(firstName)}

danke für deine Bestätigung – du stehst jetzt auf unserer Frühbucher-Liste. Sobald es losgeht (geplant: ${site.launchHint}), erfährst du es als Erste:r und bekommst ${site.earlyBirdDiscount} % Rabatt auf deine erste Bestellung.

Eine kleine Bitte: Antworte gern kurz auf diese E-Mail und erzähl uns, für wen oder welchen Anlass du die Sticker machen würdest.

Bis bald!
Dein ${site.brand}-Team`
  return { subject, html, text }
}

function label(list, id, key = 'label') {
  return list.find((item) => item.id === id)?.[key] ?? 'k. A.'
}

export function notifyMail({ signup, publicUrl }) {
  const rows = [
    ['E-Mail', signup.email],
    ['Vorname', signup.firstName || '–'],
    ['Paket', label(packages, signup.package, 'name')],
    ['Anlass', label(occasions, signup.occasion)],
    ['Preisbereitschaft (Solo)', label(priceRanges, signup.priceRange)],
    ['Stil', label(styles, signup.style, 'name')],
    ['Quelle', signup.source?.utm_source || signup.source?.ref || 'direkt'],
  ]
  const subject = `Neue Anmeldung: ${label(packages, signup.package, 'name')} – ${site.brand}`
  const html = layout({
    title: subject,
    publicUrl,
    body: `<p>Neue bestätigte Anmeldung auf der Warteliste:</p>
      <table cellpadding="6" style="border-collapse:collapse;font-size:15px;">
        ${rows.map(([k, v]) => `<tr><td style="color:#6b6880;">${escapeHtml(k)}</td><td><strong>${escapeHtml(v)}</strong></td></tr>`).join('')}
      </table>
      <p><a href="${publicUrl}/stats">Zur Auswertung</a></p>`,
  })
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n')
  return { subject, html, text }
}
