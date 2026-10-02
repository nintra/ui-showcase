<script setup>
import HeroSection from '../components/HeroSection.vue'
import HowItWorks from '../components/HowItWorks.vue'
import StickerStudio from '../components/StickerStudio.vue'
import UseCases from '../components/UseCases.vue'
import PricingSection from '../components/PricingSection.vue'
import FaqSection from '../components/FaqSection.vue'
import FinalCta from '../components/FinalCta.vue'
</script>

<template>
  <HeroSection />
  <HowItWorks />
  <section id="ausprobieren" class="section">
    <div class="container">
      <div class="section-head">
        <p class="eyebrow">Probier's aus</p>
        <h2>So sieht dein Sticker aus</h2>
        <p>Lade ein Foto hoch, wähle Ausschnitt und Look – echtes Foto mit Filter oder illustriert – und sieh sofort deine Minifigur. Das ist eine vereinfachte Vorschau, die echten Sticker optimieren wir für den Druck.</p>
      </div>
      <StickerStudio />
    </div>
  </section>
  <UseCases />
  <PricingSection />
  <FaqSection />
  <FinalCta />
</template>
