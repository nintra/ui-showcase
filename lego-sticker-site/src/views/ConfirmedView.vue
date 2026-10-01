<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { PartyPopper, CircleAlert, Link2 } from 'lucide-vue-next'
import MiniFigure from '../components/MiniFigure.vue'
import { site } from '../../shared/site.config.js'

const route = useRoute()
const status = computed(() => route.query.status || 'ok')
const copied = ref(false)

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.origin)
    copied.value = true
  } catch {
    copied.value = false
  }
}
</script>

<template>
  <section class="section">
    <div class="container narrow">
      <div v-if="status === 'ok'" class="card box">
        <div class="fig" aria-hidden="true">
          <MiniFigure hair="bun" hair-color="#c0572b" torso="var(--green)" legs="var(--blue)" face-variant="wink" print="heart" />
        </div>
        <div>
          <p class="eyebrow"><PartyPopper :size="16" aria-hidden="true" /> Bestätigt</p>
          <h1>Du bist dabei!</h1>
          <p>
            Danke! Du stehst auf der Warteliste und bekommst {{ site.earlyBirdDiscount }}&nbsp;% Frühbucher-Rabatt. Wir melden uns,
            sobald {{ site.brand }} startet – geplant ist {{ site.launchHint }}.
          </p>
          <p>Kennst du jemanden, der sich als Minifigur freuen würde? Teil die Seite gern:</p>
          <button type="button" class="btn btn-yellow" @click="copyLink">
            <Link2 :size="18" aria-hidden="true" /> {{ copied ? 'Link kopiert!' : 'Link kopieren' }}
          </button>
        </div>
      </div>

      <div v-else class="card box">
        <div>
          <p class="eyebrow"><CircleAlert :size="16" aria-hidden="true" /> Hoppla</p>
          <template v-if="status === 'ungueltig'">
            <h1>Der Link ist abgelaufen</h1>
            <p>Dieser Bestätigungslink ist ungültig oder älter als 7 Tage. Trag dich einfach noch einmal ein – dauert nur ein paar Sekunden.</p>
          </template>
          <template v-else>
            <h1>Da ist etwas schiefgelaufen</h1>
            <p>Wir konnten deine Anmeldung gerade nicht speichern. Bitte klick in ein paar Minuten noch einmal auf den Link in der E-Mail.</p>
          </template>
          <RouterLink :to="{ path: '/', hash: '#vormerken' }" class="btn">Zur Anmeldung</RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.narrow {
  max-width: calc(820px + 2 * var(--gutter));
}

.box {
  display: flex;
  gap: clamp(20px, 4vw, 40px);
  align-items: center;
  padding: clamp(24px, 5vw, 48px);
  box-shadow: var(--shadow-lg);
}

.fig {
  flex: none;
  width: clamp(110px, 22vw, 170px);
}

h1 {
  font-size: clamp(2rem, 5vw, 3rem);
}

@media (max-width: 600px) {
  .box {
    flex-direction: column;
    text-align: center;
  }
}
</style>
