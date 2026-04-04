/**
 * FleetControl — DocumentsListPage Tests
 *
 * Tests for the centralized documents management page.
 * Covers KPI rendering, tab switching, delete confirmation, and dialogs.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

// Mock the composable
const mockFetchKpis = vi.fn().mockResolvedValue(undefined)
const mockFetchDocuments = vi.fn().mockResolvedValue(undefined)
const mockClearFilters = vi.fn()
const mockSetPagination = vi.fn()
const mockFilterByStatus = vi.fn()
const mockExportToCsv = vi.fn()
const mockDeleteDocument = vi.fn().mockResolvedValue(undefined)
const mockCleanup = vi.fn()

vi.mock('@/composables/use-document-management.js', () => ({
  useDocumentManagement: () => ({
    activeTab: { value: 'vehicles' },
    kpis: {
      value: { total: 10, valid: 8, expiringSoon: 1, critical: 1, expired: 0, complianceRate: 80 },
    },
    filters: { docType: null, status: null, entityId: null, dateFrom: null, dateTo: null },
    searchQuery: { value: '' },
    pagination: { page: 1, pageSize: 25, total: 10, sortBy: 'expiry_date', sortAsc: true },
    items: { value: [] },
    isLoading: { value: false },
    fetchKpis: mockFetchKpis,
    fetchDocuments: mockFetchDocuments,
    clearFilters: mockClearFilters,
    setPagination: mockSetPagination,
    filterByStatus: mockFilterByStatus,
    exportToCsv: mockExportToCsv,
    deleteDocument: mockDeleteDocument,
    cleanup: mockCleanup,
  }),
}))

vi.mock('@/stores/notifications.js', () => ({
  useNotificationStore: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  }),
}))

// Stub child components
const stubComponents = {
  ReportKpiCard: {
    template: '<div class="kpi-card"><slot /></div>',
    props: ['label', 'formattedValue', 'color'],
  },
  DocumentFilterBar: { template: '<div class="filter-bar" />' },
  VehicleDocumentsTable: { template: '<div class="vehicle-docs-table" />' },
  DriverDocumentsTable: { template: '<div class="driver-docs-table" />' },
  GeneratedDocumentsTable: { template: '<div class="generated-docs-table" />' },
  GenerateDocumentDialog: { template: '<div class="generate-dialog" />' },
  DocumentActionsDialog: { template: '<div class="actions-dialog" />' },
}

describe('DocumentsListPage.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('debería renderizar la página con título', async () => {
    const { default: DocumentsListPage } = await import('./DocumentsListPage.vue')
    const wrapper = mount(DocumentsListPage, { global: { stubs: stubComponents } })

    expect(wrapper.text()).toContain('Documentación')
  })

  it('debería mostrar 6 KPI cards', async () => {
    const { default: DocumentsListPage } = await import('./DocumentsListPage.vue')
    const wrapper = mount(DocumentsListPage, { global: { stubs: stubComponents } })

    const kpiCards = wrapper.findAll('.kpi-card')
    expect(kpiCards).toHaveLength(6)
  })

  it('debería mostrar la barra de filtros', async () => {
    const { default: DocumentsListPage } = await import('./DocumentsListPage.vue')
    const wrapper = mount(DocumentsListPage, { global: { stubs: stubComponents } })

    expect(wrapper.find('.filter-bar').exists()).toBe(true)
  })

  it('debería mostrar el botón de generar documento', async () => {
    const { default: DocumentsListPage } = await import('./DocumentsListPage.vue')
    const wrapper = mount(DocumentsListPage, { global: { stubs: stubComponents } })

    const btn = wrapper.find('[data-testid="btn-generate-document"]')
    expect(btn.exists()).toBe(true)
    expect(btn.text()).toBe('Generar documento')
  })

  it('debería mostrar 3 pestañas (Vehículos, Conductores, Transporte)', async () => {
    const { default: DocumentsListPage } = await import('./DocumentsListPage.vue')
    const wrapper = mount(DocumentsListPage, { global: { stubs: stubComponents } })

    expect(wrapper.find('[data-testid="tab-vehicles"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="tab-drivers"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="tab-transport"]').exists()).toBe(true)
  })

  it('debería llamar a fetchKpis y fetchDocuments al montar', async () => {
    const { default: DocumentsListPage } = await import('./DocumentsListPage.vue')
    mount(DocumentsListPage, { global: { stubs: stubComponents } })

    await vi.waitFor(() => {
      expect(mockFetchKpis).toHaveBeenCalled()
      expect(mockFetchDocuments).toHaveBeenCalled()
    })
  })

  it('debería llamar a cleanup al desmontar', async () => {
    const { default: DocumentsListPage } = await import('./DocumentsListPage.vue')
    const wrapper = mount(DocumentsListPage, { global: { stubs: stubComponents } })

    wrapper.unmount()
    expect(mockCleanup).toHaveBeenCalled()
  })

  it('debería mostrar diálogo de confirmación al eliminar', async () => {
    const { default: DocumentsListPage } = await import('./DocumentsListPage.vue')
    const wrapper = mount(DocumentsListPage, { global: { stubs: stubComponents } })

    // Simulate delete action via handleAction
    const vm = wrapper.vm
    await vm.handleAction({ action: 'delete', item: { id: 'vd-1', doc_type: 'itv' } })

    expect(vm.showDeleteConfirm).toBe(true)
    expect(vm.documentToDelete.id).toBe('vd-1')
  })

  it('debería ejecutar eliminación al confirmar', async () => {
    const { default: DocumentsListPage } = await import('./DocumentsListPage.vue')
    const wrapper = mount(DocumentsListPage, { global: { stubs: stubComponents } })

    const vm = wrapper.vm
    await vm.handleAction({ action: 'delete', item: { id: 'vd-1', doc_type: 'itv' } })
    await vm.confirmDelete()

    expect(mockDeleteDocument).toHaveBeenCalledWith('vd-1', 'vehicle')
    expect(vm.showDeleteConfirm).toBe(false)
    expect(vm.documentToDelete).toBeNull()
  })

  it('debería cancelar eliminación al cancelar', async () => {
    const { default: DocumentsListPage } = await import('./DocumentsListPage.vue')
    const wrapper = mount(DocumentsListPage, { global: { stubs: stubComponents } })

    const vm = wrapper.vm
    await vm.handleAction({ action: 'delete', item: { id: 'vd-1', doc_type: 'itv' } })
    vm.cancelDelete()

    expect(vm.showDeleteConfirm).toBe(false)
    expect(vm.documentToDelete).toBeNull()
    expect(mockDeleteDocument).not.toHaveBeenCalled()
  })

  it('debería mostrar diálogo de acciones al ver documento', async () => {
    const { default: DocumentsListPage } = await import('./DocumentsListPage.vue')
    const wrapper = mount(DocumentsListPage, { global: { stubs: stubComponents } })

    const vm = wrapper.vm
    await vm.handleAction({ action: 'view', item: { id: 'vd-1' } })

    expect(vm.showActionsDialog).toBe(true)
    expect(vm.actionMode).toBe('view')
    expect(vm.selectedDocument.id).toBe('vd-1')
  })

  it('debería mostrar diálogo de acciones al editar documento', async () => {
    const { default: DocumentsListPage } = await import('./DocumentsListPage.vue')
    const wrapper = mount(DocumentsListPage, { global: { stubs: stubComponents } })

    const vm = wrapper.vm
    await vm.handleAction({ action: 'edit', item: { id: 'vd-1' } })

    expect(vm.showActionsDialog).toBe(true)
    expect(vm.actionMode).toBe('edit')
  })
})
