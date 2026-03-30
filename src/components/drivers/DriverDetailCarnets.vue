<template>
  <v-expansion-panel title="Carnets y Certificaciones" value="carnets">
    <v-expansion-panel-text>
      <!-- Carnet de conducir -->
      <div class="text-subtitle-2 mb-3">Carnet de conducir (RDL 6/2015)</div>
      <v-row>
        <v-col cols="6" sm="4" md="3">
          <div class="text-caption text-medium-emphasis">Clase</div>
          <div class="text-body-1 font-weight-medium">{{ driver.carnet_clase || '—' }}</div>
        </v-col>
        <v-col cols="6" sm="4" md="3">
          <div class="text-caption text-medium-emphasis">Número</div>
          <div class="text-body-1">{{ driver.carnet_numero || '—' }}</div>
        </v-col>
        <v-col cols="6" sm="4" md="3">
          <div class="text-caption text-medium-emphasis">Fecha expedición</div>
          <div class="text-body-1">{{ formatDate(driver.carnet_fecha_expedicion) }}</div>
        </v-col>
        <v-col cols="6" sm="4" md="3">
          <div class="text-caption text-medium-emphasis">Fecha vencimiento</div>
          <div class="d-flex align-center ga-2">
            <div class="text-body-1">{{ formatDate(driver.carnet_fecha_vencimiento) }}</div>
            <v-chip
              v-if="driver.carnet_fecha_vencimiento"
              :color="getEstado(driver.carnet_fecha_vencimiento).color"
              size="x-small"
              variant="tonal"
            >
              {{ getEstado(driver.carnet_fecha_vencimiento).label }}
            </v-chip>
          </div>
        </v-col>
      </v-row>

      <v-divider class="my-4" />

      <!-- CAP -->
      <div class="text-subtitle-2 mb-3">
        CAP — Certificado de Aptitud Profesional (RD 1032/2007)
      </div>
      <v-row>
        <v-col cols="6" sm="4" md="3">
          <div class="text-caption text-medium-emphasis">Número CAP</div>
          <div class="text-body-1">{{ driver.cap_numero || '—' }}</div>
        </v-col>
        <v-col cols="6" sm="4" md="3">
          <div class="text-caption text-medium-emphasis">Horas formación</div>
          <div class="text-body-1">{{ driver.cap_horas_formacion ?? '—' }}</div>
        </v-col>
        <v-col cols="6" sm="4" md="3">
          <div class="text-caption text-medium-emphasis">Fecha vencimiento</div>
          <div class="d-flex align-center ga-2">
            <div class="text-body-1">{{ formatDate(driver.cap_fecha_vencimiento) }}</div>
            <v-chip
              v-if="driver.cap_fecha_vencimiento"
              :color="getEstado(driver.cap_fecha_vencimiento).color"
              size="x-small"
              variant="tonal"
            >
              {{ getEstado(driver.cap_fecha_vencimiento).label }}
            </v-chip>
          </div>
        </v-col>
      </v-row>

      <v-divider class="my-4" />

      <!-- Tarjeta tacógrafo -->
      <div class="text-subtitle-2 mb-3">Tarjeta de conductor — Tacógrafo (Reg. UE 165/2014)</div>
      <v-row>
        <v-col cols="6" sm="4" md="3">
          <div class="text-caption text-medium-emphasis">Número</div>
          <div class="text-body-1">{{ driver.tarjeta_tacografo_numero || '—' }}</div>
        </v-col>
        <v-col cols="6" sm="4" md="3">
          <div class="text-caption text-medium-emphasis">Fecha vencimiento</div>
          <div class="d-flex align-center ga-2">
            <div class="text-body-1">{{ formatDate(driver.tarjeta_tacografo_vencimiento) }}</div>
            <v-chip
              v-if="driver.tarjeta_tacografo_vencimiento"
              :color="getEstado(driver.tarjeta_tacografo_vencimiento).color"
              size="x-small"
              variant="tonal"
            >
              {{ getEstado(driver.tarjeta_tacografo_vencimiento).label }}
            </v-chip>
          </div>
        </v-col>
      </v-row>

      <v-divider class="my-4" />

      <!-- Reconocimiento médico -->
      <div class="text-subtitle-2 mb-3">Reconocimiento médico (RD 818/2009)</div>
      <v-row>
        <v-col cols="6" sm="4" md="3">
          <div class="text-caption text-medium-emphasis">Fecha reconocimiento</div>
          <div class="text-body-1">{{ formatDate(driver.reconocimiento_medico_fecha) }}</div>
        </v-col>
        <v-col cols="6" sm="4" md="3">
          <div class="text-caption text-medium-emphasis">Fecha vencimiento</div>
          <div class="d-flex align-center ga-2">
            <div class="text-body-1">
              {{ formatDate(driver.reconocimiento_medico_vencimiento) }}
            </div>
            <v-chip
              v-if="driver.reconocimiento_medico_vencimiento"
              :color="getEstado(driver.reconocimiento_medico_vencimiento).color"
              size="x-small"
              variant="tonal"
            >
              {{ getEstado(driver.reconocimiento_medico_vencimiento).label }}
            </v-chip>
          </div>
        </v-col>
      </v-row>

      <v-divider class="my-4" />

      <!-- ADR -->
      <div class="text-subtitle-2 mb-3">Certificado ADR (ADR 2025 + RD 97/2014)</div>
      <v-row>
        <v-col cols="6" sm="4" md="3">
          <div class="text-caption text-medium-emphasis">¿Certificado ADR?</div>
          <v-chip :color="driver.adr_certificado ? 'success' : 'grey'" size="small" variant="tonal">
            {{ driver.adr_certificado ? 'Sí' : 'No' }}
          </v-chip>
        </v-col>
        <template v-if="driver.adr_certificado">
          <v-col cols="6" sm="4" md="3">
            <div class="text-caption text-medium-emphasis">Número</div>
            <div class="text-body-1">{{ driver.adr_numero || '—' }}</div>
          </v-col>
          <v-col cols="6" sm="4" md="3">
            <div class="text-caption text-medium-emphasis">Fecha vencimiento</div>
            <div class="d-flex align-center ga-2">
              <div class="text-body-1">{{ formatDate(driver.adr_fecha_vencimiento) }}</div>
              <v-chip
                v-if="driver.adr_fecha_vencimiento"
                :color="getEstado(driver.adr_fecha_vencimiento).color"
                size="x-small"
                variant="tonal"
              >
                {{ getEstado(driver.adr_fecha_vencimiento).label }}
              </v-chip>
            </div>
          </v-col>
        </template>
      </v-row>
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>

<script setup>
import { useDriverDocuments } from '@/composables/use-driver-documents.js'

const props = defineProps({
  driver: { type: Object, required: true },
})

const { getEstadoDocumento: getEstado } = useDriverDocuments(props.driver.id)

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-ES')
}
</script>
