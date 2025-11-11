describe('Snippet Management', () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it('should display snippet list with pagination', () => {
    cy.get('[data-testid="snippet-row"]').should('have.length.greaterThan', 0);
    cy.get('.MuiTablePagination-root').should('be.visible');
  });

  it('should open snippet detail when clicking on a snippet', () => {
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.get('.MuiDrawer-root').should('be.visible');
    cy.get('h4').should('exist');
  });

  it('should close snippet detail drawer', () => {
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.get('.MuiDrawer-root').should('be.visible');
    cy.get('svg[data-testid="CloseIcon"]').click();
    cy.get('.MuiDrawer-root').should('not.be.visible');
  });

  it('should create a snippet manually', () => {
    cy.intercept('POST', SNIPPET_URL+"/snippets").as('createSnippet');
    
    cy.contains('button', 'Add Snippet').click();
    cy.contains('Create snippet').click();
    
    cy.get('#name').type('Test Snippet');
    cy.get('#description').type('Test Description');
    cy.get('#version').clear().type('1.1');
    cy.get('#demo-simple-select').click();
    cy.get('[data-testid="menu-option-PRINTSCRIPT"]').click();
    cy.get('[data-testid="add-snippet-code-editor"]').type('let x: number = 5;\nprintln(x);');
    
    cy.contains('button', 'Save Snippet').click();
    cy.wait('@createSnippet').its('response.statusCode').should('eq', 200);
  });

  it('should create a snippet from file', () => {
    cy.intercept('POST', SNIPPET_URL+"/snippets").as('createSnippet');
    
    cy.contains('button', 'Add Snippet').click();
    cy.contains('Load snippet from file').click();
    
    cy.get('input[type="file"]').selectFile('cypress/fixtures/example_ps.ps', {force: true});
    
    cy.get('[data-testid="add-snippet-code-editor"]').should('not.be.empty');
    cy.contains('button', 'Save Snippet').click();
    cy.wait('@createSnippet').its('response.statusCode').should('eq', 200);
  });

  it('should update snippet content', () => {
    cy.intercept('PUT', SNIPPET_URL+"/snippets/*").as('updateSnippet');
    
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.get('.npm__react-simple-code-editor__textarea').first().clear().type('let updated: number = 10;');
    cy.get('button[aria-label="Save changes"]').click();
    
    cy.wait('@updateSnippet').its('response.statusCode').should('eq', 200);
  });

  it('should delete a snippet', () => {
    cy.intercept('DELETE', SNIPPET_URL+"/snippets/*").as('deleteSnippet');
    
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.get('button[aria-label="Delete"]').click();
    cy.contains('button', 'Delete').click();
    
    cy.wait('@deleteSnippet').its('response.statusCode').should('eq', 200);
  });

  it('should validate code before saving', () => {
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.get('.npm__react-simple-code-editor__textarea').first().clear().type('invalid code!!!');
    cy.get('button[aria-label="Save changes"]').click();
    
    cy.contains('Code does not parse').should('be.visible');
  });

  it('should load code from file in snippet detail', () => {
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.get('button[aria-label="Load from file"]').click();
    cy.get('input[data-testid="snippet-detail-upload-file-input"]').selectFile('cypress/fixtures/example_ps.ps', {force: true});
    
    cy.contains('File loaded successfully').should('be.visible');
  });
});