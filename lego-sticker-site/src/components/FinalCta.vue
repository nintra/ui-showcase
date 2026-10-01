<script setup>
import { BadgePercent, Rocket, MailX } from 'lucide-vue-next'
import SignupForm from './SignupForm.vue'
import { site } from '../../shared/site.config.js'

const benefits = [
  { icon: BadgePercent, text: `${site.earlyBirdDiscount} % Frühbucher-Rabatt auf deine erste Bestellung` },
  { icon: Rocket, text: 'Du erfährst als Erste:r, wann es losgeht' },
  { icon: MailX, text: 'Kein Spam – und jederzeit abmeldbar' },
]
</script>

<template>
  <section id="vormerken" class="section final studs">
    <div class="container grid">
      <div class="copy">
        <p class="eyebrow">Warteliste</p>
        <h2>Sei bei den Ersten, die ihre Mini-Version bekommen.</h2>
        <ul>
          <li v-for="b in benefits" :key="b.text">
            <component :is="b.icon" :size="24" aria-hidden="true" />
            {{ b.text }}
          </li>
        </ul>
      </div>
      <div class="card form-card">
        <SignupForm location="final" submit-label="Auf die Warteliste" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.final {
  background-color: var(--yellow);
  border-top: 2px solid var(--ink);
}

.grid {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: clamp(28px, 5vw, 64px);
  align-items: center;
}

.copy ul {
  display: grid;
  gap: 14px;
  margin: 24px 0 0;
  padding: 0;
  list-style: none;
}

.copy li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.1rem;
  font-weight: 700;
}

.copy li svg {
  flex: none;
}

.form-card {
  padding: clamp(22px, 4vw, 34px);
  box-shadow: var(--shadow-lg);
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
