<script setup>
import { site } from '../../shared/site.config.js'
</script>

<template>
  <section class="section">
    <div class="container prose">
      <h1>Impressum</h1>
      <p><strong>Vorlage – vor dem Livegang ausfüllen und rechtlich prüfen lassen.</strong></p>

      <h2>Angaben gemäß § 5 DDG</h2>
      <p>
        <span class="placeholder">[Vorname Nachname / Firmenname]</span><br />
        <span class="placeholder">[Straße Hausnummer]</span><br />
        <span class="placeholder">[PLZ Ort]</span><br />
        Deutschland
      </p>

      <h2>Kontakt</h2>
      <p>
        E-Mail: <a :href="`mailto:${site.contactEmail}`">{{ site.contactEmail }}</a><br />
        Telefon: <span class="placeholder">[Telefonnummer]</span>
      </p>

      <h2>Umsatzsteuer-ID</h2>
      <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: <span class="placeholder">[falls vorhanden]</span></p>

      <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p><span class="placeholder">[Name, Anschrift]</span></p>

      <h2>Markenhinweis</h2>
      <p>
        LEGO® ist eine Marke der LEGO Gruppe, durch die diese Website weder gesponsert noch autorisiert oder unterstützt wird.
        {{ site.brand }} ist ein unabhängiges Angebot.
      </p>
    </div>
  </section>
</template>
