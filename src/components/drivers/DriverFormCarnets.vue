<template>
  <v-expansion-panel title="Carnets y Certificaciones" value="carnets">
    <v-expansion-panel-text>
      <!-- Carnet de conducir -->
      <div class="text-subtitle-2 mb-3">Carnet de conducir (RDL 6/2015)</div>
      <v-row>
        <v-col cols="12" sm="6" md="3">
          <v-select
            :model-value="modelValue.license_class"
            :items="clasesCarnet"
            label="Clase"
            variant="outlined"
            clearable
            data-testid="driver-carnet-clase"
            @update:model-value="updateField('license_class', $event)"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-text-field
            :model-value="modelValue.license_number"
            label="Número de carnet"
            variant="outlined"
            maxlength="20"
            :error-messages="errors.license_number"
            data-testid="driver-carnet-numero"
            @update:model-value="updateField('license_number', $event)"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-text-field
            :model-value="modelValue.license_issue_date"
            label="Fecha de expedición"
            type="date"
            variant="outlined"
            data-testid="driver-carnet-fecha-expedicion"
            @update:model-value="updateField('license_issue_date', $event)"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-text-field
            :model-value="modelValue.license_expiry_date"
            label="Fecha de vencimiento"
            type="date"
            variant="outlined"
            data-testid="driver-carnet-fecha-vencimiento"
            @update:model-value="updateField('license_expiry_date', $event)"
          />
        </v-col>
      </v-row>

      <v-divider class="my-4" />

      <!-- CAP -->
      <div class="text-subtitle-2 mb-3">
        CAP — Certificado de Aptitud Profesional (RD 1032/2007)
      </div>
      <v-row>
        <v-col cols="12" sm="6" md="4">
          <v-text-field
            :model-value="modelValue.cap_number"
            label="Número CAP"
            variant="outlined"
            maxlength="20"
            :error-messages="errors.cap_number"
            data-testid="driver-cap-numero"
            @update:model-value="updateField('cap_number', $event)"
          />
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-text-field
            :model-value="modelValue.cap_expiry_date"
            label="Fecha de vencimiento"
            type="date"
            variant="outlined"
            data-testid="driver-cap-vencimiento"
            @update:model-value="updateField('cap_expiry_date', $event)"
          />
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-text-field
            :model-value="modelValue.cap_training_hours"
            label="Horas de formación"
            type="number"
            variant="outlined"
            :min="35"
            :error-messages="errors.cap_training_hours"
            data-testid="driver-cap-horas"
            @update:model-value="updateField('cap_training_hours', Number($event))"
          />
        </v-col>
      </v-row>

      <v-divider class="my-4" />

      <!-- Tarjeta tacógrafo -->
      <div class="text-subtitle-2 mb-3">
        Tarjeta de conductor — Tacógrafo digital (Reg. UE 165/2014)
      </div>
      <v-row>
        <v-col cols="12" sm="6">
          <v-text-field
            :model-value="modelValue.tachograph_card_number"
            label="Número de tarjeta"
            variant="outlined"
            maxlength="20"
            :error-messages="errors.tachograph_card_number"
            data-testid="driver-tacografo-numero"
            @update:model-value="updateField('tachograph_card_number', $event)"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field
            :model-value="modelValue.tachograph_card_expiry"
            label="Fecha de vencimiento"
            type="date"
            variant="outlined"
            data-testid="driver-tacografo-vencimiento"
            @update:model-value="updateField('tachograph_card_expiry', $event)"
          />
        </v-col>
      </v-row>

      <v-divider class="my-4" />

      <!-- Reconocimiento médico -->
      <div class="text-subtitle-2 mb-3">Reconocimiento médico (RD 818/2009)</div>
      <v-row>
        <v-col cols="12" sm="6">
          <v-text-field
            :model-value="modelValue.medical_exam_date"
            label="Fecha de reconocimiento"
            type="date"
            variant="outlined"
            data-testid="driver-medico-fecha"
            @update:model-value="updateField('medical_exam_date', $event)"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field
            :model-value="modelValue.medical_exam_expiry"
            label="Fecha de vencimiento"
            type="date"
            variant="outlined"
            data-testid="driver-medico-vencimiento"
            @update:model-value="updateField('medical_exam_expiry', $event)"
          />
        </v-col>
      </v-row>

      <v-divider class="my-4" />

      <!-- ADR -->
      <div class="text-subtitle-2 mb-3">Certificado ADR (ADR 2025 + RD 97/2014)</div>
      <v-row>
        <v-col cols="12" sm="6" md="4">
          <v-checkbox
            :model-value="modelValue.adr_certificate"
            label="¿Posee certificado ADR?"
            data-testid="driver-adr-check"
            @update:model-value="updateField('adr_certificate', $event)"
          />
        </v-col>
        <template v-if="modelValue.adr_certificate">
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              :model-value="modelValue.adr_number"
              label="Número de certificado ADR"
              variant="outlined"
              maxlength="20"
              :error-messages="errors.adr_number"
              data-testid="driver-adr-numero"
              @update:model-value="updateField('adr_number', $event)"
            />
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              :model-value="modelValue.adr_expiry_date"
              label="Fecha de vencimiento"
              type="date"
              variant="outlined"
              data-testid="driver-adr-vencimiento"
              @update:model-value="updateField('adr_expiry_date', $event)"
            />
          </v-col>
        </template>
      </v-row>
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>

<script setup>
import { CLASES_CARNET } from '@/constants/driver-document-types.js'

defineProps({
  modelValue: { type: Object, required: true },
  errors: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['update:modelValue', 'field-change'])

const clasesCarnet = CLASES_CARNET.map(c => ({ title: c, value: c }))

function updateField(field, value) {
  emit('field-change', { field, value })
}
</script>
