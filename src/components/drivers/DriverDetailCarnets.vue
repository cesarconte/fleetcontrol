<template>
  <v-expansion-panel title="Carnets y Certificaciones" value="carnets">
    <v-expansion-panel-text>
      <!-- Carnet de conducir -->
      <div class="text-subtitle-2 mb-3">Carnet de conducir (RDL 6/2015)</div>
      <v-row>
        <v-col cols="6" sm="4" md="3">
          <div class="text-caption text-medium-emphasis">Clase</div>
          <div class="text-body-1 font-weight-medium">{{ driver.license_class || '—' }}</div>
        </v-col>
        <v-col cols="6" sm="4" md="3">
          <div class="text-caption text-medium-emphasis">Número</div>
          <div class="text-body-1">{{ driver.license_number || '—' }}</div>
        </v-col>
        <v-col cols="6" sm="4" md="3">
          <div class="text-caption text-medium-emphasis">Fecha expedición</div>
          <div class="text-body-1">{{ formatDate(driver.license_issue_date) }}</div>
        </v-col>
        <v-col cols="6" sm="4" md="3">
          <div class="text-caption text-medium-emphasis">Fecha vencimiento</div>
          <div class="d-flex align-center ga-2">
            <div class="text-body-1">{{ formatDate(driver.license_expiry_date) }}</div>
            <v-chip
              v-if="driver.license_expiry_date"
              :color="getEstado(driver.license_expiry_date).color"
              size="x-small"
              variant="tonal"
            >
              {{ getEstado(driver.license_expiry_date).label }}
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
          <div class="text-body-1">{{ driver.cap_number || '—' }}</div>
        </v-col>
        <v-col cols="6" sm="4" md="3">
          <div class="text-caption text-medium-emphasis">Horas formación</div>
          <div class="text-body-1">{{ driver.cap_training_hours ?? '—' }}</div>
        </v-col>
        <v-col cols="6" sm="4" md="3">
          <div class="text-caption text-medium-emphasis">Fecha vencimiento</div>
          <div class="d-flex align-center ga-2">
            <div class="text-body-1">{{ formatDate(driver.cap_expiry_date) }}</div>
            <v-chip
              v-if="driver.cap_expiry_date"
              :color="getEstado(driver.cap_expiry_date).color"
              size="x-small"
              variant="tonal"
            >
              {{ getEstado(driver.cap_expiry_date).label }}
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
          <div class="text-body-1">{{ driver.tachograph_card_number || '—' }}</div>
        </v-col>
        <v-col cols="6" sm="4" md="3">
          <div class="text-caption text-medium-emphasis">Fecha vencimiento</div>
          <div class="d-flex align-center ga-2">
            <div class="text-body-1">{{ formatDate(driver.tachograph_card_expiry) }}</div>
            <v-chip
              v-if="driver.tachograph_card_expiry"
              :color="getEstado(driver.tachograph_card_expiry).color"
              size="x-small"
              variant="tonal"
            >
              {{ getEstado(driver.tachograph_card_expiry).label }}
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
          <div class="text-body-1">{{ formatDate(driver.medical_exam_date) }}</div>
        </v-col>
        <v-col cols="6" sm="4" md="3">
          <div class="text-caption text-medium-emphasis">Fecha vencimiento</div>
          <div class="d-flex align-center ga-2">
            <div class="text-body-1">
              {{ formatDate(driver.medical_exam_expiry) }}
            </div>
            <v-chip
              v-if="driver.medical_exam_expiry"
              :color="getEstado(driver.medical_exam_expiry).color"
              size="x-small"
              variant="tonal"
            >
              {{ getEstado(driver.medical_exam_expiry).label }}
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
          <v-chip :color="driver.adr_certificate ? 'success' : 'grey'" size="small" variant="tonal">
            {{ driver.adr_certificate ? 'Sí' : 'No' }}
          </v-chip>
        </v-col>
        <template v-if="driver.adr_certificate">
          <v-col cols="6" sm="4" md="3">
            <div class="text-caption text-medium-emphasis">Número</div>
            <div class="text-body-1">{{ driver.adr_number || '—' }}</div>
          </v-col>
          <v-col cols="6" sm="4" md="3">
            <div class="text-caption text-medium-emphasis">Fecha vencimiento</div>
            <div class="d-flex align-center ga-2">
              <div class="text-body-1">{{ formatDate(driver.adr_expiry_date) }}</div>
              <v-chip
                v-if="driver.adr_expiry_date"
                :color="getEstado(driver.adr_expiry_date).color"
                size="x-small"
                variant="tonal"
              >
                {{ getEstado(driver.adr_expiry_date).label }}
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
import { formatDate } from '@/utils/format-helpers.js'

const props = defineProps({
  driver: { type: Object, required: true },
})

const { getEstadoDocumento: getEstado } = useDriverDocuments(props.driver.id)
</script>
