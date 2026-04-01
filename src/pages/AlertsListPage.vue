<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-4">
      <div class="d-flex align-center ga-3">
        <h1 class="text-h4">Alertas</h1>
        <VBadge
          v-if="activeCount > 0"
          :content="activeCount"
          color="error"
          inline
          data-testid="alerts-active-badge"
        />
      </div>
      <VBtn
        v-if="activeCount > 0"
        variant="outlined"
        :loading="isMarkingAll"
        data-testid="alerts-mark-all-read"
        @click="handleMarkAllAsRead"
      >
        <VIcon start>mdi-check-all</VIcon>
        Marcar todas como leídas
      </VBtn>
    </div>

    <!-- Alert list -->
    <AlertList
      :items="items"
      :total="total"
      :is-loading="isLoading"
      :page="page"
      :page-size="pageSize"
      :total-pages="totalPages"
      @set-page="setPage"
      @set-filters="setFilters"
      @reset-filters="handleResetFilters"
      @mark-as-read="handleMarkAsRead"
      @open-dismiss="openDismissDialog"
      @remove="handleRemove"
    />

    <!-- Dismiss dialog -->
    <AlertDismissDialog v-model="isDismissOpen" :alert="selectedAlert" @dismiss="handleDismiss" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAlerts } from '@/composables/use-alerts.js'
import AlertList from '@/components/alerts/AlertList.vue'
import AlertDismissDialog from '@/components/alerts/AlertDismissDialog.vue'

const {
  items,
  total,
  totalPages,
  isLoading,
  activeCount,
  page,
  pageSize,
  fetch,
  markAsRead,
  markAllAsRead,
  dismiss,
  remove,
  fetchActiveCount,
  setPage,
  setFilters,
  resetFilters,
} = useAlerts()

const isDismissOpen = ref(false)
const selectedAlert = ref(null)
const isMarkingAll = ref(false)

onMounted(() => {
  fetch()
  fetchActiveCount()
})

function handleResetFilters() {
  resetFilters()
  fetchActiveCount()
}

async function handleMarkAsRead(id) {
  await markAsRead(id)
  fetchActiveCount()
}

async function handleMarkAllAsRead() {
  isMarkingAll.value = true
  try {
    await markAllAsRead()
    fetchActiveCount()
  } finally {
    isMarkingAll.value = false
  }
}

function openDismissDialog(alert) {
  selectedAlert.value = alert
  isDismissOpen.value = true
}

async function handleDismiss(justification) {
  if (!selectedAlert.value) return
  await dismiss(selectedAlert.value.id, justification)
  isDismissOpen.value = false
  selectedAlert.value = null
  fetchActiveCount()
}

async function handleRemove(id) {
  await remove(id)
  fetchActiveCount()
}
</script>
