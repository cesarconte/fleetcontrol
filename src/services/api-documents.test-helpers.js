/**
 * FleetControl — Mock helpers for api-documents tests.
 */

/**
 * Build a full mock chain that resolves with the given result.
 */
export function mockChain(supabase, result) {
  const chain = { then: undefined }
  Object.defineProperty(chain, 'then', {
    value: resolve => resolve(result),
    writable: true,
  })

  const methods = ['eq', 'gte', 'lte', 'in', 'or', 'limit']
  methods.forEach(m => {
    chain[m] = vi.fn().mockReturnValue(chain)
  })

  chain.range = vi.fn().mockReturnValue(chain)
  chain.order = vi.fn().mockReturnValue(chain)
  const select = vi.fn().mockReturnValue(chain)
  supabase.from.mockReturnValue({ select })

  return { select, chain }
}

/**
 * Mock search chain with or().limit() pattern.
 */
export function mockSearchChain(supabase, firstResult, secondResult) {
  const mockOr = vi.fn()
  const mockLimit = vi.fn()
  mockOr.mockReturnValue({ limit: mockLimit })
  mockLimit.mockResolvedValueOnce(firstResult).mockResolvedValueOnce(secondResult)

  const mockSelect = vi.fn().mockReturnValue({ or: mockOr })
  supabase.from.mockReturnValue({ select: mockSelect })

  return { mockOr, mockLimit, mockSelect }
}

/**
 * Mock KPI chain with two sequential select calls.
 */
export function mockKpiChain(supabase, vehicleData, driverData) {
  const mockSelect = vi.fn()
  supabase.from.mockReturnValue({
    select: mockSelect
      .mockResolvedValueOnce({ data: vehicleData, error: null })
      .mockResolvedValueOnce({ data: driverData, error: null }),
  })
  return mockSelect
}
