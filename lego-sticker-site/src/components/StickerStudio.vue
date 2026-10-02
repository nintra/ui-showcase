<script setup>
import { ref, shallowRef, watch, computed, onBeforeUnmount } from 'vue'
import { ImagePlus, Lock, Move, RefreshCw } from 'lucide-vue-next'
import MiniFigure from './MiniFigure.vue'
import { styles, styleGroups } from '../../shared/site.config.js'
import { loadPhoto, cropSquare, renderSticker } from '../lib/stylize.js'
import { interest, openSignup } from '../lib/interest.js'
import { track } from '../lib/track.js'

const CROP_SIZE = 240

const photo = shallowRef(null)
const style = ref(styles[0].id)
const strength = ref(100) // filter strength in percent
const zoom = ref(1.2)
const pan = ref({ x: 0, y: 0 })
const sticker = ref('')
const thumbs = ref({})
const error = ref('')
const loading = ref(false)
const dragging = ref(false)
const fileInput = ref(null)
const cropCanvas = ref(null)
let uploaded = false

const hasPhoto = computed(() => Boolean(photo.value))
const groups = styleGroups.map((g) => ({ ...g, styles: styles.filter((s) => s.group === g.id) }))
const current = computed(() => styles.find((s) => s.id === style.value))

async function onFile(file) {
  if (!file) return
  error.value = ''
  if (!file.type.startsWith('image/')) {
    error.value = 'Bitte wähle eine Bilddatei (JPG, PNG oder WebP).'
    return
  }
  loading.value = true
  try {
    photo.value = await loadPhoto(file)
    zoom.value = 1.2
    pan.value = { x: 0, y: -0.3 } // portraits usually have the face in the upper half
    interest.style = style.value
    if (!uploaded) {
      uploaded = true
      track('preview_upload')
    }
  } catch {
    error.value = 'Dieses Bild können wir leider nicht lesen. Probier es mit einem JPG oder PNG.'
  } finally {
    loading.value = false
  }
}

function onInput(event) {
  onFile(event.target.files?.[0])
  event.target.value = ''
}

function onDrop(event) {
  dragging.value = false
  onFile(event.dataTransfer?.files?.[0])
}

function chooseStyle(id) {
  style.value = id
  interest.style = id
  track('style_select', { style: id })
}

// --- rendering (throttled to one frame) ---
let frame = 0
function scheduleRender() {
  if (frame) return
  frame = requestAnimationFrame(() => {
    frame = 0
    render()
  })
}

function render() {
  const source = photo.value
  if (!source) return
  const view = { zoom: zoom.value, panX: pan.value.x, panY: pan.value.y }
  const canvas = cropCanvas.value
  if (canvas) {
    const crop = cropSquare(source, view, CROP_SIZE * 2)
    canvas.getContext('2d').drawImage(crop, 0, 0, canvas.width, canvas.height)
  }
  sticker.value = renderSticker(source, { ...view, style: style.value, strength: strength.value / 100, size: 256 })
}

function renderThumbs() {
  const source = photo.value
  if (!source) return
  const view = { zoom: zoom.value, panX: pan.value.x, panY: pan.value.y, size: 96 }
  thumbs.value = Object.fromEntries(styles.map((s) => [s.id, renderSticker(source, { ...view, style: s.id })]))
}

watch([photo, zoom, pan, style, strength], scheduleRender)
// Thumbnails only need refreshing when the crop settles, not on every drag frame.
let thumbTimer = 0
watch([photo, zoom, pan], () => {
  clearTimeout(thumbTimer)
  thumbTimer = setTimeout(renderThumbs, 160)
})
// The crop canvas mounts after the first photo is loaded.
watch(cropCanvas, scheduleRender)

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  clearTimeout(thumbTimer)
})

// --- drag to move the crop ---
let dragStart = null
function onPointerDown(event) {
  if (!photo.value) return
  event.currentTarget.setPointerCapture(event.pointerId)
  dragStart = { x: event.clientX, y: event.clientY, pan: { ...pan.value } }
}

function onPointerMove(event) {
  if (!dragStart) return
  const source = photo.value
  const box = event.currentTarget.getBoundingClientRect().width
  const side = Math.min(source.width, source.height) / zoom.value
  const maxX = (source.width - side) / 2
  const maxY = (source.height - side) / 2
  const perPx = side / box
  const clamp = (v) => Math.max(-1, Math.min(1, v))
  pan.value = {
    x: maxX > 0 ? clamp(dragStart.pan.x - ((event.clientX - dragStart.x) * perPx) / maxX) : 0,
    y: maxY > 0 ? clamp(dragStart.pan.y - ((event.clientY - dragStart.y) * perPx) / maxY) : 0,
  }
}

