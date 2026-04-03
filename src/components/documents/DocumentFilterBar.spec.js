/**
 * FleetControl — DocumentFilterBar Component Tests
 *
 * @see docs/plans/feature-documentos-centralizados-plan.md — Fase 3
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DocumentFilterBar from './DocumentFilterBar.vue'

vi.mock('vuetify/components', () => ({
  VTextField: {
    name: 'VTextField',
    props: [
      'modelValue',
      'label',
      'placeholder',
      'prependInnerIcon',
      'clearable',
      'density',
      'hideDetails',
      'type',
    ],
    template:
      '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" :data-testid="$attrs[\'data-testid\']" />',
    emits: ['update:modelValue'],
  },
  VAutocomplete: {
    name: 'VAutocomplete',
    props: ['modelValue', 'items', 'label', 'density', 'clearable', 'hideDetails'],
    template:
      '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)" :data-testid="$attrs[\'data-testid\']"></select>',
    emits: ['update:modelValue'],
  },
  VBtn: {
    name: 'VBtn',
    props: ['variant', 'size', 'prependIcon'],
    template: '<button :data-testid="$attrs[\'data-testid\']"><slot /></button>',
  },
  VRow: { template: '<div><slot /></div>' },
  VCol: { template: '<div><slot /></div>' },
  VIcon: { props: ['icon', 'size'], template: '<i />' },
}))

function mountComponent(props = {}, options = {}) {
  return mount(DocumentFilterBar, {
    props: {
      tab: 'vehicles',
      modelValue: {},
      search: '',
      ...props,
    },
    ...options,
  })
}

describe('DocumentFilterBar.vue', () => {
  it('debería renderizar con todos los filtros', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('[data-testid="document-search"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="filter-doc-type"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="filter-status"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="filter-date-from"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="filter-date-to"]').exists()).toBe(true)
  })

  it('debería emitir update:search al escribir con debounce', async () => {
    vi.useFakeTimers()
    const wrapper = mountComponent()
    const vm = wrapper.vm
    vm.onSearchUpdate('ABC')
    expect(wrapper.emitted('update:search')).toBeUndefined()
    vi.advanceTimersByTime(350)
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:search')).toBeTruthy()
    expect(wrapper.emitted('update:search')[0]).toEqual(['ABC'])
    vi.useRealTimers()
  })

  it('debería emitir update:modelValue al cambiar filtro', async () => {
    const wrapper = mountComponent()
    const vm = wrapper.vm
    vm.localFilters.status = 'expired'
    vm.applyFilters()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0][0]).toHaveProperty('status', 'expired')
  })

  it('debería emitir clear al limpiar filtros', async () => {
    const wrapper = mountComponent()
    const clearBtn = wrapper.find('[data-testid="clear-filters"]')
    await clearBtn.trigger('click')
    expect(wrapper.emitted('clear')).toBeTruthy()
    expect(wrapper.emitted('update:search')[0]).toEqual([''])
  })

  it('debería emitir export al hacer clic en exportar', async () => {
    const wrapper = mountComponent()
    const exportBtn = wrapper.find('[data-testid="export-csv"]')
    await exportBtn.trigger('click')
    expect(wrapper.emitted('export')).toBeTruthy()
  })

  it('debería mostrar tipos de documento de vehículos cuando tab=vehicles', () => {
    const wrapper = mountComponent({ tab: 'vehicles' })
    const docTypeSelect = wrapper.find('[data-testid="filter-doc-type"]')
    expect(docTypeSelect.exists()).toBe(true)
  })

  it('debería mostrar tipos de documento de conductores cuando tab=drivers', () => {
    const wrapper = mountComponent({ tab: 'drivers' })
    const docTypeSelect = wrapper.find('[data-testid="filter-doc-type"]')
    expect(docTypeSelect.exists()).toBe(true)
  })

  it('debería mostrar tipos de documento de transporte cuando tab=transport', () => {
    const wrapper = mountComponent({ tab: 'transport' })
    const docTypeSelect = wrapper.find('[data-testid="filter-doc-type"]')
    expect(docTypeSelect.exists()).toBe(true)
  })
})
