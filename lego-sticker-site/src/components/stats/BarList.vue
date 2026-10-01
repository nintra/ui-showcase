<script setup>
import { computed } from 'vue'

// Horizontal bar list for a single series: label, bar, value (+ share) at the tip.
const props = defineProps({
  title: { type: String, required: true },
  items: { type: Array, required: true }, // [{ label, value }]
  // Share is computed against this total (defaults to the sum of all items).
  total: { type: Number, default: undefined },
  empty: { type: String, default: 'Noch keine Daten.' },
})

const max = computed(() => Math.max(1, ...props.items.map((i) => i.value)))
const sum = computed(() => props.total ?? props.items.reduce((acc, i) => acc + i.value, 0))

function share(value) {
  return sum.value ? `${Math.round((value / sum.value) * 100)} %` : '–'
}
</script>

<template>
  <section class="bar-list">
    <h3>{{ title }}</h3>
    <p v-if="!items.length" class="empty">{{ empty }}</p>
    <ul v-else>
      <li v-for="item in items" :key="item.label" tabindex="0" :aria-label="`${item.label}: ${item.value} (${share(item.value)})`">
        <span class="label">{{ item.label }}</span>
        <span class="track">
          <span class="bar" :style="{ width: `calc((100% - 100px) * ${item.value / max})` }" />
          <span class="value"><strong>{{ item.value.toLocaleString('de-DE') }}</strong> · {{ share(item.value) }}</span>
        </span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
h3 {
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 800;
  margin: 0 0 14px;
}

ul {
  display: grid;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}

li {
  display: grid;
  grid-template-columns: minmax(90px, 34%) 1fr;
  align-items: center;
  gap: 12px;
  padding: 5px 6px;
  border-radius: 8px;
}

li:hover,
li:focus-visible {
  background: #f4f2fa;
}

.label {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--ink-soft);
  overflow-wrap: anywhere;
}

.track {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.bar {
  flex: none;
  min-width: 2px;
  height: 14px;
  border-radius: 0 4px 4px 0;
  background: #2f6fde;
}

.value {
  flex: none;
  font-size: 0.88rem;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.value strong {
  color: var(--ink);
}

.empty {
  margin: 0;
  color: var(--muted);
  font-size: 0.92rem;
}
</style>
