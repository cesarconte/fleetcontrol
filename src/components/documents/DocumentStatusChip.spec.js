/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DocumentStatusChip from './DocumentStatusChip.vue'

vi.mock('vuetify/components', () => ({
  VChip: {
    name: 'VChip',
    props: ['color', 'variant', 'size', 'prependIcon', 'data-testid'],
    template: '<span :data-testid="dataTestId" :class="`chip-${color}`"><slot /></span>',
  },
}))

function mountChip(status) {
  return mount(DocumentStatusChip, { props: { status } })
}

describe('DocumentStatusChip.vue', () => {
  it('debería renderizar "En regla" para status valid', () => {
    const wrapper = mountChip('valid')
    expect(wrapper.text()).toContain('En regla')
  })

  it('debería renderizar "Próximo a vencer" para status expiring_soon', () => {
    const wrapper = mountChip('expiring_soon')
    expect(wrapper.text()).toContain('Próximo a vencer')
  })

  it('debería renderizar "Crítico" para status critical', () => {
    const wrapper = mountChip('critical')
    expect(wrapper.text()).toContain('Crítico')
  })

  it('debería renderizar "Vencido" para status expired', () => {
    const wrapper = mountChip('expired')
    expect(wrapper.text()).toContain('Vencido')
  })

  it('debería renderizar "No aplica" para status not_applicable', () => {
    const wrapper = mountChip('not_applicable')
    expect(wrapper.text()).toContain('No aplica')
  })

  it('debería tener atributo data-testid', () => {
    const wrapper = mountChip('valid')
    expect(wrapper.find('[data-testid="document-status-chip"]').exists()).toBe(true)
  })
})
