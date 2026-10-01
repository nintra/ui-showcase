<script setup>
import { site } from '../../shared/site.config.js'
</script>

<template>
  <section class="section">
    <div class="container prose">
      <h1>Datenschutzerklärung</h1>
      <p>
        <strong>Vorlage – vor dem Livegang an euer Setup anpassen und rechtlich prüfen lassen.</strong> Sie beschreibt, was diese
        Testseite technisch tatsächlich tut.
      </p>

      <h2>1. Verantwortlicher</h2>
      <p>
        <span class="placeholder">[Name, Anschrift]</span>, E-Mail:
        <a :href="`mailto:${site.contactEmail}`">{{ site.contactEmail }}</a>
      </p>

      <h2>2. Hosting und Server-Logfiles</h2>
      <p>
        Beim Aufruf der Seite verarbeitet unser Hoster <span class="placeholder">[Hoster, Sitz]</span> technisch notwendige Daten
        (z. B. IP-Adresse, Zeitpunkt, aufgerufene Seite, Browser), um die Seite auszuliefern und abzusichern (Art. 6 Abs. 1 lit. f
        DSGVO). <span class="placeholder">[Speicherdauer der Logs ergänzen]</span>
      </p>

      <h2>3. Keine Cookies, anonyme Nutzungsstatistik</h2>
      <p>
        Diese Seite setzt keine Cookies und speichert nichts auf deinem Gerät. Um zu verstehen, ob unser Produkt gefragt ist,
        zählen wir anonym, welche Bereiche genutzt werden (z. B. Seitenaufruf, Klick auf „Vorbestellen“, Nutzung der Vorschau).
        Dabei speichern wir weder IP-Adressen noch Kennungen, die dich wiedererkennen – nur das Ereignis, die Seite und ggf. die
        Kampagnen-Quelle (UTM-Parameter bzw. verweisende Domain). Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.
      </p>

      <h2>4. Foto-Vorschau</h2>
      <p>
        Die Sticker-Vorschau läuft vollständig in deinem Browser. Dein Foto wird dabei nicht an uns oder Dritte übertragen und
        nicht gespeichert.
      </p>

      <h2>5. Warteliste und E-Mails (Brevo)</h2>
      <p>
        Wenn du dich in die Warteliste einträgst, verarbeiten wir deine E-Mail-Adresse, optional deinen Vornamen und deine
        freiwilligen Angaben (Paket, Anlass, Preisvorstellung, Stil, Kampagnen-Quelle), um dich über den Start zu informieren
        (Art. 6 Abs. 1 lit. a DSGVO – Einwilligung). Wir nutzen das Double-Opt-in-Verfahren: Erst nach Klick auf den Link in
        unserer Bestätigungs-E-Mail wirst du eingetragen. Den Zeitpunkt der Bestätigung speichern wir als Nachweis.
      </p>
      <p>
        Für den Versand und die Verwaltung der Kontakte nutzen wir Brevo
        <span class="placeholder">[Anbieter und Anschrift laut Brevo-AVV ergänzen]</span>. Mit Brevo besteht ein Vertrag zur
        Auftragsverarbeitung. Du kannst deine Einwilligung jederzeit widerrufen – über den Abmeldelink in jeder E-Mail oder per
        Nachricht an uns. Danach löschen wir deine Daten, sofern keine Aufbewahrungspflicht besteht.
      </p>
      <p>
        Auf unserem eigenen Server speichern wir zu Statistikzwecken nur ein Pseudonym deiner E-Mail-Adresse (einen mit geheimem
        Schlüssel gebildeten Hash) zusammen mit deinen freiwilligen Angaben – nicht die Adresse selbst.
      </p>

      <h2>6. Deine Rechte</h2>
      <p>
        Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch
        sowie auf Beschwerde bei einer Datenschutz-Aufsichtsbehörde.
      </p>

      <h2>7. Schriftarten</h2>
      <p>Alle Schriftarten werden von unserem eigenen Server geladen. Es findet keine Verbindung zu Google oder anderen Anbietern statt.</p>
    </div>
  </section>
</template>
