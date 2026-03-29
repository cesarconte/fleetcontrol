<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Dashboard</h1>
        <v-row>
          <v-col v-for="kpi in kpis" :key="kpi.label" cols="12" sm="6" md="3">
            <v-card>
              <v-card-text class="text-center">
                <div class="text-caption text-uppercase text-medium-emphasis">
                  {{ kpi.label }}
                </div>
                <div class="text-h4 mt-2" :style="{ color: kpi.color }">
                  {{ kpi.value }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const kpis = [
  { label: 'Vehículos en flota', value: '—', color: 'var(--color-primary)' },
  { label: 'En ruta', value: '—', color: 'var(--color-success)' },
  { label: 'Conductores activos', value: '—', color: 'var(--color-info)' },
  { label: 'Alertas activas', value: '—', color: 'var(--color-error)' },
]
</script>
