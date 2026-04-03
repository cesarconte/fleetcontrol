/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import VehicleDetailPanel from '@/components/map/VehicleDetailPanel.vue'

vi.mock('vuetify/components', () => {
  const VCard = { template: '<div><slot /></div>' }
  const VCardTitle = { template: '<h3><slot /></h3>' }
  const VCardText = { template: '<div><slot /></div>' }
  const VCardActions = { template: '<div><slot /></div>' }
  const VBtn = {
    props: ['color', 'variant', 'data-testid', 'onClick'],
    template: '<button :data-testid="data-testid" @click="$emit(\'click\')"><slot /></button>',
  }
  const VChip = {
    props: ['color', 'size'],
    template: '<span><slot /></span>',
  }
  const VDivider = { template: '<hr />' }
  const VIcon = { props: ['size'], template: '<i><slot /></i>' }
  return { VCard, VCardTitle, VCardText, VCardActions, VBtn, VChip, VDivider, VIcon }
})

describe('VehicleDetailPanel.vue', () => {
  const mockVehicle = {
    id: 'v1',
    vehicles: {
      id: 'v1',
      plate: '1234-ABC',
      status: 'on_route',
      brand: 'Volvo',
      model: 'FH16',
    },
    latitude: 40.4168,
    longitude: -3.7038,
    speed_kph: 85,
    recorded_at: '2026-04-03T10:00:00Z',
  }

  it('debería renderizar matrícula y estado', () => {
    const wrapper = mount(VehicleDetailPanel, {
      props: { vehicle: mockVehicle },
    })

    expect(wrapper.text()).toContain('1234-ABC')
    expect(wrapper.text()).toContain('En Ruta')
  })

  it('debería renderizar posición GPS', () => {
    const wrapper = mount(VehicleDetailPanel, {
      props: { vehicle: mockVehicle },
    })

    expect(wrapper.text()).toContain('40.4168')
    expect(wrapper.text()).toContain('-3.7038')
  })

  it('debería emitir view-detail al hacer click en ver ficha', async () => {
    const wrapper = mount(VehicleDetailPanel, {
      props: { vehicle: mockVehicle },
    })

    const btn = wrapper.find('[data-testid="view-detail"]')
    await btn.trigger('click')

    expect(wrapper.emitted('view-detail')).toBeTruthy()
    expect(wrapper.emitted('view-detail')[0]).toEqual(['v1'])
  })

  it('debería emitir close al hacer click en cerrar', async () => {
    const wrapper = mount(VehicleDetailPanel, {
      props: { vehicle: mockVehicle },
    })

    const btn = wrapper.find('[data-testid="close-panel"]')
    await btn.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('debería mostrar velocidad si está disponible', () => {
    const wrapper = mount(VehicleDetailPanel, {
      props: { vehicle: mockVehicle },
    })

    expect(wrapper.text()).toContain('85')
  })
})
