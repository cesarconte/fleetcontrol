<template>
  <VContainer fluid>
    <h1 class="text-h4 mb-4">Configuración</h1>

    <VTabs v-model="activeTab" color="primary" class="mb-4" data-testid="settings-tabs">
      <VTab
        v-if="hasSettingsAccess(currentRole, 'empresa')"
        value="empresa"
        data-testid="settings-tab-empresa"
      >
        Empresa
      </VTab>
      <VTab
        v-if="hasSettingsAccess(currentRole, 'usuarios')"
        value="usuarios"
        data-testid="settings-tab-usuarios"
      >
        Usuarios
      </VTab>
      <VTab
        v-if="hasSettingsAccess(currentRole, 'alertas')"
        value="alertas"
        data-testid="settings-tab-alertas"
      >
        Alertas
      </VTab>
      <VTab
        v-if="hasSettingsAccess(currentRole, 'integraciones')"
        value="integraciones"
        data-testid="settings-tab-integraciones"
      >
        Integraciones
      </VTab>
      <VTab
        v-if="hasSettingsAccess(currentRole, 'documentos')"
        value="documentos"
        data-testid="settings-tab-documentos"
      >
        Documentos
      </VTab>
    </VTabs>

    <VWindow v-model="activeTab">
      <VWindowItem value="empresa">
        <CompanyForm @saved="handleSaved" />
      </VWindowItem>

      <VWindowItem value="usuarios">
        <UsersTable />
      </VWindowItem>

      <VWindowItem value="alertas">
        <AlertThresholdsForm @saved="handleSaved" />
      </VWindowItem>

      <VWindowItem value="integraciones">
        <IntegrationsForm @saved="handleSaved" />
      </VWindowItem>

      <VWindowItem value="documentos">
        <DocumentTemplatesForm />
      </VWindowItem>
    </VWindow>
  </VContainer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSettings } from '@/composables/use-settings.js'
import { hasSettingsAccess } from '@/constants/role-permissions.js'
import CompanyForm from '@/components/settings/CompanyForm.vue'
import UsersTable from '@/components/settings/UsersTable.vue'
import AlertThresholdsForm from '@/components/settings/AlertThresholdsForm.vue'
import IntegrationsForm from '@/components/settings/IntegrationsForm.vue'
import DocumentTemplatesForm from '@/components/settings/DocumentTemplatesForm.vue'

const { currentRole, fetchCompanySettings, fetchProfiles } = useSettings()

const activeTab = ref('empresa')

onMounted(async () => {
  await Promise.all([fetchCompanySettings(), fetchProfiles()])
})

function handleSaved() {
  fetchCompanySettings()
}
</script>
