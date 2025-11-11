describe('Snippet Filters', () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it('should filter by ownership', () => {
    cy.intercept('GET', SNIPPET_URL+"/snippets*").as('getSnippets');
    
    cy.get('label').contains('Ownership').parent().find('select').click();
    cy.contains('li', 'Owned').click();
    
    cy.wait('@getSnippets').its('request.url').should('include', 'ownership=OWNED');
  });

  it('should filter by snippet name', () => {
    cy.intercept('GET', SNIPPET_URL+"/snippets*").as('getSnippets');
    
    cy.get('input[label="Search by name"]').type('Test{enter}');
    
    cy.wait('@getSnippets').its('request.url').should('include', 'name=Test');
  });

  it('should filter by language', () => {
    cy.intercept('GET', SNIPPET_URL+"/snippets*").as('getSnippets');
    
    cy.get('label').contains('Language').parent().find('select').click();
    cy.contains('li', 'PRINTSCRIPT').click();
    
    cy.wait('@getSnippets').its('request.url').should('include', 'language=PRINTSCRIPT');
  });

  it('should filter by compliance status', () => {
    cy.intercept('GET', SNIPPET_URL+"/snippets*").as('getSnippets');
    
    cy.get('label').contains('Compliance').parent().find('select').click();
    cy.contains('li', 'Compliant').click();
    
    cy.wait('@getSnippets').its('request.url').should('include', 'compliance=COMPLIANT');
  });

  it('should sort snippets', () => {
    cy.intercept('GET', SNIPPET_URL+"/snippets*").as('getSnippets');
    
    cy.get('label').contains('Sort by').parent().find('select').click();
    cy.contains('li', 'Language').click();
    
    cy.wait('@getSnippets').its('request.url').should('include', 'sortBy=LANGUAGE');
  });

  it('should toggle sort order', () => {
    cy.intercept('GET', SNIPPET_URL+"/snippets*").as('getSnippets');
    
    cy.get('button[aria-label*="Sort"]').click();
    
    cy.wait('@getSnippets').its('request.url').should('include', 'sortOrder=DESC');
  });

  it('should clear all filters', () => {
    cy.get('label').contains('Ownership').parent().find('select').click();
    cy.contains('li', 'Owned').click();
    
    cy.contains('button', 'Clear Filters').click();
    
    cy.get('label').contains('Ownership').parent().should('contain', 'All');
  });

  it('should combine multiple filters', () => {
    cy.intercept('GET', SNIPPET_URL+"/snippets*").as('getSnippets');
    
    cy.get('label').contains('Ownership').parent().find('select').click();
    cy.contains('li', 'Owned').click();
    
    cy.get('input[label="Search by name"]').type('Test{enter}');
    
    cy.wait('@getSnippets').its('request.url').should('include', 'ownership=OWNED').and('include', 'name=Test');
  });
});