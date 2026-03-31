describe('Smoke Test', () => {
  it('la aplicación carga correctamente', () => {
    cy.visit('/')
    cy.document().its('contentType').should('equal', 'text/html')
  })
})
