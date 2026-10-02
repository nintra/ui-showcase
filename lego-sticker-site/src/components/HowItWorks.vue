<script setup>
import { Camera, Palette, Package } from 'lucide-vue-next'

const steps = [
  {
    icon: Camera,
    title: 'Foto hochladen',
    text: 'Ein gut beleuchtetes Porträt von vorne reicht. Gern auch mehrere Personen – jede bekommt ihren eigenen Sticker.',
    color: 'var(--yellow)',
  },
  {
    icon: Palette,
    title: 'Look wählen',
    text: 'Echtes Foto – natürlich oder mit Filter wie Warm, S/W oder Vintage – oder illustriert als Klassik, Comic oder Pop-Art. Du siehst jeden Entwurf vorab und gibst ihn frei.',
    color: 'var(--blue-soft)',
  },
  {
    icon: Package,
    title: 'Aufkleben & staunen',
    text: 'Dein Stickerbogen kommt per Post. Aufkleben, fertig – und jederzeit rückstandsfrei wieder ablösbar.',
    color: 'var(--green-soft)',
  },
]
</script>

<template>
  <section id="so-gehts" class="section how">
    <div class="container">
      <div class="section-head">
        <p class="eyebrow">So geht's</p>
        <h2>In drei Schritten zur Mini-Version von dir</h2>
      </div>
      <ol class="steps">
        <li v-for="(step, i) in steps" :key="step.title" class="card step">
          <span class="num" :style="{ background: step.color }">{{ i + 1 }}</span>
          <component :is="step.icon" class="icon" :size="30" aria-hidden="true" />
          <h3>{{ step.title }}</h3>
          <p>{{ step.text }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.how {
  background: var(--card);
  border-block: 2px solid var(--ink);
}

.steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: none;
}

.step {
  position: relative;
  padding: 36px 26px 22px;
  background: var(--paper);
}

.num {
  position: absolute;
  top: -22px;
  left: 22px;
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border: var(--border);
  border-radius: 50%;
  box-shadow: inset 0 -4px 0 rgb(0 0 0 / 0.12);
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 700;
}

.icon {
  position: absolute;
  top: 20px;
  right: 22px;
  color: var(--muted);
}

.step h3 {
  margin-top: 6px;
}

.step p {
  margin: 0;
  color: var(--ink-soft);
}

@media (max-width: 820px) {
  .steps {
    grid-template-columns: 1fr;
    gap: 36px;
  }
}
</style>
