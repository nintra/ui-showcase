<script setup>
import { Check } from 'lucide-vue-next'
import { site, packages, formatPrice } from '../../shared/site.config.js'
import { openSignup } from '../lib/interest.js'
import { track } from '../lib/track.js'

function earlyBird(price) {
  return formatPrice(price * (1 - site.earlyBirdDiscount / 100))
}

function preorder(pkg) {
  track('pricing_click', { pkg: pkg.id })
  openSignup({ location: 'pricing', pkg: pkg.id })
}
</script>

<template>
  <section id="preise" class="section pricing">
    <div class="container">
      <div class="section-head">
        <p class="eyebrow">Preise</p>
        <h2>Wähle dein Paket</h2>
        <p>Jedes Paket enthält deine persönlich gestalteten Sticker auf einem robusten Bogen – inklusive Entwurf zur Freigabe.</p>
      </div>

      <div class="plans">
        <article v-for="pkg in packages" :key="pkg.id" class="card plan" :class="{ highlight: pkg.highlight }">
          <span v-if="pkg.highlight" class="badge">Beliebt</span>
          <h3>{{ pkg.name }}</h3>
          <p class="tagline">{{ pkg.tagline }}</p>
          <p class="price">
            <span class="amount">{{ formatPrice(pkg.price) }}</span>
          </p>
          <p class="early">Frühbucher: <strong>{{ earlyBird(pkg.price) }}</strong></p>
          <ul>
            <li v-for="feature in pkg.features" :key="feature">
              <Check :size="18" aria-hidden="true" /> {{ feature }}
            </li>
          </ul>
          <button type="button" class="btn btn-block" :class="{ 'btn-secondary': !pkg.highlight }" @click="preorder(pkg)">
            Vorbestellen
          </button>
        </article>
      </div>

      <p class="note">
        Geplante Preise inkl. MwSt., zzgl. Versand. Die Bestellung öffnet {{ site.launchHint }} – mit dem Eintrag in die Warteliste
        sicherst du dir {{ site.earlyBirdDiscount }}&nbsp;% Frühbucher-Rabatt. Kostenlos und unverbindlich.
      </p>
    </div>
  </section>
</template>

<style scoped>
.pricing {
  background: var(--paper-deep);
  border-block: 2px solid var(--ink);
}

.plans {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  align-items: stretch;
}

.plan {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 30px 26px 26px;
}

.plan.highlight {
  background: var(--yellow);
  box-shadow: var(--shadow-lg);
  transform: translateY(-8px);
}

.badge {
  position: absolute;
  top: -16px;
  right: 22px;
  padding: 4px 14px;
  border: 2px solid var(--ink);
  border-radius: 999px;
  background: var(--red);
  color: #fff;
  font-family: var(--font-display);
  font-weight: 600;
  transform: rotate(3deg);
}

.plan h3 {
  margin: 0 0 4px;
  font-size: 1.6rem;
}

.tagline {
  color: var(--ink-soft);
  min-height: 3.2em;
  margin-bottom: 8px;
}

.price {
  margin: 0;
}

.amount {
  font-family: var(--font-display);
  font-size: 2.6rem;
  font-weight: 700;
  line-height: 1;
}

.early {
  margin: 6px 0 18px;
  font-size: 0.95rem;
  color: var(--ink-soft);
}

.plan ul {
  display: grid;
  gap: 8px;
  margin: 0 0 24px;
  padding: 18px 0 0;
  border-top: 2px dashed rgb(29 27 47 / 0.25);
  list-style: none;
  flex: 1;
}

.plan li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.plan li svg {
  flex: none;
  color: var(--green);
}

.highlight li svg {
  color: var(--ink);
}

.note {
  max-width: 720px;
  margin: 36px auto 0;
  text-align: center;
  color: var(--ink-soft);
  font-size: 0.95rem;
}

@media (max-width: 900px) {
  .plans {
    grid-template-columns: 1fr;
    max-width: 440px;
    margin-inline: auto;
    gap: 32px;
  }

  .plan.highlight {
    transform: none;
  }
}
</style>
