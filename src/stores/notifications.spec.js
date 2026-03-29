import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotificationStore } from './notifications.js'

describe('useNotificationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('debería iniciar con items vacío', () => {
    const store = useNotificationStore()
    expect(store.items).toEqual([])
  })

  it('debería añadir una notificación con info()', () => {
    const store = useNotificationStore()
    store.info('Test')
    expect(store.items).toHaveLength(1)
    expect(store.items[0].message).toBe('Test')
    expect(store.items[0].type).toBe('info')
  })

  it('debería usar timeout por defecto de 4000ms para info', () => {
    const store = useNotificationStore()
    store.info('Test')
    expect(store.items[0].timeout).toBe(4000)
  })

  it('success() debería crear notificación tipo success', () => {
    const store = useNotificationStore()
    store.success('Operación completada')
    expect(store.items[0].type).toBe('success')
  })

  it('error() debería crear notificación tipo error con timeout 6000', () => {
    const store = useNotificationStore()
    store.error('Algo falló')
    expect(store.items[0].type).toBe('error')
    expect(store.items[0].timeout).toBe(6000)
  })

  it('warning() debería crear notificación tipo warning', () => {
    const store = useNotificationStore()
    store.warning('Cuidado')
    expect(store.items[0].type).toBe('warning')
  })

  it('info() debería crear notificación tipo info', () => {
    const store = useNotificationStore()
    store.info('Información')
    expect(store.items[0].type).toBe('info')
  })

  it('remove() debería eliminar una notificación por id', () => {
    const store = useNotificationStore()
    store.success('Test')
    const id = store.items[0].id
    store.remove(id)
    expect(store.items).toHaveLength(0)
  })
})
