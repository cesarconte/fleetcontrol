/**
 * FleetControl — DocumentActionsDialog Component Tests
 *
 * @see docs/plans/feature-documentos-centralizados-plan.md — Fase 3
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DocumentActionsDialog from './DocumentActionsDialog.vue'

vi.mock('vuetify/components', () => ({
  VDialog: {
    name: 'VDialog',
    props: ['modelValue', 'maxWidth', 'persistent'],
    template: '<div class="v-dialog-stub"><slot /></div>',
  },
  VCard: { template: '<div class="v-card"><slot /></div>' },
  VCardTitle: { template: '<h2><slot /></h2>' },
  VCardText: { template: '<div><slot /></div>' },
  VCardActions: { template: '<div class="v-card-actions"><slot /></div>' },
  VForm: {
    name: 'VForm',
    template: '<form @submit.prevent="$emit(\'submit\')"><slot /></form>',
    methods: { validate: () => Promise.resolve({ valid: true }) },
  },
  VTextField: {
    name: 'VTextField',
    props: ['modelValue', 'label', 'type', 'rules'],
    template:
      '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" :data-testid="$attrs[\'data-testid\']" />',
    emits: ['update:modelValue'],
  },
  VTextarea: {
    name: 'VTextarea',
    props: ['modelValue', 'label'],
    template:
      '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" :data-testid="$attrs[\'data-testid\']"></textarea>',
    emits: ['update:modelValue'],
  },
  VAutocomplete: {
    name: 'VAutocomplete',
    props: ['modelValue', 'items', 'label'],
    template:
      '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)" :data-testid="$attrs[\'data-testid\']"></select>',
    emits: ['update:modelValue'],
  },
  VFileInput: {
    name: 'VFileInput',
    props: ['modelValue', 'label', 'accept'],
    template: '<input type="file" :data-testid="$attrs[\'data-testid\']" />',
  },
  VBtn: {
    name: 'VBtn',
    props: ['variant', 'color', 'loading', 'disabled'],
    template: '<button :data-testid="$attrs[\'data-testid\']"><slot /></button>',
  },
  VSpacer: { template: '<div style="flex:1"></div>' },
  VAlert: {
    name: 'VAlert',
    props: ['type', 'variant'],
    template: '<div :data-testid="$attrs[\'data-testid\']"><slot /></div>',
  },
}))

function mountComponent(props = {}, options = {}) {
  return mount(DocumentActionsDialog, {
    props: {
      modelValue: true,
      mode: 'create',
      document: null,
      entityType: 'vehicle',
      ...props,
    },
    ...options,
  })
}

describe('DocumentActionsDialog.vue', () => {
  it('debería renderizar en modo crear con título correcto', () => {
    const wrapper = mountComponent({ mode: 'create' })
    expect(wrapper.text()).toContain('Nuevo documento')
    expect(wrapper.find('[data-testid="doc-type-selector"]').exists()).toBe(true)
  })

  it('debería renderizar en modo editar con título correcto', () => {
    const wrapper = mountComponent({ mode: 'edit' })
    expect(wrapper.text()).toContain('Editar documento')
  })

  it('debería renderizar en modo ver con título correcto', () => {
    const wrapper = mountComponent({ mode: 'view' })
    expect(wrapper.text()).toContain('Detalle del documento')
  })

  it('debería precargar datos del documento en modo editar', async () => {
    const doc = {
      docType: 'itv',
      referenceNumber: 'ITV-2024-001',
      issueDate: '2024-01-15',
      expiryDate: '2025-01-15',
      notes: 'Primera ITV',
    }
    const wrapper = mountComponent({ mode: 'edit', document: doc })
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.form.docType).toBe('itv')
    expect(wrapper.vm.form.referenceNumber).toBe('ITV-2024-001')
  })

  it('debería emitir update:modelValue(false) al cancelar', async () => {
    const wrapper = mountComponent()
    const cancelBtn = wrapper.find('[data-testid="dialog-cancel"]')
    await cancelBtn.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
  })

  it('debería mostrar error del servidor si existe', async () => {
    const wrapper = mountComponent()
    wrapper.vm.serverError = 'Error de validación'
    await wrapper.vm.$nextTick()
    const alert = wrapper.find('[data-testid="server-error"]')
    expect(alert.exists()).toBe(true)
    expect(alert.text()).toBe('Error de validación')
  })

  it('debería limpiar formulario al abrir en modo crear sin documento', async () => {
    const wrapper = mountComponent({ mode: 'create', document: null })
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.form.docType).toBe('')
    expect(wrapper.vm.form.referenceNumber).toBe('')
    expect(wrapper.vm.form.expiryDate).toBe('')
  })
})