function onPointerUp() {
  dragStart = null
}

function onKeyMove(event) {
  const step = 0.08
  const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
  const move = moves[event.key]
  if (!move) return
  event.preventDefault()
  const clamp = (v) => Math.max(-1, Math.min(1, v))
  pan.value = { x: clamp(pan.value.x + move[0]), y: clamp(pan.value.y + move[1]) }
}

function reserve() {
  interest.style = style.value
  track('cta_click', { location: 'preview' })
  openSignup({ location: 'preview' })
}
</script>

<template>
  <div class="studio">
    <div class="controls card">
      <div
        v-if="!hasPhoto"
        class="dropzone"
        :class="{ dragging }"
        @dragover.prevent="dragging = true"
        @dragleave="dragging = false"
        @drop.prevent="onDrop"
      >
        <ImagePlus :size="40" aria-hidden="true" />
        <p class="drop-title">Lade ein Foto hoch</p>
        <p class="drop-hint">Am besten ein Porträt von vorne, gut beleuchtet – oder zieh es einfach hierher.</p>
        <button type="button" class="btn btn-yellow" :disabled="loading" @click="fileInput.click()">
          {{ loading ? 'Wird geladen …' : 'Foto auswählen' }}
        </button>
      </div>

      <div v-else class="editor">
        <div class="editor-head">
          <h3>1. Ausschnitt wählen</h3>
          <button type="button" class="link-btn" @click="fileInput.click()">
            <RefreshCw :size="16" aria-hidden="true" /> Anderes Foto
          </button>
        </div>
        <div
          class="crop"
          tabindex="0"
          role="application"
          aria-label="Bildausschnitt. Mit Maus, Finger oder Pfeiltasten verschieben."
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
          @keydown="onKeyMove"
        >
          <canvas ref="cropCanvas" :width="CROP_SIZE * 2" :height="CROP_SIZE * 2" />
          <div class="crop-guide" aria-hidden="true" />
          <span class="crop-hint"><Move :size="14" aria-hidden="true" /> Verschieben</span>
        </div>
        <label class="zoom">
          <span>Zoom</span>
          <input v-model.number="zoom" type="range" min="1" max="3" step="0.01" />
        </label>

        <h3>2. Look wählen</h3>
        <div v-for="group in groups" :key="group.id" class="style-group">
          <p :id="`style-group-${group.id}`" class="group-name">{{ group.name }}</p>
          <div class="styles" role="radiogroup" :aria-labelledby="`style-group-${group.id}`">
            <button
              v-for="s in group.styles"
              :key="s.id"
              type="button"
              role="radio"
              class="style-option"
              :aria-checked="style === s.id"
              @click="chooseStyle(s.id)"
            >
              <img v-if="thumbs[s.id]" :src="thumbs[s.id]" alt="" width="56" height="56" />
              <span class="style-name">{{ s.name }}</span>
            </button>
          </div>
        </div>
        <p class="style-desc">{{ current?.description }}</p>
        <label v-if="style !== 'original'" class="strength">
          <span>Filterstärke</span>
          <input v-model.number="strength" type="range" min="0" max="100" step="1" />
          <output>{{ strength }}&nbsp;%</output>
        </label>
      </div>

      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <p class="privacy">
        <Lock :size="16" aria-hidden="true" />
        Dein Foto bleibt auf deinem Gerät – die Vorschau entsteht direkt in deinem Browser, nichts wird hochgeladen.
      </p>
      <input ref="fileInput" class="visually-hidden" type="file" accept="image/*" tabindex="-1" @change="onInput" />
    </div>

    <div class="stage studs" aria-live="polite">
      <div class="figure-wrap">
        <MiniFigure
          :face="sticker"
          face-variant="smile"
          hair="none"
          torso="var(--blue)"
          legs="var(--ink-soft)"
          print="star"
          :label="hasPhoto ? 'Vorschau: deine Minifigur mit Gesichtssticker' : 'Beispiel-Minifigur'"
        />
      </div>
      <div class="sheet" aria-hidden="true">
        <span class="sheet-label">Dein Sticker-Bogen</span>
        <div class="sheet-grid">
          <div v-for="n in 6" :key="n" class="sheet-sticker">
            <img v-if="sticker" :src="sticker" alt="" />
          </div>
        </div>
      </div>
      <button v-if="hasPhoto" type="button" class="btn reserve" @click="reserve">Gefällt mir – vormerken</button>
      <p v-else class="stage-hint">Lade ein Foto hoch und sieh sofort, wie dein Sticker aussieht.</p>
    </div>
  </div>
