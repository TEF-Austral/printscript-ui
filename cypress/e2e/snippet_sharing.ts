import {SNIPPET_URL} from "../../src/utils/constants";
describe('Snippet Sharing', () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it('should open share modal', () => {
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.get('button[aria-label="Share"]').click();
    
    cy.contains('Share your snippet').should('be.visible');
  });

  it('should search for users to share with', () => {
    cy.intercept('GET', '/api/authorization/api/users*').as('searchUsers');
    
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.get('button[aria-label="Share"]').click();
    
    cy.get('input[label="Type the user\'s name"]').type('test');
    
    cy.wait(3000);
    cy.wait('@searchUsers');
  });

  it('should share snippet with read permission', () => {
    cy.intercept('POST', SNIPPET_URL+"/snippets/*/share").as('shareSnippet');
    cy.intercept('GET', '/api/authorization/api/users*').as('searchUsers');
    
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.get('button[aria-label="Share"]').click();
    
    cy.get('input[label="Type the user\'s name"]').type('test');
    cy.wait(3000);
    cy.wait('@searchUsers');
    
    cy.get('[role="option"]').first().click();
    cy.get('input[type="checkbox"][value="Read"]').check();
    
    cy.contains('button', 'Share').click();
    cy.wait('@shareSnippet').its('response.statusCode').should('eq', 200);
  });

  it('should share snippet with write permission', () => {
    cy.intercept('POST', SNIPPET_URL+"/snippets/*/share").as('shareSnippet');
    cy.intercept('GET', '/api/authorization/api/users*').as('searchUsers');
    
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.get('button[aria-label="Share"]').click();
    
    cy.get('input[label="Type the user\'s name"]').type('test');
    cy.wait(3000);
    cy.wait('@searchUsers');
    
    cy.get('[role="option"]').first().click();
    cy.get('input[type="checkbox"][value="Write"]').check();
    
    cy.contains('button', 'Share').click();
    cy.wait('@shareSnippet').its('response.statusCode').should('eq', 200);
  });

  it('should close share modal without sharing', () => {
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.get('button[aria-label="Share"]').click();
    
    cy.contains('button', 'Cancel').click();
    cy.contains('Share your snippet').should('not.exist');
  });

  it('should disable share button without user selection', () => {
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.get('button[aria-label="Share"]').click();
    
    cy.contains('button', 'Share').should('be.disabled');
  });
});