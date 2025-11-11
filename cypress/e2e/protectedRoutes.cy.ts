import {AUTH0_USERNAME, AUTH0_PASSWORD} from "../../src/utils/constants";

describe('Protected routes test', () => {
  it('should redirect to Auth0 login when accessing a protected route unauthenticated', () => {
    cy.visit('/');
    cy.url().should('include', Cypress.env('auth0_domain'));
    cy.origin(Cypress.env('auth0_domain'), () => {
      cy.get('input#username').should('be.visible');
      cy.get('input#password').should('be.visible');
    });
  });
  it('should not redirect to login when the user is already authenticated', () => {
    cy.loginToAuth0(
        AUTH0_USERNAME,
        AUTH0_PASSWORD
    )

    cy.visit('/');

    cy.wait(1000)
    cy.url().should('not.include', Cypress.env('auth0_domain'));
    cy.url().should('equal', Cypress.config('baseUrl') + '/');
  });

})