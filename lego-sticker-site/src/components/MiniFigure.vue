<script setup>
import { useId } from 'vue'

// Generic minifigure illustration with a face sticker on its head.
// `face` is an image URL (the stylized photo); without it a drawn face is shown.
const props = defineProps({
  face: { type: String, default: '' },
  faceVariant: { type: String, default: 'smile' }, // smile | glasses | beard | wink | freckles
  faceBg: { type: String, default: '#f7c99b' },
  hair: { type: String, default: 'short' }, // none | short | long | bun | curly | cap
  hairColor: { type: String, default: '#5b3a1e' },
  torso: { type: String, default: 'var(--red)' },
  legs: { type: String, default: 'var(--blue)' },
  print: { type: String, default: 'none' }, // none | tie | heart | zip | star
  skin: { type: String, default: 'var(--yellow)' },
  sticker: { type: Boolean, default: true },
  label: { type: String, default: 'Minifigur mit Gesichtssticker' },
})

const clipId = useId()
const ink = 'var(--ink)'
</script>

<template>
  <svg class="minifig" viewBox="0 0 200 340" role="img" :aria-label="props.label">
    <defs>
      <clipPath :id="clipId">
        <rect x="66" y="34" width="68" height="62" rx="18" />
      </clipPath>
    </defs>

    <ellipse cx="100" cy="331" rx="66" ry="7" :fill="ink" opacity="0.14" />

    <!-- legs & hips -->
    <rect x="50" y="232" width="48" height="94" rx="5" :fill="legs" :stroke="ink" stroke-width="3" />
    <rect x="102" y="232" width="48" height="94" rx="5" :fill="legs" :stroke="ink" stroke-width="3" />
    <path d="M50 306h48M102 306h48" :stroke="ink" stroke-width="3" opacity="0.5" />
    <rect x="47" y="214" width="106" height="22" rx="5" :fill="legs" :stroke="ink" stroke-width="3" />

    <!-- neck & torso -->
    <rect x="84" y="98" width="32" height="14" rx="3" :fill="skin" :stroke="ink" stroke-width="3" />
    <path
      d="M68 108H132C138 108 140 112 141 117L154 208C155 214 151 218 145 218H55C49 218 45 214 46 208L59 117C60 112 62 108 68 108Z"
      :fill="torso"
      :stroke="ink"
      stroke-width="3"
    />
    <g v-if="print === 'tie'">
      <path d="M92 109h16l-4 9 8 54-12 14-12-14 8-54z" fill="var(--ink-soft)" :stroke="ink" stroke-width="2.5" stroke-linejoin="round" />
    </g>
    <path
      v-else-if="print === 'heart'"
      d="M100 178c-18-12-26-20-26-31 0-8 6-14 13-14 6 0 10 3 13 8 3-5 7-8 13-8 7 0 13 6 13 14 0 11-8 19-26 31z"
      fill="#fff"
      :stroke="ink"
      stroke-width="2.5"
    />
    <g v-else-if="print === 'zip'" :stroke="ink" stroke-width="2.5" fill="none" stroke-linecap="round">
      <path d="M100 110v104" />
      <path d="M70 176h18M112 176h18" />
    </g>
    <path
      v-else-if="print === 'star'"
      d="M100 136l7 15 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2z"
      fill="var(--yellow)"
      :stroke="ink"
      stroke-width="2.5"
      stroke-linejoin="round"
    />

    <!-- arms (outlined thick strokes) & hands -->
    <g stroke-linecap="round">
      <path d="M60 124L40 190M140 124L160 190" :stroke="ink" stroke-width="27" />
      <path d="M60 124L40 190M140 124L160 190" :stroke="torso" stroke-width="21" />
      <path d="M28 214A11 11 0 1 1 50 214M150 214A11 11 0 1 1 172 214" fill="none" :stroke="ink" stroke-width="13" />
      <path d="M28 214A11 11 0 1 1 50 214M150 214A11 11 0 1 1 172 214" fill="none" :stroke="skin" stroke-width="7" />
    </g>

    <!-- head -->
    <rect x="78" y="6" width="44" height="22" rx="5" :fill="skin" :stroke="ink" stroke-width="3" />
    <rect x="56" y="20" width="88" height="84" rx="22" :fill="skin" :stroke="ink" stroke-width="3" />

    <!-- face sticker -->
    <rect v-if="sticker" x="62" y="30" width="76" height="70" rx="21" fill="#fff" :stroke="ink" stroke-width="1.5" />
    <g :clip-path="`url(#${clipId})`">
      <image v-if="face" :href="face" x="66" y="34" width="68" height="62" preserveAspectRatio="xMidYMid slice" />
      <g v-else>
        <rect x="66" y="34" width="68" height="62" :fill="sticker ? faceBg : skin" />
        <g :fill="ink" :stroke="ink" stroke-linecap="round" stroke-linejoin="round">
          <path d="M80 52q6-4 12 0M108 52q6-4 12 0" fill="none" stroke-width="3" />
          <template v-if="faceVariant === 'wink'">
            <circle cx="86" cy="62" r="4.5" stroke="none" />
            <path d="M108 62q6-5 12 0" fill="none" stroke-width="3" />
          </template>
          <template v-else>
            <circle cx="86" cy="62" r="4.5" stroke="none" />
            <circle cx="114" cy="62" r="4.5" stroke="none" />
            <circle cx="87.5" cy="60.5" r="1.4" fill="#fff" stroke="none" />
            <circle cx="115.5" cy="60.5" r="1.4" fill="#fff" stroke="none" />
          </template>
          <g v-if="faceVariant === 'glasses'" fill="none" stroke-width="2.5">
            <circle cx="86" cy="62" r="9.5" />
            <circle cx="114" cy="62" r="9.5" />
            <path d="M95.5 62h9" />
          </g>
          <path
            v-if="faceVariant === 'beard'"
            d="M68 66c2 18 14 30 32 30s30-12 32-30c-8 9-18 12-32 12s-24-3-32-12z"
            :fill="hairColor"
            stroke-width="2"
          />
          <path
            v-if="faceVariant === 'beard'"
            d="M92 80q8 6 16 0"
            fill="none"
            stroke="#fff"
            stroke-width="3"
          />
          <path v-else d="M86 77q14 12 28 0" fill="none" stroke-width="3.5" />
          <g v-if="faceVariant === 'freckles'" stroke="none" opacity="0.6">
            <circle cx="76" cy="72" r="1.3" />
            <circle cx="80" cy="75" r="1.3" />
            <circle cx="74" cy="77" r="1.3" />
            <circle cx="124" cy="72" r="1.3" />
            <circle cx="120" cy="75" r="1.3" />
            <circle cx="126" cy="77" r="1.3" />
          </g>
          <g v-if="faceVariant !== 'beard'" fill="#ff7f8e" stroke="none" opacity="0.45">
            <circle cx="77" cy="74" r="5" />
            <circle cx="123" cy="74" r="5" />
          </g>
        </g>
      </g>
    </g>

    <!-- hair -->
    <g :fill="hairColor" :stroke="ink" stroke-width="3" stroke-linejoin="round">
      <path v-if="hair === 'short' || hair === 'bun'" d="M52 60C48 24 72 10 100 10S152 24 148 60C140 40 124 31 100 31S60 40 52 60Z" />
      <circle v-if="hair === 'bun'" cx="100" cy="10" r="12" />
      <path v-if="hair === 'long'" d="M50 110C40 60 50 10 100 10S160 60 150 110H136C139 70 134 36 100 33 66 36 61 70 64 110Z" />
      <g v-if="hair === 'curly'">
        <circle cx="60" cy="40" r="13" />
        <circle cx="76" cy="24" r="14" />
        <circle cx="100" cy="18" r="15" />
        <circle cx="124" cy="24" r="14" />
        <circle cx="140" cy="40" r="13" />
      </g>
      <g v-if="hair === 'cap'">
        <path d="M54 48C54 20 76 6 100 6S146 20 146 48Z" />
        <path d="M46 48H154C160 48 162 52 162 56H38C38 52 40 48 46 48Z" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.minifig {
  width: 100%;
  height: auto;
  overflow: visible;
}
</style>
