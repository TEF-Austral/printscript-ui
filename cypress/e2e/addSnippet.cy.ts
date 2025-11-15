import {SNIPPET_URL} from "../../src/utils/constants";

describe('Add snippet tests', () => {
    beforeEach(() => {
        const username = Cypress.env('auth0_username') || 'tomasgemini54@gmail.com';
        const password = Cypress.env('auth0_password') || 'Password123!';

        cy.loginToAuth0(username, password)
    })

    it('Can add snippets manually', () => {
        cy.visit("/")

        cy.get('.MuiTable-root', { timeout: 10000 }).should('be.visible')

        cy.intercept('POST', SNIPPET_URL+"/snippets").as('postRequest');

        cy.contains('button', 'Add Snippet').click();

        cy.contains('Create snippet').click();

        cy.get('#name').type('Some snippet name');
        cy.get('#description').type('Test description');
        cy.get('#version').clear().type('1.1');

        cy.get('#demo-simple-select').click()
        cy.get('ul[role="listbox"]').contains('PRINTSCRIPT').click();

        cy.get('textarea.npm__react-simple-code-editor__textarea').first()
            .type('const snippet: string = "test";\nprintln(snippet);', {force: true});

        cy.contains('button', 'Save Snippet').click();

        cy.wait('@postRequest').its('response.statusCode').should('eq', 201);
    })

    it('Can add snippets via file', () => {
        cy.visit("/")

        cy.get('.MuiTable-root', { timeout: 10000 }).should('be.visible')

        cy.intercept('POST', SNIPPET_URL+"/snippets").as('postRequest');

        cy.contains('button', 'Add Snippet').click();

        cy.contains('Load snippet from file').click();

        cy.get('input[type="file"]')
            .selectFile("cypress/fixtures/example.prs", { force: true });

        cy.get('#description').type('Test description');

        cy.get('#version').clear().type('1.1');


        cy.contains('button', 'Save Snippet').should('be.visible').click();

        cy.wait('@postRequest').its('response.statusCode').should('eq', 201);
    })

})