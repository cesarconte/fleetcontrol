<template>
  <div class="app-notifications">
    <transition-group name="notif">
      <v-snackbar
        v-for="item in notificationStore.items"
        :key="item.id"
        :model-value="true"
        :color="getColor(item.type)"
        :timeout="item.timeout"
        location="bottom right"
        multi-line
        :data-testid="`notification-${item.type}`"
        @update:model-value="handleClose(item.id)"
      >
        <div class="d-flex align-center">
          <v-icon class="mr-2" size="20">{{ getIcon(item.type) }}</v-icon>
          <span class="text-body-2">{{ item.message }}</span>
        </div>
        <template #actions>
          <v-btn
            icon="mdi-close"
            size="small"
            variant="text"
            data-testid="notification-dismiss"
            @click="handleClose(item.id)"
          />
        </template>
      </v-snackbar>
    </transition-group>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { useNotificationStore } from '@/stores/notifications.js'

const notificationStore = useNotificationStore()

function getColor(type) {
  const map = { success: 'success', error: 'error', warning: 'warning', info: 'info' }
  return map[type] ?? 'info'
}

function getIcon(type) {
  const map = {
    success: 'mdi-check-circle',
    error: 'mdi-alert-circle',
    warning: 'mdi-alert',
    info: 'mdi-information',
  }
  return map[type] ?? 'mdi-information'
}

function handleClose(id) {
  notificationStore.remove(id)
}

// Auto-dismiss on timeout
watch(
  () => notificationStore.items,
  items => {
    items.forEach(item => {
      if (!item._timer) {
        item._timer = setTimeout(() => {
          notificationStore.remove(item.id)
        }, item.timeout)
      }
    })
  },
  { deep: true },
)
</script>

<style scoped>
.notif-enter-active,
.notif-leave-active {
  transition: all 0.3s ease;
}

.notif-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notif-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
