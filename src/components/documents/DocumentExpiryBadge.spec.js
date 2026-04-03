/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DocumentExpiryBadge from './DocumentExpiryBadge.vue'

vi.mock('vuetify/components', () => ({
  VChip: {
    name: 'VChip',
    props: ['color', 'variant', 'size', 'data-testid'],
    template: '<span :data-testid="dataTestId" :class="`chip-${color}`"><slot /></span>',
  },
}))

function mountBadge(expiryDate) {
  return mount(DocumentExpiryBadge, { props: { expiryDate } })
}

describe('DocumentExpiryBadge.vue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-03T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('debería mostrar "Sin fecha" si no hay fecha', () => {
    const wrapper = mountBadge(null)
    expect(wrapper.text()).toBe('Sin fecha')
  })

  it('debería mostrar "Vencido hace X días" si ya venció', () => {
    const wrapper = mountBadge('2026-03-01')
    expect(wrapper.text()).toContain('Vencido hace')
  })

  it('debería mostrar "Hoy" si vence hoy', () => {
    const wrapper = mountBadge('2026-04-03')
    expect(wrapper.text()).toBe('Hoy')
  })

  it('debería mostrar "3 días" si vence en 3 días (crítico)', () => {
    const wrapper = mountBadge('2026-04-06')
    expect(wrapper.text()).toBe('3 días')
  })

  it('debería mostrar "15 días" si vence en 15 días (warning)', () => {
    const wrapper = mountBadge('2026-04-18')
    expect(wrapper.text()).toBe('15 días')
  })

  it('debería mostrar "45 días" si vence en 45 días (success)', () => {
    const wrapper = mountBadge('2026-05-18')
    expect(wrapper.text()).toBe('45 días')
  })

  it('debería tener atributo data-testid', () => {
    const wrapper = mountBadge('2027-01-01')
    expect(wrapper.find('[data-testid="document-expiry-badge"]').exists()).toBe(true)
  })
})
