describe('Snippet Execution', () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it('should display execution output section', () => {
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.contains('Output').should('be.visible');
  });

  it('should show execution input field when awaiting input', () => {
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.get('input[placeholder*="entrada"]').should('exist');
  });

  it('should send input to execution', () => {
    cy.get('[data-testid="snippet-row"]').first().click();
    
    cy.get('input[placeholder*="entrada"]').type('test input{enter}');
    cy.contains('> test input').should('be.visible');
  });

  it('should display execution output', () => {
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.get('.npm__react-simple-code-editor__textarea').last().should('exist');
  });

  it('should restart execution', () => {
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.get('input[placeholder*="entrada"]').type('test input{enter}');
    
    cy.contains('button', 'Reiniciar').click();
    cy.get('.npm__react-simple-code-editor__textarea').last().should('be.empty');
  });

  it('should disable input when not awaiting input', () => {
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.get('input[placeholder*="entrada"]').should('be.disabled');
  });

  it('should handle websocket connection', () => {
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.wait(2000);
    cy.get('.npm__react-simple-code-editor__textarea').last().should('exist');
  });
});