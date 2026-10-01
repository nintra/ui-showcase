<script setup>
import BrandMark from './BrandMark.vue'
import { site } from '../../shared/site.config.js'
</script>

<template>
  <footer class="site-footer">
    <div class="container inner">
      <div class="about">
        <BrandMark />
        <p>{{ site.tagline }} – aus deinem Foto, für deine Figuren.</p>
      </div>
      <nav aria-label="Rechtliches">
        <RouterLink to="/impressum">Impressum</RouterLink>
        <RouterLink to="/datenschutz">Datenschutz</RouterLink>
        <a :href="`mailto:${site.contactEmail}`">Kontakt</a>
      </nav>
    </div>
    <div class="container">
      <p class="legal">
        LEGO® ist eine Marke der LEGO Gruppe, durch die diese Website weder gesponsert noch autorisiert oder unterstützt wird.
        {{ site.brand }} ist ein unabhängiges Angebot. Die Sticker sind Zubehör und enthalten keine Minifiguren.
      </p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  padding: 48px 0 32px;
  background: var(--ink);
  color: #f3f0ff;
}

.inner {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgb(255 255 255 / 0.15);
}

.about p {
  margin: 10px 0 0;
  color: #c9c5dd;
}

nav {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-start;
}

nav a {
  font-weight: 700;
  text-decoration: none;
}

nav a:hover {
  text-decoration: underline;
}

.legal {
  margin: 20px 0 0;
  font-size: 0.85rem;
  color: #a9a5c0;
}
</style>
