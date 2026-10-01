import { BrevoClient, BrevoError } from '@getbrevo/brevo'

// Thin wrapper around the Brevo SDK. Contact attributes used here are created
// by `npm run brevo:setup`.

export function createBrevo({ apiKey, listId, senderEmail, senderName }) {
  const enabled = Boolean(apiKey && listId && senderEmail)
  const client = apiKey ? new BrevoClient({ apiKey, timeoutInSeconds: 15, maxRetries: 2 }) : null

  async function sendMail({ to, subject, html, text, tags = [], replyTo }) {
    await client.transactionalEmails.sendTransacEmail({
      sender: { email: senderEmail, name: senderName || undefined },
      to: [to],
      replyTo,
      subject,
      htmlContent: html,
      textContent: text,
      tags,
    })
  }

  async function upsertContact({ email, attributes }) {
    const request = { email, listIds: [listId], updateEnabled: true }
    try {
      await client.contacts.createContact({ ...request, attributes })
    } catch (err) {
      // Never lose a confirmed signup because of an attribute that is missing or
      // has the wrong type in the Brevo account – retry with the bare address.
      if (err instanceof BrevoError && err.statusCode === 400 && attributes) {
        console.warn('[brevo] Kontakt mit Attributen abgelehnt, speichere ohne Attribute:', describeError(err))
        await client.contacts.createContact(request)
        return
      }
      throw err
    }
  }

  return { enabled, client, sendMail, upsertContact }
}

export function describeError(err) {
  if (err instanceof BrevoError) {
    const body = typeof err.body === 'object' ? JSON.stringify(err.body) : err.body
    return `${err.statusCode ?? '?'} ${body ?? err.message}`
  }
  return err?.message ?? String(err)
}
