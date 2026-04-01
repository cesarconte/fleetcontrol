<template>
  <VContainer fluid>
    <h1 class="text-h4 mb-6">Informes</h1>
    <VRow>
      <VCol v-for="inf in reports" :key="inf.value" cols="12" sm="6" md="4">
        <VCard
          hover
          class="report-card"
          :data-testid="`report-card-${inf.value}`"
          @click="$router.push(`/informes/${inf.value}`)"
        >
          <VCardText class="text-center pa-6">
            <VIcon :color="inf.color" size="48" class="mb-3">
              {{ inf.icon }}
            </VIcon>
            <div class="text-h6 mb-2">{{ inf.label }}</div>
            <div class="text-body-2 text-medium-emphasis">
              {{ inf.description }}
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup>
import { REPORT_TYPES } from '@/constants/report-types.js'

const reports = Object.values(REPORT_TYPES).filter(i => i.value !== 'dashboard')
</script>

<style scoped>
.report-card {
  cursor: pointer;
  transition: transform 0.2s;
}
.report-card:hover {
  transform: translateY(-4px);
}
</style>
