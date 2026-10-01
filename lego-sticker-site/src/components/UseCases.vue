<script setup>
import { Gift, Heart, House, Briefcase } from 'lucide-vue-next'

const cases = [
  { icon: Gift, title: 'Als Geschenk', text: 'Papa als Feuerwehrmann, Oma als Astronautin – das persönlichste Mini-Geschenk überhaupt.', color: 'var(--pink-soft)' },
  { icon: Heart, title: 'Zur Hochzeit', text: 'Das Brautpaar als Tortenfigur oder jeder Gast als Figur am Platz – ein Gastgeschenk, das bleibt.', color: 'var(--yellow-soft)' },
  { icon: House, title: 'Für die Familie', text: 'Die ganze Familie im Kinderzimmer-Regal. Kinder lieben es, sich selbst als Figur zu bauen.', color: 'var(--green-soft)' },
  { icon: Briefcase, title: 'Fürs Team', text: 'Team-Event, Abschiedsgeschenk oder Messe-Giveaway – mit echten Gesichtern statt Logo-Kuli.', color: 'var(--blue-soft)' },
]
</script>

<template>
  <section class="section">
    <div class="container">
      <div class="section-head">
        <p class="eyebrow">Für jeden Anlass</p>
        <h2>Kleine Figur, große Freude</h2>
      </div>
      <ul class="cases">
        <li v-for="c in cases" :key="c.title" class="card case" :style="{ background: c.color }">
          <component :is="c.icon" :size="30" aria-hidden="true" />
          <h3>{{ c.title }}</h3>
          <p>{{ c.text }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.cases {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.case {
  padding: 24px 22px;
}

.case h3 {
  margin: 14px 0 8px;
}

.case p {
  margin: 0;
  color: var(--ink-soft);
}

@media (max-width: 980px) {
  .cases {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .cases {
    grid-template-columns: 1fr;
  }
}
</style>
