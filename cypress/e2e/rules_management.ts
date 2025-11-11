import {PRINTSCRIPT_URL} from "../../src/utils/constants";
describe('Rules Management', () => {
  beforeEach(() => {
    cy.visit("/rules");
  });

  it('should display formatting rules', () => {
    cy.contains('Formatting rules').should('be.visible');
    cy.get('.MuiList-root').should('exist');
  });

  it('should display linting rules', () => {
    cy.contains('Linting rules').should('be.visible');
    cy.get('.MuiList-root').should('have.length', 2);
  });

  it('should toggle formatting rule', () => {
    cy.get('input[type="checkbox"]').first().click();
    cy.get('input[type="checkbox"]').first().should('be.checked');
  });

  it('should update numeric formatting rule', () => {
    cy.get('input[type="number"]').first().clear().type('5');
    cy.get('input[type="number"]').first().should('have.value', '5');
  });

  it('should update text formatting rule', () => {
    cy.get('input[type="text"]').first().clear().type('newValue');
    cy.get('input[type="text"]').first().should('have.value', 'newValue');
  });

  it('should save formatting rules', () => {
    cy.intercept('PUT', PRINTSCRIPT_URL+"/config/update/format").as('saveFormatRules');
    
    cy.get('input[type="checkbox"]').first().click();
    cy.contains('Formatting rules').parent().find('button').contains('Save').click();
    
    cy.wait('@saveFormatRules').its('response.statusCode').should('eq', 200);
  });

  it('should toggle linting rule', () => {
    cy.get('.MuiList-root').eq(1).find('input[type="checkbox"]').first().click();
    cy.get('.MuiList-root').eq(1).find('input[type="checkbox"]').first().should('be.checked');
  });

  it('should update linting rule with dropdown', () => {
    cy.get('.MuiList-root').eq(1).find('select').first().click();
    cy.contains('li', 'Snake case').click();
    cy.get('.MuiList-root').eq(1).find('select').first().should('contain', 'Snake case');
  });

  it('should save linting rules', () => {
    cy.intercept('PUT', PRINTSCRIPT_URL+"/config/update/analyze").as('saveLintRules');
    
    cy.get('.MuiList-root').eq(1).find('input[type="checkbox"]').first().click();
    cy.contains('Linting rules').parent().find('button').contains('Save').click();
    
    cy.wait('@saveLintRules').its('response.statusCode').should('eq', 200);
  });

  it('should show loading state while fetching rules', () => {
    cy.intercept('GET', PRINTSCRIPT_URL+"/config/format", {
      delay: 1000,
      statusCode: 200,
      body: []
    }).as('getFormatRules');
    
    cy.visit("/rules");
    cy.contains('Loading...').should('be.visible');
  });

  it('should disable save button while saving', () => {
    cy.intercept('PUT', PRINTSCRIPT_URL+"/config/update/format", {
      delay: 1000,
      statusCode: 200,
      body: []
    }).as('saveFormatRules');
    
    cy.contains('Formatting rules').parent().find('button').contains('Save').click();
    cy.contains('Formatting rules').parent().find('button').contains('Save').should('be.disabled');
  });
});