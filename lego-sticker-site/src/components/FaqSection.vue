<script setup>
import { site } from '../../shared/site.config.js'
import { track } from '../lib/track.js'

const faqs = [
  {
    q: 'Passen die Sticker auf LEGO®-Minifiguren?',
    a: 'Ja. Die Sticker sind für den Kopf von Standard-Minifiguren gemacht – also LEGO® und kompatible Figuren mit dem gleichen Maß. Die Figuren selbst sind nicht enthalten.',
  },
  {
    q: 'Wie wird aus meinem Foto ein Sticker?',
    a: 'Du entscheidest: als echtes Foto – natürlich oder mit Filter wie Leuchtend, Warm, S/W oder Vintage – oder als Illustration im Klassik-, Comic- oder Pop-Art-Stil. Wir optimieren das Motiv für die kleine Fläche, damit dein Gesicht auch auf 1 cm gut erkennbar bleibt. Vor dem Druck bekommst du einen Entwurf zur Freigabe.',
  },
  {
    q: 'Was passiert mit meinem Foto?',
    a: 'Bei der Vorschau auf dieser Seite: gar nichts. Sie läuft komplett in deinem Browser, das Foto wird nicht hochgeladen. Bei einer echten Bestellung verwenden wir dein Foto nur für deinen Auftrag und löschen es danach.',
  },
  {
    q: 'Lassen sich die Sticker wieder ablösen?',
    a: 'Ja. Die Sticker lassen sich rückstandsfrei ablösen – deine Figur bleibt unversehrt und kann jederzeit wieder ihr Originalgesicht tragen.',
  },
  {
    q: 'Wann kann ich bestellen?',
    a: `Wir planen den Start für ${site.launchHint}. Wer auf der Warteliste steht, erfährt es zuerst und bekommt ${site.earlyBirdDiscount} % Frühbucher-Rabatt.`,
  },
  {
    q: 'Kostet der Eintrag in die Warteliste etwas?',
    a: 'Nein. Der Eintrag ist kostenlos und unverbindlich – du bestellst damit nichts und kannst dich jederzeit mit einem Klick wieder abmelden.',
  },
  {
    q: 'Ist das ein offizielles LEGO®-Produkt?',
    a: `Nein. ${site.brand} ist ein unabhängiges Angebot und steht in keiner Verbindung zur LEGO Gruppe.`,
  },
]

function onToggle(event, index) {
  if (event.target.open) track('faq_open', { faq: String(index + 1) })
}
</script>

<template>
  <section id="faq" class="section">
    <div class="container narrow">
      <div class="section-head">
        <p class="eyebrow">FAQ</p>
        <h2>Häufige Fragen</h2>
      </div>
      <div class="faqs">
        <details v-for="(faq, i) in faqs" :key="faq.q" class="card faq" @toggle="onToggle($event, i)">
          <summary>{{ faq.q }}</summary>
          <p>{{ faq.a }}</p>
        </details>
      </div>
    </div>
  </section>
</template>

<style scoped>
.narrow {
  max-width: calc(800px + 2 * var(--gutter));
}

.faqs {
  display: grid;
  gap: 14px;
}

.faq {
  box-shadow: 3px 3px 0 var(--ink);
  overflow: hidden;
}

summary {
  position: relative;
  padding: 18px 56px 18px 22px;
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 600;
  list-style: none;
  cursor: pointer;
}

summary::-webkit-details-marker {
  display: none;
}

summary::after {
  content: '+';
  position: absolute;
  top: 50%;
  right: 18px;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: 2px solid var(--ink);
  border-radius: 50%;
  background: var(--yellow);
  font-size: 1.2rem;
  line-height: 1;
  transform: translateY(-50%);
  transition: transform 0.2s ease;
}

.faq[open] summary::after {
  transform: translateY(-50%) rotate(45deg);
}

.faq p {
  margin: 0;
  padding: 0 22px 20px;
  color: var(--ink-soft);
}
</style>
