<script setup>
import { ref, watch, computed } from 'vue'
import { X } from 'lucide-vue-next'
import SignupForm from './SignupForm.vue'
import { site, packages, formatPrice } from '../../shared/site.config.js'
import { interest } from '../lib/interest.js'

const dialog = ref(null)

const selected = computed(() => packages.find((p) => p.id === interest.package))

watch(
  () => interest.dialogOpen,
  (open) => {
    if (!dialog.value) return
    if (open && !dialog.value.open) {
      dialog.value.showModal()
    } else if (!open && dialog.value.open) {
      dialog.value.close()
    }
  },
)

function onClose() {
  interest.dialogOpen = false
}

function onBackdrop(event) {
  if (event.target === dialog.value) dialog.value.close()
}
</script>

<template>
  <dialog ref="dialog" class="signup-dialog" aria-labelledby="signup-dialog-title" @close="onClose" @click="onBackdrop">
    <div class="panel">
      <button type="button" class="close" aria-label="Schließen" @click="dialog.close()">
        <X :size="22" aria-hidden="true" />
      </button>
      <p class="eyebrow">Start: {{ site.launchHint }}</p>
      <h2 id="signup-dialog-title">
        <template v-if="selected">Sichere dir dein {{ selected.name }}-Paket</template>
        <template v-else>Sei von Anfang an dabei</template>
      </h2>
      <p class="lead">
        Wir sind fast startklar, die Bestellung öffnet bald. Trag dich ein und du bekommst
        <strong>{{ site.earlyBirdDiscount }}&nbsp;% Frühbucher-Rabatt</strong>
        <template v-if="selected">
          – das {{ selected.name }}-Paket kostet dich dann {{ formatPrice(selected.price * (1 - site.earlyBirdDiscount / 100)) }}
          statt {{ formatPrice(selected.price) }}</template
        >.
      </p>
      <!-- v-if re-mounts the form on every opening, so a finished signup starts fresh. -->
      <SignupForm v-if="interest.dialogOpen" :location="interest.dialogLocation" />
    </div>
  </dialog>
</template>

<style scoped>
.signup-dialog {
  width: min(600px, calc(100vw - 24px));
  max-height: calc(100dvh - 24px);
  padding: 0;
  border: var(--border);
  border-radius: var(--radius-lg);
  background: var(--card);
  color: var(--ink);
  box-shadow: var(--shadow-lg);
  overflow: auto;
}

.signup-dialog::backdrop {
  background: rgb(29 27 47 / 0.55);
  backdrop-filter: blur(3px);
}

.signup-dialog[open] {
  animation: pop 0.22s ease-out;
}

@keyframes pop {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }
}

.panel {
  position: relative;
  padding: clamp(22px, 4vw, 36px);
}

.close {
  position: absolute;
  top: 14px;
  right: 14px;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 2px solid var(--ink);
  border-radius: 12px;
  background: var(--paper);
  color: var(--ink);
  cursor: pointer;
}

h2 {
  font-size: clamp(1.6rem, 4vw, 2.1rem);
  padding-right: 40px;
}

.lead {
  color: var(--ink-soft);
}
</style>
