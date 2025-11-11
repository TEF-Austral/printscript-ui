describe('Navigation', () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it('should display navbar', () => {
    cy.get('.MuiAppBar-root').should('be.visible');
  });

  it('should display Printscript logo', () => {
    cy.contains('Printscript').should('be.visible');
  });

  it('should navigate to snippets page', () => {
    cy.contains('button', 'Snippets').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('should navigate to rules page', () => {
    cy.contains('button', 'Rules').click();
    cy.url().should('include', '/rules');
  });

  it('should highlight active page', () => {
    cy.contains('button', 'Snippets').should('have.css', 'background-color');
  });

  it('should highlight rules page when active', () => {
    cy.contains('button', 'Rules').click();
    cy.contains('button', 'Rules').should('have.css', 'background-color');
  });

  it('should show snippets icon', () => {
    cy.get('button').contains('Snippets').find('svg').should('exist');
  });

  it('should show rules icon', () => {
    cy.get('button').contains('Rules').find('svg').should('exist');
  });

  it('should maintain navigation state after page reload', () => {
    cy.contains('button', 'Rules').click();
    cy.reload();
    cy.url().should('include', '/rules');
  });
});