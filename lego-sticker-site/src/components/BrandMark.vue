<script setup>
import { site } from '../../shared/site.config.js'
</script>

<template>
  <span class="brand">
    <svg class="brand-icon" viewBox="0 0 64 64" aria-hidden="true">
      <rect x="20" y="4" width="24" height="12" rx="3" fill="var(--yellow)" stroke="var(--ink)" stroke-width="4" />
      <rect x="8" y="14" width="48" height="44" rx="14" fill="var(--yellow)" stroke="var(--ink)" stroke-width="4" />
      <circle cx="24" cy="32" r="4" fill="var(--ink)" />
      <circle cx="40" cy="32" r="4" fill="var(--ink)" />
      <path d="M22 42q10 8 20 0" fill="none" stroke="var(--ink)" stroke-width="4" stroke-linecap="round" />
    </svg>
    <span class="brand-name">{{ site.brand }}</span>
  </span>
</template>

<style scoped>
.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.brand-icon {
  width: 34px;
  height: 34px;
  transition: transform 0.2s ease;
}

.brand:hover .brand-icon {
  transform: rotate(-8deg);
}

.brand-name {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.45rem;
  letter-spacing: -0.01em;
}
</style>
