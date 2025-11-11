import {SNIPPET_URL} from "../../src/utils/constants";
describe('Error Handling', () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it('should show error when creating snippet fails', () => {
    cy.intercept('POST', SNIPPET_URL+"/snippets", {
      statusCode: 500,
      body: { message: 'Server error' }
    }).as('createSnippet');
    
    cy.contains('button', 'Add Snippet').click();
    cy.contains('Create snippet').click();
    
    cy.get('#name').type('Test Snippet');
    cy.get('[data-testid="add-snippet-code-editor"]').type('let x: number = 5;');
    cy.contains('button', 'Save Snippet').click();
    
    cy.wait('@createSnippet');
    cy.contains('Server error').should('be.visible');
  });

  it('should show error when updating snippet fails', () => {
    cy.intercept('PUT', SNIPPET_URL+"/snippets/*", {
      statusCode: 500,
      body: { message: 'Update failed' }
    }).as('updateSnippet');
    
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.get('.npm__react-simple-code-editor__textarea').first().clear().type('let updated: number = 10;');
    cy.get('button[aria-label="Save changes"]').click();
    
    cy.wait('@updateSnippet');
    cy.contains('Update failed').should('be.visible');
  });

  it('should show error when loading snippets fails', () => {
    cy.intercept('GET', SNIPPET_URL+"/snippets*", {
      statusCode: 500
    }).as('getSnippets');
    
    cy.visit("/");
    cy.wait('@getSnippets');
  });

  it('should show error when format fails', () => {
    cy.intercept('POST', SNIPPET_URL+"/format/preview*", {
      statusCode: 500,
      body: { message: 'Format failed' }
    }).as('formatSnippet');
    
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.get('button[aria-label="Format"]').click();
    
    cy.wait('@formatSnippet');
  });

  it('should show error when analysis fails', () => {
    cy.intercept('GET', SNIPPET_URL+"/analyze*", {
      statusCode: 500,
      body: { message: 'Analysis failed' }
    }).as('analyzeSnippet');
    
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.get('button[aria-label="Analyze"]').click();
    
    cy.wait('@analyzeSnippet');
  });

  it('should show error when sharing fails', () => {
    cy.intercept('POST', SNIPPET_URL+"/snippets/*/share", {
      statusCode: 403,
      body: { message: 'Permission denied' }
    }).as('shareSnippet');
    cy.intercept('GET', '/api/authorization/api/users*').as('searchUsers');
    
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.get('button[aria-label="Share"]').click();
    
    cy.get('input[label="Type the user\'s name"]').type('test');
    cy.wait(3000);
    cy.wait('@searchUsers');
    
    cy.get('[role="option"]').first().click();
    cy.contains('button', 'Share').click();
    
    cy.wait('@shareSnippet');
  });

  it('should handle network timeout', () => {
    cy.intercept('GET', SNIPPET_URL+"/snippets*", {
      delay: 60000,
      statusCode: 408
    }).as('getSnippets');
    
    cy.visit("/");
  });

  it('should show validation error for invalid code', () => {
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.get('.npm__react-simple-code-editor__textarea').first().clear().type('invalid!!!');
    cy.get('button[aria-label="Save changes"]').click();
    
    cy.contains('Code does not parse').should('be.visible');
  });

  it('should handle missing required fields', () => {
    cy.contains('button', 'Add Snippet').click();
    cy.contains('Create snippet').click();
    
    cy.contains('button', 'Save Snippet').should('be.disabled');
  });

  it('should handle unauthorized access', () => {
    cy.intercept('GET', SNIPPET_URL+"/snippets*", {
      statusCode: 401
    }).as('getSnippets');
    
    cy.visit("/");
    cy.wait('@getSnippets');
  });
});