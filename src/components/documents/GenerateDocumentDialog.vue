<template>
  <VDialog v-model="isOpen" max-width="600" persistent data-testid="generate-document-dialog">
    <VCard>
      <VCardTitle>Generar Documento de Transporte</VCardTitle>
      <VCardText>
        <VSelect
          v-model="form.documentType"
          :items="activeTypes"
          label="Tipo de documento"
          variant="outlined"
          item-title="label"
          item-value="value"
          :loading="loadingTypes"
          :rules="[v => !!v || 'Seleccione un tipo']"
          data-testid="generate-doc-type"
        />

        <VAutocomplete
          v-model="form.routeId"
          :items="routeOptions"
          label="Ruta"
          variant="outlined"
          item-title="label"
          item-value="value"
          :loading="loadingRoutes"
          class="mt-3"
          :rules="[v => !!v || 'Seleccione una ruta']"
          data-testid="generate-doc-route"
        />

        <VSelect
          v-if="cargoOptions.length > 0"
          v-model="form.cargoId"
          :items="cargoOptions"
          label="Carga (opcional)"
          variant="outlined"
          item-title="label"
          item-value="value"
          clearable
          class="mt-3"
          data-testid="generate-doc-cargo"
        />

        <VAlert
          v-if="generateError"
          type="error"
          variant="tonal"
          class="mt-3"
          data-testid="generate-doc-error"
        >
          {{ generateError }}
        </VAlert>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" data-testid="generate-doc-cancel" @click="close">Cancelar</VBtn>
        <VBtn
          color="primary"
          :loading="isGenerating"
          :disabled="!form.documentType || !form.routeId"
          data-testid="generate-doc-submit"
          @click="handleGenerate"
        >
          Generar PDF
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useDocumentTemplates } from '@/composables/use-document-templates.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  routeId: { type: String, default: '' },
  cargoId: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'generated'])

const { isGenerating, generateError, generateDocument, fetchTemplates, templates } =
  useDocumentTemplates()

const isOpen = ref(false)
const loadingTypes = ref(false)
const loadingRoutes = ref(false)

const form = reactive({
  documentType: '',
  routeId: '',
  cargoId: '',
})

const activeTypes = ref([])
const routeOptions = ref([])
const cargoOptions = ref([])

watch(
  () => props.modelValue,
  async val => {
    isOpen.value = val
    if (val) {
      form.documentType = ''
      form.routeId = props.routeId ?? ''
      form.cargoId = props.cargoId ?? ''
      await loadOptions()
    }
  },
)

watch(isOpen, val => {
  emit('update:modelValue', val)
})

async function loadOptions() {
  loadingTypes.value = true
  try {
    await fetchTemplates()

    // Mandatory professional types to ensure they always appear in the Spanish transport context
    const mandatoryTypes = [
      { value: 'documento_control', label: 'Documento de Control Administrativo (BOE)' },
      { value: 'carta_porte_nacional', label: 'Carta de Porte Nacional (LCTTM)' },
      { value: 'cmr', label: 'Carta de Porte Internacional (Convenio CMR)' },
      { value: 'adr', label: 'Carta de Porte ADR (Mercancías Peligrosas)' },
      { value: 'albaran', label: 'Albarán de Entrega (Nota de Entrega)' },
      { value: 'packing_list', label: 'Packing List / Listado de Contenido' },
      { value: 'pod', label: 'Prueba de Entrega (P.O.D. Certificado)' },
      { value: 'factura', label: 'Factura Proforma / Comercial' },
      { value: 'hoja_ruta', label: 'Hoja de Ruta / Plan de Viaje' },
      { value: 'cleaning_cert', label: 'Certificado de Limpieza de Cuba/Cisterna' },
    ]

    const dbTypes = templates.value.map(t => ({
      value: t.document_type,
      label: t.name,
    }))

    // Merge and remove duplicates by value (favoring mandatory translation labels)
    const allTypes = [...mandatoryTypes, ...dbTypes]
    activeTypes.value = Array.from(new Map(allTypes.map(item => [item.value, item])).values())
  } finally {
    loadingTypes.value = false
  }
  // Routes/cargo would be loaded from parent or via API
  // For now, expect routeOptions to be passed or loaded externally
}

function close() {
  isOpen.value = false
}

async function handleGenerate() {
  const result = await generateDocument({
    documentType: form.documentType,
    routeId: form.routeId,
    cargoId: form.cargoId || undefined,
  })
  emit('generated', result)
  close()
}
</script>
