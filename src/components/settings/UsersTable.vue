<template>
  <VCard>
    <VCardTitle class="d-flex justify-space-between align-center">
      Usuarios
      <VBtn
        v-if="canManage"
        color="primary"
        size="small"
        data-testid="user-add-btn"
        @click="openCreateDialog"
      >
        <VIcon start>mdi-plus</VIcon>
        Añadir
      </VBtn>
    </VCardTitle>
    <VCardText>
      <VDataTable
        :headers="headers"
        :items="profiles"
        :loading="isLoading"
        item-value="id"
        hover
        data-testid="users-table"
      >
        <template #item.role="{ item }">
          <VChip :color="getUserRoleColor(item.role)" size="small">
            {{ getUserRoleLabel(item.role) }}
          </VChip>
        </template>

        <template #item.is_active="{ item }">
          <VChip :color="item.is_active ? 'success' : 'error'" size="small" variant="tonal">
            {{ item.is_active ? 'Activo' : 'Inactivo' }}
          </VChip>
        </template>

        <template #item.created_at="{ item }">
          {{ formatDate(item.created_at) }}
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex align-center ga-2">
            <VSelect
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
            <VBtn
              v-if="canManage"
              :color="item.is_active ? 'error' : 'success'"
              variant="tonal"
              size="small"
              :data-testid="item.is_active ? 'user-deactivate' : 'user-reactivate'"
              @click="confirmToggleActive(item)"
            >
              {{ item.is_active ? 'Desactivar' : 'Reactivar' }}
            </VBtn>
          </div>
        </template>

        <template #loading>
          <VSkeletonLoader type="table-row@5" />
        </template>

        <template #no-data>
          <div class="text-center pa-6 text-medium-emphasis">No hay usuarios registrados</div>
        </template>
      </VDataTable>
    </VCardText>

    <!-- Confirm deactivate/reactivate dialog -->
    <VDialog v-model="confirmOpen" max-width="400" persistent data-testid="user-confirm-dialog">
      <VCard>
        <VCardTitle>
          {{ confirmUser?.is_active ? 'Desactivar usuario' : 'Reactivar usuario' }}
        </VCardTitle>
        <VCardText>
          ¿Seguro que quieres {{ confirmUser?.is_active ? 'desactivar' : 'reactivar' }} a
          <strong>{{ confirmUser?.full_name }}</strong>
          ?
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" data-testid="user-confirm-cancel" @click="confirmOpen = false">
            Cancelar
          </VBtn>
          <VBtn
            :color="confirmUser?.is_active ? 'error' : 'success'"
            :loading="isToggling"
            data-testid="user-confirm-accept"
            @click="executeToggle"
          >
            {{ confirmUser?.is_active ? 'Desactivar' : 'Reactivar' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Create user dialog -->
    <VDialog v-model="createOpen" max-width="500" persistent data-testid="user-create-dialog">
      <VCard>
        <VCardTitle>Nuevo usuario</VCardTitle>
        <VCardText>
          <VForm ref="createFormRef" @submit.prevent="handleCreate">
            <VTextField
              v-model="createForm.email"
              label="Email *"
              type="email"
              :rules="[
                v => !!v || 'Email obligatorio',
                v => /.+@.+\..+/.test(v) || 'Email inválido',
              ]"
              variant="outlined"
              class="mb-3"
              data-testid="user-create-email"
            />
            <VTextField
              v-model="createForm.full_name"
              label="Nombre completo *"
              :rules="[v => !!v || 'Nombre obligatorio']"
              variant="outlined"
              class="mb-3"
              data-testid="user-create-name"
            />
            <VSelect
              v-model="createForm.role"
              :items="roleOptions"
              label="Rol *"
              :rules="[v => !!v || 'Rol obligatorio']"
              variant="outlined"
              data-testid="user-create-role"
            />
          </VForm>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" data-testid="user-create-cancel" @click="createOpen = false">
            Cancelar
          </VBtn>
          <VBtn
            color="primary"
            :loading="isCreating"
            data-testid="user-create-submit"
            @click="handleCreate"
          >
            Crear
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VCard>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
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

// Confirm dialog
const confirmOpen = ref(false)
const confirmUser = ref(null)
const isToggling = ref(false)

function confirmToggleActive(user) {
  confirmUser.value = user
  confirmOpen.value = true
}

async function executeToggle() {
  if (!confirmUser.value) return
  isToggling.value = true
  try {
    if (confirmUser.value.is_active) {
      await deactivateUser(confirmUser.value.id)
    } else {
      await reactivateUser(confirmUser.value.id)
    }
  } finally {
    isToggling.value = false
    confirmOpen.value = false
    confirmUser.value = null
  }
}

// Create dialog
const createOpen = ref(false)
const createFormRef = ref(null)
const isCreating = ref(false)
const createForm = reactive({ email: '', full_name: '', role: 'traffic_agent' })

function openCreateDialog() {
  createForm.email = ''
  createForm.full_name = ''
  createForm.role = 'traffic_agent'
  createOpen.value = true
}

async function handleCreate() {
  const { valid } = await createFormRef.value?.validate()
  if (!valid) return
  isCreating.value = true
  try {
    // In MVP, user creation is done via Supabase Auth invite
    // For now, show a notification that the feature requires Supabase Admin API
    // The profile will be created when the user signs up
    // User creation requires Supabase Admin API
  } finally {
    isCreating.value = false
    createOpen.value = false
  }
}

async function handleRoleChange(userId, role) {
  await updateUserRole(userId, role)
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-ES')
}
</script>
