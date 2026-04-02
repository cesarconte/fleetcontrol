<template>
  <VCard>
    <VCardTitle>Plantillas de Documentos de Transporte</VCardTitle>
    <VCardText>
      <VSkeletonLoader v-if="isLoading" type="list-item@6" />
      <VExpansionPanels
        v-else-if="isEditable"
        variant="accordion"
        data-testid="document-templates-panels"
      >
        <VExpansionPanel
          v-for="template in templates"
          :key="template.id"
          data-testid="document-template-panel"
        >
          <VExpansionPanelTitle>
            <VIcon start>{{ getDocIcon(template.document_type) }}</VIcon>
            {{ template.name }}
            <VChip
              class="ml-auto mr-4"
              :color="template.is_active ? 'success' : 'grey'"
              size="small"
            >
              {{ template.is_active ? 'Activo' : 'Inactivo' }}
            </VChip>
          </VExpansionPanelTitle>
          <VExpansionPanelText>
            <div class="text-body-2 text-medium-emphasis mb-3">
              {{ template.description || 'Sin descripción' }}
            </div>
            <div class="text-caption text-uppercase mb-1">Tipo</div>
            <div class="text-body-2 mb-3">{{ template.document_type }}</div>
            <VSwitch
              :model-value="template.is_active"
              :label="template.is_active ? 'Activo' : 'Inactivo'"
              color="success"
              hide-details
              data-testid="document-template-toggle"
              @update:model-value="handleToggle(template.id, $event)"
            />
          </VExpansionPanelText>
        </VExpansionPanel>
      </VExpansionPanels>

      <!-- Read-only display -->
      <VExpansionPanels v-else variant="accordion">
        <VExpansionPanel v-for="template in templates" :key="template.id" :title="template.name">
          <VExpansionPanelText>
            <VRow>
              <VCol cols="12" sm="6">
                <div class="text-caption text-uppercase text-medium-emphasis">Tipo</div>
                <div class="text-body-1">{{ template.document_type }}</div>
              </VCol>
              <VCol cols="12" sm="6">
                <div class="text-caption text-uppercase text-medium-emphasis">Estado</div>
                <VChip :color="template.is_active ? 'success' : 'grey'" size="small">
                  {{ template.is_active ? 'Activo' : 'Inactivo' }}
                </VChip>
              </VCol>
            </VRow>
          </VExpansionPanelText>
        </VExpansionPanel>
      </VExpansionPanels>
    </VCardText>
  </VCard>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDocumentTemplates } from '@/composables/use-document-templates.js'
import { useSettings } from '@/composables/use-settings.js'
import { canEditIntegrations } from '@/constants/role-permissions.js'
import { computed } from 'vue'
import { TRANSPORT_DOCUMENT_TYPES } from '@/constants/transport-document-types.js'

const store = useSettings()
const { templates, isLoading, fetchTemplates, toggleTemplate } = useDocumentTemplates()

const isEditable = computed(() => canEditIntegrations(store.currentRole))

onMounted(() => {
  fetchTemplates()
})

function getDocIcon(type) {
  return TRANSPORT_DOCUMENT_TYPES[type.toUpperCase()]?.icon ?? 'mdi-file-document-outline'
}

async function handleToggle(id, isActive) {
  await toggleTemplate(id, isActive)
}
</script>
