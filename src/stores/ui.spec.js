import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUiStore } from './ui.js'

describe('useUiStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('debería iniciar con sidebar no colapsado', () => {
    const store = useUiStore()
    expect(store.sidebarCollapsed).toBe(false)
  })

  it('debería iniciar con pageSize 25', () => {
    const store = useUiStore()
    expect(store.tablePageSize).toBe(25)
  })

  it('toggleSidebar debería alternar el estado', () => {
    const store = useUiStore()
    expect(store.sidebarCollapsed).toBe(false)
    store.toggleSidebar()
    expect(store.sidebarCollapsed).toBe(true)
    store.toggleSidebar()
    expect(store.sidebarCollapsed).toBe(false)
  })

  it('toggleMobileDrawer debería alternar el estado', () => {
    const store = useUiStore()
    expect(store.mobileDrawerOpen).toBe(false)
    store.toggleMobileDrawer()
    expect(store.mobileDrawerOpen).toBe(true)
    store.toggleMobileDrawer()
    expect(store.mobileDrawerOpen).toBe(false)
  })

  it('setTablePageSize debería actualizar el tamaño', () => {
    const store = useUiStore()
    store.setTablePageSize(50)
    expect(store.tablePageSize).toBe(50)
  })

  it('debería persistir sidebarCollapsed y tablePageSize', () => {
    const store = useUiStore()
    expect(store.$id).toBe('ui')
  })
})
