describe('Snippet Format and Analysis', () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it('should format a snippet', () => {
    cy.intercept('POST', SNIPPET_URL+"/format/preview*").as('formatSnippet');
    
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.get('button[aria-label="Format"]').click();
    
    cy.wait('@formatSnippet').its('response.statusCode').should('eq', 200);
  });

  it('should analyze snippet for compliance', () => {
    cy.intercept('GET', SNIPPET_URL+"/analyze*").as('analyzeSnippet');
    
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.get('button[aria-label="Analyze"]').click();
    
    cy.wait('@analyzeSnippet').its('response.statusCode').should('eq', 200);
  });

  it('should show compliance violations', () => {
    cy.intercept('GET', SNIPPET_URL+"/analyze*", {
      statusCode: 200,
      body: {
        isValid: false,
        violations: [
          { message: 'Violation 1', line: 1, column: 5 },
          { message: 'Violation 2', line: 2, column: 10 }
        ]
      }
    }).as('analyzeSnippet');
    
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.get('button[aria-label="Analyze"]').click();
    
    cy.wait('@analyzeSnippet');
    cy.contains('Found 2 issue(s)').should('be.visible');
    cy.contains('Line 1, Col 5').should('be.visible');
  });

  it('should show successful compliance check', () => {
    cy.intercept('GET', SNIPPET_URL+"/analyze*", {
      statusCode: 200,
      body: {
        isValid: true,
        violations: []
      }
    }).as('analyzeSnippet');
    
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.get('button[aria-label="Analyze"]').click();
    
    cy.wait('@analyzeSnippet');
    cy.contains('Code is valid and compliant').should('be.visible');
  });

  it('should download original snippet', () => {
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.get('button[aria-label="Download"]').click();
    cy.contains('button', 'Download Original').click();
    
    cy.contains('Snippet downloaded successfully').should('be.visible');
  });

  it('should download formatted snippet', () => {
    cy.intercept('POST', SNIPPET_URL+"/format/preview*").as('formatSnippet');
    
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.get('button[aria-label="Download"]').click();
    cy.contains('button', 'Download Formatted').click();
    
    cy.wait('@formatSnippet');
    cy.contains('Formatted snippet downloaded successfully').should('be.visible');
  });

  it('should close download modal', () => {
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.get('button[aria-label="Download"]').click();
    cy.contains('button', 'Cancel').click();
    
    cy.contains('Download Snippet').should('not.exist');
  });
});