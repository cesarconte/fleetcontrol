/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import MapControls from '@/components/map/MapControls.vue'

vi.mock('vuetify/components', () => {
  const VBtn = {
    name: 'VBtn',
    props: ['color', 'variant', 'size', 'data-testid', 'onClick'],
    template: '<button :data-testid="dataTestId" @click="$emit(\'click\')"><slot /></button>',
  }
  const VChip = {
    name: 'VChip',
    props: ['color', 'variant', 'size', 'data-testid'],
    template: '<span :data-testid="dataTestId"><slot /></span>',
  }
  return { VBtn, VChip }
})

describe('MapControls.vue', () => {
  const defaultFilters = [
    { key: 'all', label: 'Todos', icon: 'mdi-map-marker' },
    { key: 'on_route', label: 'En Ruta', icon: 'mdi-truck-fast' },
  ]

  it('debería renderizar todos los filtros', () => {
    const wrapper = mount(MapControls, {
      props: {
        filters: defaultFilters,
        activeFilter: 'all',
      },
    })

    expect(wrapper.text()).toContain('Todos')
    expect(wrapper.text()).toContain('En Ruta')
  })

  it('debería marcar el filtro activo', () => {
    const wrapper = mount(MapControls, {
      props: {
        filters: defaultFilters,
        activeFilter: 'on_route',
      },
    })

    const chips = wrapper.findAll('[data-testid^="filter-"]')
    const activeChip = chips.find(c => c.attributes('data-testid') === 'filter-on_route')
    expect(activeChip.attributes('variant')).toBe('flat')
  })

  it('debería emitir update:activeFilter al hacer click', async () => {
    const wrapper = mount(MapControls, {
      props: {
        filters: defaultFilters,
        activeFilter: 'all',
      },
    })

    const btn = wrapper.find('[data-testid="filter-on_route"]')
    await btn.trigger('click')

    expect(wrapper.emitted('update:activeFilter')).toBeTruthy()
    expect(wrapper.emitted('update:activeFilter')[0]).toEqual(['on_route'])
  })
})
