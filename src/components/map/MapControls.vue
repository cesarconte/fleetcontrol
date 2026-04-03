<template>
  <div class="map-controls" data-testid="map-controls" role="toolbar" aria-label="Filtros del mapa">
    <v-btn
      v-for="filter in filters"
      :key="filter.key"
      :data-testid="`filter-${filter.key}`"
      :variant="activeFilter === filter.key ? 'flat' : 'outlined'"
      :color="activeFilter === filter.key ? 'primary' : undefined"
      :aria-pressed="activeFilter === filter.key"
      size="small"
      class="mr-2 mb-2"
      @click="$emit('update:activeFilter', filter.key)"
    >
      <v-icon start size="small">{{ filter.icon }}</v-icon>
      {{ filter.label }}
    </v-btn>
  </div>
</template>

<script setup>
defineProps({
  filters: { type: Array, required: true },
  activeFilter: { type: String, default: 'all' },
})

defineEmits(['update:activeFilter'])
</script>

<style scoped>
.map-controls {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
  background: rgb(var(--v-theme-surface));
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
</style>
