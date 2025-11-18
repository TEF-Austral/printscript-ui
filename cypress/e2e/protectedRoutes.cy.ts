import {AUTH0_USERNAME, AUTH0_PASSWORD} from "../../src/utils/constants";

describe('Protected routes test', () => {

    it('should redirect to login when accessing a protected route unauthenticated', () => {
        cy.visit('/');

        cy.wait(1000)

        cy.origin('https://tf-austral.us.auth0.com', () => {

            cy.contains('Log in to tf-austral to continue to ui.').should('exist');

            cy.url().should('include', '/u/login');
        });
    });

    it('should display login content', () => {
        cy.visit('/');

        cy.origin('https://tf-austral.us.auth0.com', () => {

            cy.contains('Continue').should('exist');

            cy.contains('Email address').should('exist');

            cy.url().should('include', '/u/login');
        });
    });

    it('should not redirect to login when the user is already authenticated', () => {
      cy.loginToAuth0(
          AUTH0_USERNAME,
          AUTH0_PASSWORD
      )

      cy.visit('/');

      cy.wait(1000)

      cy.url().should('not.include', '/login');
    });

})