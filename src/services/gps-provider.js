/**
 * FleetControl — GPS Provider Interface
 *
 * Interfaz abstracta para proveedores GPS.
 * Todos los adapters (MockGpsProvider, WebfleetAdapter, etc.)
 * deben extender esta clase e implementar sus métodos.
 *
 * @see docs/plans/feature-mapa-plan.md — Tarea 1.3
 */

export class GpsProvider {
  /**
   * Obtiene el histórico de posiciones de un vehículo.
   * @param {string} vehicleId
   * @param {{ from: Date, to: Date }} range
   * @returns {Promise<Array>} Array de posiciones
   */
  async getPositions(_vehicleId, { from: _from, to: _to }) {
    throw new Error('Not implemented')
  }

  async getLatestPosition(_vehicleId) {
    throw new Error('Not implemented')
  }

  async getFleetPositions() {
    throw new Error('Not implemented')
  }

  async ingestPosition(_data) {
    throw new Error('Not implemented')
  }

  async ingestBatch(_positions) {
    throw new Error('Not implemented')
  }
}
