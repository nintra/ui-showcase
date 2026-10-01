<script setup>
import { ref, reactive, useId } from 'vue'
import { MailCheck } from 'lucide-vue-next'
import { site, packages, occasions, priceRanges } from '../../shared/site.config.js'
import { interest } from '../lib/interest.js'
import { track, getSource } from '../lib/track.js'

const props = defineProps({
  location: { type: String, required: true },
  submitLabel: { type: String, default: 'Platz sichern' },
})

const id = useId()
const form = reactive({ email: '', firstName: '', occasion: '', priceRange: '', consent: false, website: '' })
const errors = ref({})
const status = ref('idle') // idle | sending | done | error
const message = ref('')
const devConfirmUrl = ref('')
let started = false

function onFocus() {
  if (started) return
  started = true
  track('form_start', { location: props.location })
}

function toggle(field, value) {
  form[field] = form[field] === value ? '' : value
}

async function submit() {
  errors.value = {}
  message.value = ''
  status.value = 'sending'
  try {
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        email: form.email.trim(),
        package: interest.package,
        style: interest.style,
        source: { ...getSource(), location: props.location },
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok && data.ok) {
      status.value = 'done'
      devConfirmUrl.value = data.devConfirmUrl || ''
      return
    }
    errors.value = data.errors || {}
    message.value = data.error || (res.status === 422 ? '' : 'Da ist etwas schiefgelaufen. Bitte versuch es noch einmal.')
    status.value = 'error'
  } catch {
    message.value = 'Keine Verbindung. Bitte prüfe dein Internet und versuch es noch einmal.'
    status.value = 'error'
  }
}
</script>

<template>
  <div v-if="status === 'done'" class="success" role="status">
    <MailCheck :size="44" aria-hidden="true" />
    <h3>Fast geschafft – check dein Postfach!</h3>
    <p>
      Wir haben dir eine E-Mail an <strong>{{ form.email }}</strong> geschickt. Klick auf den Link darin, um deinen
      Platz und die {{ site.earlyBirdDiscount }}&nbsp;% Frühbucher-Rabatt zu sichern.
    </p>
    <p class="hint">Nichts angekommen? Schau auch im Spam-Ordner nach.</p>
    <p v-if="devConfirmUrl" class="dev">
      Entwicklungsmodus (Brevo nicht konfiguriert):
      <a :href="devConfirmUrl">Bestätigungslink öffnen</a>
    </p>
  </div>

  <form v-else class="signup" novalidate @submit.prevent="submit" @focusin="onFocus">
    <div class="row">
      <div class="field">
        <label :for="`${id}-email`">E-Mail-Adresse <span aria-hidden="true">*</span></label>
        <input
          :id="`${id}-email`"
          v-model="form.email"
          type="email"
          inputmode="email"
          autocomplete="email"
          required
          placeholder="du@beispiel.de"
          :aria-invalid="Boolean(errors.email)"
          :aria-describedby="errors.email ? `${id}-email-error` : undefined"
        />
        <p v-if="errors.email" :id="`${id}-email-error`" class="field-error">{{ errors.email }}</p>
      </div>
      <div class="field">
        <label :for="`${id}-name`">Vorname <span class="optional">(optional)</span></label>
        <input :id="`${id}-name`" v-model="form.firstName" type="text" autocomplete="given-name" maxlength="50" />
      </div>
    </div>

    <div class="field">
      <label :for="`${id}-package`">Welches Paket interessiert dich?</label>
      <select :id="`${id}-package`" v-model="interest.package">
        <option value="">Bitte wählen …</option>
        <option v-for="p in packages" :key="p.id" :value="p.id">{{ p.name }} – bis {{ p.faces }} {{ p.faces === 1 ? 'Gesicht' : 'Gesichter' }}</option>
        <option value="unsicher">Weiß ich noch nicht</option>
      </select>
    </div>

    <fieldset class="field">
      <legend>Wofür würdest du die Sticker nutzen? <span class="optional">(optional)</span></legend>
      <div class="chips">
        <button
          v-for="o in occasions"
          :key="o.id"
          type="button"
          class="chip"
          :aria-pressed="form.occasion === o.id"
          @click="toggle('occasion', o.id)"
        >
          {{ o.label }}
        </button>
      </div>
    </fieldset>

    <fieldset class="field">
      <legend>Was wäre dir ein Gesicht mit 6 Stickern wert? <span class="optional">(optional)</span></legend>
      <div class="chips">
        <button
          v-for="r in priceRanges"
          :key="r.id"
          type="button"
          class="chip"
          :aria-pressed="form.priceRange === r.id"
          @click="toggle('priceRange', r.id)"
        >
          {{ r.label }}
        </button>
      </div>
    </fieldset>

    <!-- Honeypot: invisible for people, tempting for bots. -->
    <div class="hp" aria-hidden="true">
      <label :for="`${id}-website`">Website</label>
      <input :id="`${id}-website`" v-model="form.website" type="text" tabindex="-1" autocomplete="off" />
    </div>

    <div class="field">
      <label class="consent">
        <input v-model="form.consent" type="checkbox" required :aria-invalid="Boolean(errors.consent)" />
        <span>
          Ja, informiert mich per E-Mail, sobald {{ site.brand }} startet. Abmeldung jederzeit mit einem Klick. Mehr in
          der <RouterLink to="/datenschutz" target="_blank">Datenschutzerklärung</RouterLink>.
        </span>
      </label>
      <p v-if="errors.consent" class="field-error">{{ errors.consent }}</p>
    </div>

    <p v-if="message" class="form-error" role="alert">{{ message }}</p>

    <button type="submit" class="btn btn-block" :disabled="status === 'sending'">
      {{ status === 'sending' ? 'Wird gesendet …' : submitLabel }}
    </button>
    <p class="fineprint">Kostenlos & unverbindlich – du bestellst nichts.</p>
  </form>
