<template>
  <v-expansion-panel title="Carnets y Certificaciones" value="carnets">
    <v-expansion-panel-text>
      <!-- Carnet de conducir -->
      <div class="text-subtitle-2 mb-3">Carnet de conducir (RDL 6/2015)</div>
      <v-row>
        <v-col cols="12" sm="6" md="3">
          <v-select
            :model-value="modelValue.carnet_clase"
            :items="clasesCarnet"
            label="Clase"
            variant="outlined"
            clearable
            data-testid="driver-carnet-clase"
            @update:model-value="updateField('carnet_clase', $event)"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-text-field
            :model-value="modelValue.carnet_numero"
            label="Número de carnet"
            variant="outlined"
            maxlength="20"
            :error-messages="errors.carnet_numero"
            data-testid="driver-carnet-numero"
            @update:model-value="updateField('carnet_numero', $event)"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-text-field
            :model-value="modelValue.carnet_fecha_expedicion"
            label="Fecha de expedición"
            type="date"
            variant="outlined"
            data-testid="driver-carnet-fecha-expedicion"
            @update:model-value="updateField('carnet_fecha_expedicion', $event)"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-text-field
            :model-value="modelValue.carnet_fecha_vencimiento"
            label="Fecha de vencimiento"
            type="date"
            variant="outlined"
            data-testid="driver-carnet-fecha-vencimiento"
            @update:model-value="updateField('carnet_fecha_vencimiento', $event)"
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
            :model-value="modelValue.cap_numero"
            label="Número CAP"
            variant="outlined"
            maxlength="20"
            :error-messages="errors.cap_numero"
            data-testid="driver-cap-numero"
            @update:model-value="updateField('cap_numero', $event)"
          />
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-text-field
            :model-value="modelValue.cap_fecha_vencimiento"
            label="Fecha de vencimiento"
            type="date"
            variant="outlined"
            data-testid="driver-cap-vencimiento"
            @update:model-value="updateField('cap_fecha_vencimiento', $event)"
          />
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-text-field
            :model-value="modelValue.cap_horas_formacion"
            label="Horas de formación"
            type="number"
            variant="outlined"
            :min="35"
            :error-messages="errors.cap_horas_formacion"
            data-testid="driver-cap-horas"
            @update:model-value="updateField('cap_horas_formacion', Number($event))"
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
            :model-value="modelValue.tarjeta_tacografo_numero"
            label="Número de tarjeta"
            variant="outlined"
            maxlength="20"
            :error-messages="errors.tarjeta_tacografo_numero"
            data-testid="driver-tacografo-numero"
            @update:model-value="updateField('tarjeta_tacografo_numero', $event)"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field
            :model-value="modelValue.tarjeta_tacografo_vencimiento"
            label="Fecha de vencimiento"
            type="date"
            variant="outlined"
            data-testid="driver-tacografo-vencimiento"
            @update:model-value="updateField('tarjeta_tacografo_vencimiento', $event)"
          />
        </v-col>
      </v-row>

      <v-divider class="my-4" />

      <!-- Reconocimiento médico -->
      <div class="text-subtitle-2 mb-3">Reconocimiento médico (RD 818/2009)</div>
      <v-row>
        <v-col cols="12" sm="6">
          <v-text-field
            :model-value="modelValue.reconocimiento_medico_fecha"
            label="Fecha de reconocimiento"
            type="date"
            variant="outlined"
            data-testid="driver-medico-fecha"
            @update:model-value="updateField('reconocimiento_medico_fecha', $event)"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field
            :model-value="modelValue.reconocimiento_medico_vencimiento"
            label="Fecha de vencimiento"
            type="date"
            variant="outlined"
            data-testid="driver-medico-vencimiento"
            @update:model-value="updateField('reconocimiento_medico_vencimiento', $event)"
          />
        </v-col>
      </v-row>

      <v-divider class="my-4" />

      <!-- ADR -->
      <div class="text-subtitle-2 mb-3">Certificado ADR (ADR 2025 + RD 97/2014)</div>
      <v-row>
        <v-col cols="12" sm="6" md="4">
          <v-checkbox
            :model-value="modelValue.adr_certificado"
            label="¿Posee certificado ADR?"
            data-testid="driver-adr-check"
            @update:model-value="updateField('adr_certificado', $event)"
          />
        </v-col>
        <template v-if="modelValue.adr_certificado">
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              :model-value="modelValue.adr_numero"
              label="Número de certificado ADR"
              variant="outlined"
              maxlength="20"
              :error-messages="errors.adr_numero"
              data-testid="driver-adr-numero"
              @update:model-value="updateField('adr_numero', $event)"
            />
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              :model-value="modelValue.adr_fecha_vencimiento"
              label="Fecha de vencimiento"
              type="date"
              variant="outlined"
              data-testid="driver-adr-vencimiento"
              @update:model-value="updateField('adr_fecha_vencimiento', $event)"
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
