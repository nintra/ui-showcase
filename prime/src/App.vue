<script setup lang="ts">
import { useColorMode } from '@vueuse/core'
import { Sun, Moon } from 'lucide-vue-next';
import { computed } from 'vue';
import Demo from '@/components/demo/Demo.vue'
import Toast from 'primevue/toast';

const mode = useColorMode()
const colorModeIcon = computed(() => {
  return mode.value === 'light' ? Sun : Moon
})
function toggleColorMode() {
  mode.value = mode.value === 'light' ? 'dark' : 'light'
}
</script>

<template>
  <div class="p-8 container mx-auto">
    <header class="mb-8">
      <component class="ml-auto" :title="mode" :is="colorModeIcon" :size="32" :stroke-width="1.25"
        @click="toggleColorMode" />
    </header>
    <Toast />

    <Demo />
  </div>
</template>
