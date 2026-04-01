<template>
  <VCard>
    <VCardText class="text-center">
      <div class="text-caption text-uppercase text-medium-emphasis">{{ label }}</div>
      <div class="text-h4 mt-2" :style="{ color: `rgb(var(--v-theme-${color}))` }">
        {{ formattedValue }}
      </div>
      <VSparkline
        v-if="sparkData.length"
        :model-value="sparkData"
        color="primary"
        height="24"
        class="mt-2"
      />
    </VCardText>
  </VCard>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  formattedValue: { type: String, required: true },
  color: { type: String, default: 'primary' },
  icon: { type: String, default: '' },
  sparkData: { type: Array, default: () => [] },
})
</script>
