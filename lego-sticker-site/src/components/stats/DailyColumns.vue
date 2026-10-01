<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

// Column chart of one daily series with a per-column hover/focus tooltip.
const props = defineProps({
  title: { type: String, required: true },
  data: { type: Array, required: true }, // [{ date: 'YYYY-MM-DD', value }]
})

const HEIGHT = 170
const PAD = { top: 12, right: 8, bottom: 26, left: 34 }
const COLOR = '#2f6fde'

const box = ref(null)
const width = ref(600)
const active = ref(-1)
let observer

onMounted(() => {
  observer = new ResizeObserver(([entry]) => (width.value = Math.max(240, entry.contentRect.width)))
  observer.observe(box.value)
})
onBeforeUnmount(() => observer?.disconnect())

function niceMax(value) {
  if (value <= 4) return 4
  const pow = 10 ** Math.floor(Math.log10(value))
  const steps = [1, 2, 2.5, 5, 10]
  return steps.map((s) => s * pow).find((s) => s >= value) ?? 10 * pow
}

const innerW = computed(() => width.value - PAD.left - PAD.right)
const innerH = HEIGHT - PAD.top - PAD.bottom
const yMax = computed(() => niceMax(Math.max(0, ...props.data.map((d) => d.value))))
const slot = computed(() => innerW.value / Math.max(1, props.data.length))
const barW = computed(() => Math.max(2, Math.min(24, slot.value - 2)))
const ticks = computed(() => [0, yMax.value / 2, yMax.value])

function y(value) {
  return PAD.top + innerH - (value / yMax.value) * innerH
}

function columnPath(i, value) {
  if (!value) return ''
  const x = PAD.left + i * slot.value + (slot.value - barW.value) / 2
  const top = y(value)
  const base = PAD.top + innerH
  const r = Math.min(4, base - top, barW.value / 2)
  const w = barW.value
  return `M${x} ${base}V${top + r}Q${x} ${top} ${x + r} ${top}H${x + w - r}Q${x + w} ${top} ${x + w} ${top + r}V${base}Z`
}

function formatDate(iso, long = false) {
  const [yy, mm, dd] = iso.split('-')
  return long ? `${dd}.${mm}.${yy}` : `${dd}.${mm}.`
}

const xLabels = computed(() => {
  const n = props.data.length
  if (!n) return []
  const idx = [...new Set([0, Math.floor((n - 1) / 2), n - 1])]
  return idx.map((i) => ({ x: PAD.left + i * slot.value + slot.value / 2, text: formatDate(props.data[i].date), anchor: i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle' }))
})

const tooltip = computed(() => {
  const d = props.data[active.value]
  if (!d) return null
  const x = PAD.left + active.value * slot.value + slot.value / 2
  return { left: Math.min(Math.max(x, 60), width.value - 60), top: Math.max(y(d.value) - 8, 0), date: formatDate(d.date, true), value: d.value }
})

function onMove(event) {
  const rect = event.currentTarget.getBoundingClientRect()
  const i = Math.floor((event.clientX - rect.left - PAD.left) / slot.value)
  active.value = i >= 0 && i < props.data.length ? i : -1
}

function onKey(event) {
  const n = props.data.length
  if (event.key === 'ArrowRight') active.value = Math.min(n - 1, active.value + 1)
  else if (event.key === 'ArrowLeft') active.value = Math.max(0, active.value < 0 ? n - 1 : active.value - 1)
  else return
  event.preventDefault()
}
</script>

<template>
  <figure class="daily">
    <figcaption>{{ title }}</figcaption>
    <div ref="box" class="plot">
      <svg
        :width="width"
        :height="HEIGHT"
        tabindex="0"
        role="img"
        :aria-label="`${title}, Tageswerte. Mit Pfeiltasten durch die Tage gehen.`"
        @pointermove="onMove"
        @pointerleave="active = -1"
        @focus="active = data.length - 1"
        @blur="active = -1"
        @keydown="onKey"
      >
        <g class="grid">
          <line v-for="t in ticks" :key="t" :x1="PAD.left" :x2="width - PAD.right" :y1="y(t)" :y2="y(t)" />
        </g>
        <g class="y-labels">
          <text v-for="t in ticks" :key="t" :x="PAD.left - 8" :y="y(t)" dy="0.32em" text-anchor="end">{{ t.toLocaleString('de-DE') }}</text>
        </g>
        <path
          v-for="(d, i) in data"
          :key="d.date"
          :d="columnPath(i, d.value)"
          :fill="COLOR"
          :opacity="active === -1 || active === i ? 1 : 0.45"
        />
        <line v-if="active >= 0" class="hover-line" :x1="PAD.left + active * slot + slot / 2" :x2="PAD.left + active * slot + slot / 2" :y1="PAD.top" :y2="PAD.top + innerH" />
        <g class="x-labels">
          <text v-for="l in xLabels" :key="l.text" :x="l.x" :y="HEIGHT - 6" :text-anchor="l.anchor">{{ l.text }}</text>
        </g>
      </svg>
      <div v-if="tooltip" class="tooltip" :style="{ left: `${tooltip.left}px`, top: `${tooltip.top}px` }" aria-live="polite">
        <strong>{{ tooltip.value.toLocaleString('de-DE') }}</strong>
        <span>{{ tooltip.date }}</span>
      </div>
    </div>
  </figure>
</template>

<style scoped>
.daily {
  margin: 0;
}

figcaption {
  font-weight: 800;
  margin-bottom: 8px;
}

.plot {
  position: relative;
  width: 100%;
}

svg {
  display: block;
  overflow: visible;
}

svg:focus-visible {
  outline: 3px solid var(--blue);
  outline-offset: 4px;
}

.grid line {
  stroke: #e9e7ef;
  stroke-width: 1;
}

.y-labels text,
.x-labels text {
  fill: var(--muted);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}

.hover-line {
  stroke: var(--ink);
  stroke-width: 1;
  opacity: 0.25;
}

.tooltip {
  position: absolute;
  transform: translate(-50%, -100%);
  display: grid;
  gap: 0;
  padding: 6px 10px;
  border: 1.5px solid var(--ink);
  border-radius: 8px;
  background: #fff;
  box-shadow: 2px 2px 0 var(--ink);
  font-size: 0.85rem;
  line-height: 1.3;
  pointer-events: none;
  white-space: nowrap;
  text-align: center;
}

.tooltip strong {
  font-size: 1rem;
}

.tooltip span {
  color: var(--muted);
}
</style>