</template>

<style scoped>
.signup {
  display: grid;
  gap: 18px;
  text-align: left;
}

.row {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 14px;
}

.field {
  display: grid;
  gap: 6px;
  margin: 0;
  padding: 0;
  border: 0;
  min-width: 0;
}

label,
legend {
  font-weight: 800;
  font-size: 0.95rem;
  padding: 0;
}

legend {
  margin-bottom: 8px;
}

.optional {
  font-weight: 600;
  color: var(--muted);
}

input[type='email'],
input[type='text'],
select {
  width: 100%;
  min-height: 50px;
  padding: 10px 14px;
  border: 2px solid var(--ink);
  border-radius: 12px;
  background: #fff;
  color: var(--ink);
  font: inherit;
}

select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='9' viewBox='0 0 14 9'%3E%3Cpath d='M1 1l6 6 6-6' fill='none' stroke='%231d1b2f' stroke-width='2.5' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  padding-right: 42px;
}

input:focus-visible,
select:focus-visible {
  outline: 3px solid var(--blue);
  outline-offset: 1px;
}

input[aria-invalid='true'] {
  border-color: var(--red);
  background: #fff4f2;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  min-height: 40px;
  padding: 6px 14px;
  border: 2px solid var(--ink);
  border-radius: 999px;
  background: #fff;
  color: var(--ink);
  font: inherit;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.12s ease;
}

.chip:hover {
  background: var(--paper);
}

.chip[aria-pressed='true'] {
  background: var(--ink);
  color: #fff;
}

.consent {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-weight: 600;
  font-size: 0.92rem;
  line-height: 1.45;
  cursor: pointer;
}

.consent input {
  flex: none;
  width: 22px;
  height: 22px;
  margin: 0;
  accent-color: var(--red);
}

.field-error,
.form-error {
  margin: 0;
  color: var(--red-dark);
  font-weight: 700;
  font-size: 0.9rem;
}

.form-error {
  padding: 10px 14px;
  border-radius: 12px;
  background: var(--pink-soft);
  color: var(--ink);
}

.hp {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.fineprint {
  margin: -6px 0 0;
  text-align: center;
  font-size: 0.85rem;
  color: var(--muted);
}

.success {
  display: grid;
  justify-items: center;
  gap: 4px;
  text-align: center;
}

.success svg {
  color: var(--green);
}

.success h3 {
  margin: 8px 0 4px;
}

.hint {
  color: var(--muted);
  font-size: 0.95rem;
}

.dev {
  padding: 10px 14px;
  border: 2px dashed var(--ink);
  border-radius: 12px;
  background: var(--yellow-soft);
  font-size: 0.9rem;
}

@media (max-width: 560px) {
  .row {
    grid-template-columns: 1fr;
  }
}
</style>
