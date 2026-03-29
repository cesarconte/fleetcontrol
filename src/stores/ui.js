import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUiStore = defineStore(
  'ui',
  () => {
    const sidebarCollapsed = ref(false)
    const tablePageSize = ref(25)

    function toggleSidebar() {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }

    function setTablePageSize(size) {
      tablePageSize.value = size
    }

    return {
      sidebarCollapsed,
      tablePageSize,
      toggleSidebar,
      setTablePageSize,
    }
  },
  {
    persist: {
      key: 'fleetcontrol-ui',
      storage: localStorage,
      paths: ['sidebarCollapsed', 'tablePageSize'],
    },
  },
)
