<template>
  <v-card>
    <v-card-title>Usuarios</v-card-title>
    <v-card-text>
      <v-data-table
        :headers="headers"
        :items="profiles"
        :loading="isLoading"
        item-value="id"
        data-testid="users-table"
      >
        <template #item.role="{ item }">
          <v-chip :color="getUserRoleColor(item.role)" size="small">
            {{ getUserRoleLabel(item.role) }}
          </v-chip>
        </template>

        <template #item.is_active="{ item }">
          <v-chip :color="item.is_active ? 'success' : 'error'" size="small" variant="tonal">
            {{ item.is_active ? 'Activo' : 'Inactivo' }}
          </v-chip>
        </template>

        <template #item.created_at="{ item }">
          {{ formatDate(item.created_at) }}
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex align-center ga-2">
            <v-select
              v-if="canManage"
              :model-value="item.role"
              :items="roleOptions"
              density="compact"
              variant="outlined"
              hide-details
              style="max-width: 180px"
              data-testid="user-role-select"
              @update:model-value="val => handleRoleChange(item.id, val)"
            />
            <v-btn
              v-if="canManage"
              :color="item.is_active ? 'error' : 'success'"
              variant="tonal"
              size="small"
              :data-testid="item.is_active ? 'user-deactivate' : 'user-reactivate'"
              @click="item.is_active ? handleDeactivate(item.id) : handleReactivate(item.id)"
            >
              {{ item.is_active ? 'Desactivar' : 'Reactivar' }}
            </v-btn>
          </div>
        </template>

        <template #loading>
          <v-skeleton-loader type="table-row@5" />
        </template>

        <template #no-data>
          <div class="text-center pa-6 text-medium-emphasis">No hay usuarios registrados</div>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useSettings } from '@/composables/use-settings.js'
import {
  canManageUsers,
  getUserRoleLabel,
  getUserRoleColor,
  USER_ROLES,
} from '@/constants/role-permissions.js'

const { profiles, isLoading, currentRole, updateUserRole, deactivateUser, reactivateUser } =
  useSettings()

const canManage = computed(() => canManageUsers(currentRole.value))

const headers = computed(() => {
  const base = [
    { title: 'Nombre', key: 'full_name' },
    { title: 'Email', key: 'email' },
    { title: 'Rol', key: 'role' },
    { title: 'Estado', key: 'is_active' },
    { title: 'Fecha alta', key: 'created_at' },
  ]
  if (canManage.value) {
    base.push({ title: 'Acciones', key: 'actions', sortable: false })
  }
  return base
})

const roleOptions = Object.values(USER_ROLES).map(r => ({ title: r.label, value: r.value }))

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-ES')
}

async function handleRoleChange(userId, role) {
  await updateUserRole(userId, role)
}

async function handleDeactivate(userId) {
  await deactivateUser(userId)
}

async function handleReactivate(userId) {
  await reactivateUser(userId)
}
</script>
