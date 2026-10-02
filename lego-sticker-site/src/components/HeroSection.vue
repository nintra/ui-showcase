<script setup>
import { Sparkles, ShieldCheck, Droplets, BadgeCheck } from 'lucide-vue-next'
import MiniFigure from './MiniFigure.vue'
import { site, packages, formatPrice } from '../../shared/site.config.js'
import { openSignup } from '../lib/interest.js'
import { track } from '../lib/track.js'

const perks = [
  { icon: BadgeCheck, text: 'Passt auf Standard-Minifiguren' },
  { icon: Droplets, text: 'Wasserfest & rückstandsfrei ablösbar' },
  { icon: ShieldCheck, text: 'Du gibst jedes Motiv vor dem Druck frei' },
]

const minPrice = formatPrice(Math.min(...packages.map((p) => p.price)))

function signup() {
  track('cta_click', { location: 'hero' })
  openSignup({ location: 'hero' })
}
</script>

<template>
  <section class="hero">
    <div class="container grid">
      <div class="copy">
        <p class="eyebrow"><Sparkles :size="16" aria-hidden="true" /> Bald verfügbar · {{ site.launchHint }}</p>
        <h1>Deine Minifigur. <span class="accent">Dein Gesicht.</span></h1>
        <p class="lead">
          Dein echtes Gesicht als Sticker, der genau auf den Kopf einer Minifigur passt – ganz natürlich, mit Foto-Filter
          oder als Illustration. Für dich, deine Familie, das Brautpaar auf der Torte oder das ganze Team.
        </p>
        <div class="actions">
          <button type="button" class="btn" @click="signup">Kostenlos vormerken</button>
          <RouterLink :to="{ path: '/', hash: '#ausprobieren' }" class="btn btn-secondary" @click="track('cta_click', { location: 'hero-preview' })">
            Mit eigenem Foto testen
          </RouterLink>
        </div>
        <p class="discount">
          <strong>{{ site.earlyBirdDiscount }}&nbsp;% Frühbucher-Rabatt</strong> für alle auf der Warteliste.
        </p>
      </div>

      <div class="visual" aria-hidden="true">
        <div class="plate studs">
          <div class="figs">
            <div class="fig fig-left">
              <MiniFigure hair="long" hair-color="#e0a24a" torso="var(--green)" legs="var(--ink-soft)" face-variant="freckles" face-bg="#f9d3b0" print="heart" />
            </div>
            <div class="fig fig-center">
              <MiniFigure hair="short" hair-color="#3b2a1a" torso="var(--red)" legs="var(--blue)" face-variant="glasses" print="tie" />
            </div>
            <div class="fig fig-right">
              <MiniFigure hair="curly" hair-color="#1d1b2f" torso="var(--blue)" legs="var(--ink-soft)" face-variant="beard" face-bg="#c98d63" print="zip" />
            </div>
          </div>
        </div>
        <div class="tag tag-top">Aus deinem Foto</div>
        <div class="tag tag-bottom">ab {{ minPrice }}</div>
      </div>
    </div>

    <div class="container">
      <ul class="perks">
        <li v-for="perk in perks" :key="perk.text">
          <component :is="perk.icon" :size="22" aria-hidden="true" />
          {{ perk.text }}
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding: clamp(40px, 7vw, 88px) 0 clamp(48px, 7vw, 80px);
}

.grid {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  gap: clamp(32px, 5vw, 64px);
  align-items: center;
}

.accent {
  display: inline-block;
  padding: 0 0.18em;
  margin-left: -0.08em;
  border-radius: 0.2em;
  background: var(--yellow);
  box-shadow: inset 0 -0.08em 0 rgb(0 0 0 / 0.08);
  transform: rotate(-1.5deg);
}

.lead {
  max-width: 34em;
  font-size: clamp(1.1rem, 1.8vw, 1.25rem);
  color: var(--ink-soft);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin: 28px 0 18px;
}

.discount {
  margin: 0;
  color: var(--ink-soft);
}

.visual {
  position: relative;
}

.plate {
  position: relative;
  aspect-ratio: 1 / 0.92;
  border: var(--border);
  border-radius: var(--radius-lg);
  background-color: var(--yellow);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.figs {
  position: absolute;
  inset: 10% 6% 4%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.fig {
  width: 34%;
  margin: 0 -2%;
  animation: bob 4.5s ease-in-out infinite;
}

.fig-center {
  width: 40%;
  z-index: 2;
  animation-delay: -1.5s;
}

.fig-left {
  transform: rotate(-4deg);
  animation-delay: -3s;
}

.fig-right {
  transform: rotate(4deg);
}

@keyframes bob {
  50% {
    translate: 0 -6px;
  }
}

.tag {
  position: absolute;
  padding: 6px 14px;
  border: 2px solid var(--ink);
  border-radius: 999px;
  background: #fff;
  box-shadow: 3px 3px 0 var(--ink);
  font-family: var(--font-display);
  font-weight: 600;
  white-space: nowrap;
}

.tag-top {
  top: -14px;
  left: 8%;
  transform: rotate(-4deg);
}

.tag-bottom {
  bottom: -16px;
  right: 6%;
  background: var(--red);
  color: #fff;
  transform: rotate(3deg);
}

.perks {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin: clamp(48px, 6vw, 72px) 0 0;
  padding: 0;
  list-style: none;
}

.perks li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border: 2px solid var(--ink);
  border-radius: var(--radius);
  background: var(--card);
  font-weight: 700;
}

.perks svg {
  flex: none;
  color: var(--red);
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .visual {
    max-width: 520px;
    width: 100%;
    margin-inline: auto;
  }

  .perks {
    grid-template-columns: 1fr;
  }
}
</style>
