import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUiStore = defineStore(
  'ui',
  () => {
    const sidebarCollapsed = ref(false)
    const mobileDrawerOpen = ref(false)
    const tablePageSize = ref(25)

    function toggleSidebar() {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }

    function toggleMobileDrawer() {
      mobileDrawerOpen.value = !mobileDrawerOpen.value
    }

    function setTablePageSize(size) {
      tablePageSize.value = size
    }

    return {
      sidebarCollapsed,
      mobileDrawerOpen,
      tablePageSize,
      toggleSidebar,
      toggleMobileDrawer,
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
