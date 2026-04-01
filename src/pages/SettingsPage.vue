<template>
  <div>
    <h1 class="text-h4 mb-4">Configuración</h1>

    <v-tabs v-model="activeTab" color="primary" class="mb-4" data-testid="settings-tabs">
      <v-tab
        v-if="hasSettingsAccess(currentRole, 'empresa')"
        value="empresa"
        data-testid="settings-tab-empresa"
      >
        Empresa
      </v-tab>
      <v-tab
        v-if="hasSettingsAccess(currentRole, 'usuarios')"
        value="usuarios"
        data-testid="settings-tab-usuarios"
      >
        Usuarios
      </v-tab>
      <v-tab
        v-if="hasSettingsAccess(currentRole, 'alertas')"
        value="alertas"
        data-testid="settings-tab-alertas"
      >
        Alertas
      </v-tab>
      <v-tab
        v-if="hasSettingsAccess(currentRole, 'integraciones')"
        value="integraciones"
        data-testid="settings-tab-integraciones"
      >
        Integraciones
      </v-tab>
    </v-tabs>

    <v-window v-model="activeTab">
      <v-window-item v-if="hasSettingsAccess(currentRole, 'empresa')" value="empresa">
        <CompanyForm :settings="companySettings" @saved="handleSaved" />
      </v-window-item>

      <v-window-item v-if="hasSettingsAccess(currentRole, 'usuarios')" value="usuarios">
        <UsersTable />
      </v-window-item>

      <v-window-item v-if="hasSettingsAccess(currentRole, 'alertas')" value="alertas">
        <AlertThresholdsForm :settings="companySettings" @saved="handleSaved" />
      </v-window-item>

      <v-window-item v-if="hasSettingsAccess(currentRole, 'integraciones')" value="integraciones">
        <IntegrationsForm :settings="companySettings" @saved="handleSaved" />
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSettings } from '@/composables/use-settings.js'
import { hasSettingsAccess } from '@/constants/role-permissions.js'
import CompanyForm from '@/components/settings/CompanyForm.vue'
import UsersTable from '@/components/settings/UsersTable.vue'
import AlertThresholdsForm from '@/components/settings/AlertThresholdsForm.vue'
import IntegrationsForm from '@/components/settings/IntegrationsForm.vue'

const { companySettings, currentRole, fetchCompanySettings, fetchProfiles } = useSettings()

const activeTab = ref('empresa')

onMounted(async () => {
  await Promise.all([fetchCompanySettings(), fetchProfiles()])
})

function handleSaved() {
  fetchCompanySettings()
}
</script>
