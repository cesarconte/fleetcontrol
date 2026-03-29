import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notifications', () => {
  const items = ref([])

  function add({ message, type = 'info', timeout = 4000 }) {
    items.value.push({ id: Date.now(), message, type, timeout })
  }

  function success(message) {
    add({ message, type: 'success' })
  }

  function error(message) {
    add({ message, type: 'error', timeout: 6000 })
  }

  function warning(message) {
    add({ message, type: 'warning' })
  }

  function info(message) {
    add({ message, type: 'info' })
  }

  function remove(id) {
    items.value = items.value.filter(n => n.id !== id)
  }

  return { items, success, error, warning, info, remove }
})