</template>

<style scoped>
.studio {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: clamp(20px, 3vw, 36px);
  align-items: stretch;
}

.controls {
  display: flex;
  flex-direction: column;
  padding: clamp(20px, 3vw, 32px);
}

.dropzone {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 340px;
  padding: 24px;
  border: 3px dashed var(--ink);
  border-radius: var(--radius);
  background: var(--paper);
  text-align: center;
  transition: background-color 0.15s ease;
}

.dropzone.dragging {
  background: var(--yellow-soft);
}

.drop-title {
  margin: 10px 0 0;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.35rem;
}

.drop-hint {
  color: var(--muted);
  margin-bottom: 16px;
}

.editor h3 {
  font-size: 1.1rem;
  margin: 0 0 12px;
}

.editor-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}

.link-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  border: 0;
  background: none;
  color: var(--blue);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.crop {
  position: relative;
  width: min(100%, 240px);
  aspect-ratio: 1;
  margin: 0 auto;
  overflow: hidden;
  border: var(--border);
  border-radius: var(--radius);
  touch-action: none;
  cursor: grab;
  user-select: none;
}

.crop:active {
  cursor: grabbing;
}

.crop canvas {
  width: 100%;
  height: 100%;
}

/* Shows which part ends up on the sticker (same shape as on the minifigure head). */
.crop-guide {
  position: absolute;
  inset: 4%;
  border: 2px dashed #fff;
  border-radius: 26%;
  box-shadow: 0 0 0 999px rgb(29 27 47 / 0.35);
  pointer-events: none;
}

.crop-hint {
  position: absolute;
  left: 50%;
  bottom: 8px;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: 999px;
  background: rgb(29 27 47 / 0.75);
  color: #fff;
  font-size: 0.8rem;
  font-weight: 700;
  pointer-events: none;
}

.zoom {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 240px;
  margin: 14px auto 24px;
  font-weight: 700;
}

.zoom input {
  flex: 1;
  accent-color: var(--red);
}

.style-group + .style-group {
  margin-top: 14px;
}

.group-name {
  margin: 0 0 8px;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}

.styles {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.style-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 6px;
  border: 2px solid var(--ink);
  border-radius: 14px;
  background: var(--card);
  font: inherit;
  cursor: pointer;
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease;
}

.style-option img {
  width: 56px;
  height: 56px;
  border-radius: 26%;
  border: 2px solid var(--ink);
}

.style-option[aria-checked='true'] {
  background: var(--yellow-soft);
  box-shadow: var(--shadow);
  transform: translate(-2px, -2px);
}

.style-name {
  font-family: var(--font-display);
  font-weight: 600;
}

.style-desc {
  margin: 14px 0 0;
  color: var(--muted);
  font-size: 0.95rem;
  min-height: 3em;
}

.strength {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
  font-weight: 700;
}

.strength input {
  flex: 1;
  accent-color: var(--red);
}

.strength output {
  min-width: 3.2em;
  text-align: right;
  font-variant-numeric: tabular-nums;
  color: var(--ink-soft);
}

.error {
  margin: 12px 0 0;
  padding: 10px 14px;
  border-radius: 12px;
  background: var(--pink-soft);
  font-weight: 700;
}

.privacy {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin: 16px 0 0;
  color: var(--ink-soft);
  font-size: 0.9rem;
}

.privacy svg {
  flex: none;
  margin-top: 3px;
  color: var(--green);
}

.stage {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: clamp(24px, 4vw, 40px);
  border: var(--border);
  border-radius: var(--radius-lg);
  background-color: var(--yellow);
  box-shadow: var(--shadow);
}

.figure-wrap {
  width: min(70%, 270px);
}

.sheet {
  width: min(100%, 300px);
  padding: 10px 12px 12px;
  border: 2px solid var(--ink);
  border-radius: 12px;
  background: #fff;
  transform: rotate(-2deg);
  box-shadow: 3px 3px 0 var(--ink);
}

.sheet-label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}

.sheet-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
}

.sheet-sticker {
  aspect-ratio: 68 / 62;
  border-radius: 28%;
  border: 1.5px dashed var(--muted);
  overflow: hidden;
  background: var(--paper);
}

.sheet-sticker img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.stage-hint {
  margin: 0;
  font-weight: 700;
  text-align: center;
}

@media (max-width: 820px) {
  .studio {
    grid-template-columns: 1fr;
  }

  .dropzone {
    min-height: 260px;
  }
}
</style>
