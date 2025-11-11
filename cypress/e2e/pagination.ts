describe('Pagination', () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it('should display pagination controls', () => {
    cy.get('.MuiTablePagination-root').should('be.visible');
  });

  it('should show current page and total count', () => {
    cy.get('.MuiTablePagination-displayedRows').should('contain', 'of');
  });

  it('should navigate to next page', () => {
    cy.intercept('GET', SNIPPET_URL+"/snippets*").as('getSnippets');
    
    cy.get('button[aria-label="Go to next page"]').click();
    
    cy.wait('@getSnippets').its('request.url').should('include', 'page=1');
  });

  it('should navigate to previous page', () => {
    cy.intercept('GET', SNIPPET_URL+"/snippets*").as('getSnippets');
    
    cy.get('button[aria-label="Go to next page"]').click();
    cy.wait('@getSnippets');
    cy.get('button[aria-label="Go to previous page"]').click();
    
    cy.wait('@getSnippets').its('request.url').should('include', 'page=0');
  });

  it('should change rows per page', () => {
    cy.intercept('GET', SNIPPET_URL+"/snippets*").as('getSnippets');
    
    cy.get('.MuiTablePagination-select').click();
    cy.get('[data-value="25"]').click();
    
    cy.wait('@getSnippets').its('request.url').should('include', 'pageSize=25');
  });

  it('should disable previous button on first page', () => {
    cy.get('button[aria-label="Go to previous page"]').should('be.disabled');
  });

  it('should disable next button on last page', () => {
    cy.get('.MuiTablePagination-displayedRows').then(($el) => {
      const text = $el.text();
      const match = text.match(/(\d+)–(\d+) of (\d+)/);
      if (match && match[2] === match[3]) {
        cy.get('button[aria-label="Go to next page"]').should('be.disabled');
      }
    });
  });

  it('should maintain page after filter change', () => {
    cy.get('button[aria-label="Go to next page"]').click();
    cy.get('label').contains('Ownership').parent().find('select').click();
    cy.contains('li', 'Owned').click();
    
    cy.get('.MuiTablePagination-displayedRows').should('contain', '1');
  });

  it('should reset to first page when changing page size', () => {
    cy.get('button[aria-label="Go to next page"]').click();
    cy.get('.MuiTablePagination-select').click();
    cy.get('[data-value="25"]').click();
    
    cy.get('.MuiTablePagination-displayedRows').should('contain', '1–');
  });
});