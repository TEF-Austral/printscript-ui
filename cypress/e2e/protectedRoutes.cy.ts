describe('Protected routes test', () => {
  it('should redirect to Auth0 login when accessing a protected route unauthenticated', () => {
    cy.clearAllSessionStorage()
    cy.clearAllLocalStorage()
    cy.clearAllCookies()
    cy.visit('/', { failOnStatusCode: false });
    cy.url({ timeout: 15000 }).should((url) => {
      expect(url).to.satisfy((url: string) =>
          url.includes(Cypress.env('auth0_domain')) ||
          url.includes('login') ||
          url === Cypress.config('baseUrl') + '/'
      )
    })
    cy.url().then((url) => {
      if (url.includes(Cypress.env('auth0_domain'))) {
        cy.origin(Cypress.env('auth0_domain'), () => {
          cy.get('input#username', { timeout: 10000 }).should('be.visible');
          cy.get('input#password', { timeout: 10000 }).should('be.visible');
        });
      }
    })
  });

  it('should not redirect to login when the user is already authenticated', () => {
    cy.loginToAuth0(
        Cypress.env('auth0_username'),
        Cypress.env('auth0_password')
    )

    cy.visit('/');

    cy.wait(1000)
    cy.url({ timeout: 10000 }).should('not.include', Cypress.env('auth0_domain'));
    cy.url().should('equal', Cypress.config('baseUrl') + '/');
  });
})