describe('Snippet Testing', () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it('should open test modal', () => {
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.get('button[aria-label="Test"]').click();
    
    cy.contains('Test snippet').should('be.visible');
  });

  it('should create a new test case', () => {
    cy.intercept('POST', SNIPPET_URL+"/testcases").as('createTestCase');
    
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.get('button[aria-label="Test"]').click();
    
    cy.get('button[aria-label="Add"]').click();
    cy.get('input[label="Name"]').type('Test Case 1');
    cy.get('input[placeholder="Input"]').type('test input{enter}');
    cy.get('input[placeholder="Output"]').type('expected output{enter}');
    
    cy.contains('button', 'Save').click();
    cy.wait('@createTestCase').its('response.statusCode').should('eq', 200);
  });

  it('should update existing test case', () => {
    cy.intercept('PUT', SNIPPET_URL+"/testcases/*").as('updateTestCase');
    
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.get('button[aria-label="Test"]').click();
    
    cy.get('[role="tab"]').first().click();
    cy.get('input[label="Name"]').clear().type('Updated Test');
    
    cy.contains('button', 'Save').click();
    cy.wait('@updateTestCase').its('response.statusCode').should('eq', 200);
  });

  it('should delete a test case', () => {
    cy.intercept('DELETE', SNIPPET_URL+"/testcases/*").as('deleteTestCase');
    
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.get('button[aria-label="Test"]').click();
    
    cy.get('[role="tab"]').first().click();
    cy.contains('button', 'Remove').click();
    
    cy.wait('@deleteTestCase').its('response.statusCode').should('eq', 200);
  });

  it('should add multiple inputs to test case', () => {
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.get('button[aria-label="Test"]').click();
    
    cy.get('button[aria-label="Add"]').click();
    cy.get('input[label="Name"]').type('Multi Input Test');
    cy.get('input[placeholder="Input"]').type('input1{enter}');
    cy.get('input[placeholder="Input"]').type('input2{enter}');
    cy.get('input[placeholder="Input"]').type('input3{enter}');
    
    cy.get('.MuiChip-root').should('have.length', 3);
  });

  it('should add multiple expected outputs to test case', () => {
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.get('button[aria-label="Test"]').click();
    
    cy.get('button[aria-label="Add"]').click();
    cy.get('input[label="Name"]').type('Multi Output Test');
    cy.get('input[placeholder="Output"]').type('output1{enter}');
    cy.get('input[placeholder="Output"]').type('output2{enter}');
    
    cy.get('.MuiChip-root').should('have.length', 2);
  });

  it('should select test case for execution', () => {
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.get('button[aria-label="Test"]').click();
    
    cy.get('[role="tab"]').first().click();
    cy.contains('button', 'Select').click();
    
    cy.get('select[label="Select Test"]').should('not.be.empty');
  });

  it('should run selected test case', () => {
    cy.intercept('POST', SNIPPET_URL+"/tests/execute").as('runTest');
    
    cy.get('[data-testid="snippet-row"]').first().click();
    
    cy.get('select[label="Select Test"]').select(0);
    cy.contains('button', 'Run Test').click();
    
    cy.wait('@runTest').its('response.statusCode').should('eq', 200);
  });

  it('should display test results', () => {
    cy.intercept('POST', SNIPPET_URL+"/tests/execute", {
      statusCode: 200,
      body: {
        testId: 1,
        passed: true,
        outputs: ['output1'],
        expectedOutputs: ['output1'],
        errors: []
      }
    }).as('runTest');
    
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.get('select[label="Select Test"]').select(0);
    cy.contains('button', 'Run Test').click();
    
    cy.wait('@runTest');
    cy.contains('Test Passed').should('be.visible');
  });
});