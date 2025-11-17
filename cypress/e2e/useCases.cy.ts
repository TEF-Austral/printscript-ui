import {AUTH0_PASSWORD, AUTH0_USERNAME, FRONTEND_URL, SNIPPET_URL} from "../../src/utils/constants";

describe('Add snippet tests', () => {
    beforeEach(() => {
        cy.loginToAuth0(
            AUTH0_USERNAME,
            AUTH0_PASSWORD
        )
    })

    // it('Case 1 Add Snippets Should Be Succes', () => {
    //     cy.visit("/")
    //
    //     cy.get('.MuiTable-root', { timeout: 10000 }).should('be.visible')
    //
    //     cy.intercept('POST', SNIPPET_URL+"/snippets").as('postRequest');
    //
    //     cy.contains('button', 'Add Snippet').click();
    //
    //     cy.contains('Load snippet from file').click();
    //
    //     cy.get('input[type="file"]')
    //         .selectFile("cypress/fixtures/example.prs", { force: true });
    //
    //     cy.get('#description').type('Test description');
    //
    //     cy.get('#version').clear().type('1.1');
    //
    //
    //     cy.contains('button', 'Save Snippet').should('be.visible').click();
    //
    //     cy.wait('@postRequest').its('response.statusCode').should('eq', 201);
    // })
    //
    //
    // it('Case 1 Add Snippet With Parse Error Should Fail', () => {
    //     cy.visit("/")
    //
    //     cy.get('.MuiTable-root', { timeout: 10000 }).should('be.visible')
    //
    //     cy.intercept('POST', SNIPPET_URL+"/snippets").as('postRequest');
    //
    //     cy.contains('button', 'Add Snippet').click();
    //
    //     cy.contains('Load snippet from file').click();
    //
    //     cy.get('input[type="file"]')
    //         .selectFile("cypress/fixtures/example_failure.prs", { force: true });
    //
    //     cy.get('#description').type('Test description');
    //
    //     cy.get('#version').clear().type('1.1');
    //
    //
    //     cy.contains('button', 'Save Snippet').should('be.visible').click();
    //
    //     cy.get('.css-z3n8bp > .MuiPaper-root').should('contain.text',
    //         'Code does not parse');
    // })
    //
    // // it('Case 2 Edit Snippets Should Success', () => {
    // //     cy.visit("/")
    // //     cy.get('.MuiTable-root', { timeout: 10000 }).should('be.visible')
    // //     cy.intercept('PUT', '**/api/snippet/snippets/*').as('saveSnippet');
    // //     cy.get('[data-testid="snippet-row"]', { timeout: 10000 }).should('have.length.greaterThan', 0)
    // //     cy.get('[data-testid="snippet-row"]').first().click();
    // //     cy.get('.css-lv0yle', { timeout: 10000 }).should('be.visible')
    // //
    // //     cy.get('[data-testid="snippet-detail-upload-file-input"]')
    // //         .selectFile("cypress/fixtures/example.prs", { force: true });
    // //
    // //     cy.get('[data-testid="save-button"]')
    // //         .click({ force: true });
    // //
    // //     // El resto del test sigue igual
    // //     cy.wait('@saveSnippet').then((interception) => {
    // //         expect(interception.response.statusCode).to.equal(200);
    // //     });
    // // })
    // //
    // // it('Case 2 Edit Snippets With Parser Error Should Fail', () => {
    // //     cy.visit("/")
    // //     cy.get('.MuiTable-root', { timeout: 10000 }).should('be.visible')
    // //     cy.intercept('PUT', '**/api/snippet/snippets/*').as('saveSnippet');
    // //     cy.get('[data-testid="snippet-row"]', { timeout: 10000 }).should('have.length.greaterThan', 0)
    // //     cy.get('[data-testid="snippet-row"]').first().click();
    // //     cy.get('.css-lv0yle', { timeout: 10000 }).should('be.visible')
    // //
    // //     cy.get('[data-testid="snippet-detail-upload-file-input"]')
    // //         .selectFile("cypress/fixtures/example_failure.prs", { force: true });
    // //
    // //     cy.get('[data-testid="save-button"]')
    // //         .click();
    // //
    // //     // El resto del test sigue igual
    // //     cy.wait('@saveSnippet').then((interception) => {
    // //         expect(interception.response.statusCode).to.equal(200);
    // //     });
    // // })
    //
    //
    // it('Case 3 Create a Snippet Manualy Should Pass', () => {
    //     cy.visit("/")
    //
    //     cy.get('.MuiTable-root', { timeout: 10000 }).should('be.visible')
    //
    //     cy.intercept('POST', SNIPPET_URL+"/snippets").as('postRequest');
    //
    //     cy.contains('button', 'Add Snippet').click();
    //
    //     cy.contains('Create snippet').click();
    //
    //     cy.get('#name').type('Some snippet name');
    //     cy.get('#description').type('Test description');
    //     cy.get('#version').clear().type('1.1');
    //
    //     cy.get('#demo-simple-select').click()
    //     cy.get('ul[role="listbox"]').contains('PRINTSCRIPT').click();
    //
    //     cy.get('textarea.npm__react-simple-code-editor__textarea').first()
    //         .type('const snippet: string = "test";\nprintln(snippet);', {force: true});
    //
    //     cy.contains('button', 'Save Snippet').click();
    //
    //     cy.wait('@postRequest').its('response.statusCode').should('eq', 201);
    // })
    //
    // it('Case 3 Create a Snippet Manualy With Parse Error Should Fail', () => {
    //     cy.visit("/")
    //
    //     cy.get('.MuiTable-root', { timeout: 10000 }).should('be.visible')
    //
    //     cy.contains('button', 'Add Snippet').click();
    //
    //     cy.contains('Create snippet').click();
    //
    //     cy.get('#name').type('Some snippet name');
    //     cy.get('#description').type('Test description');
    //     cy.get('#version').clear().type('1.1');
    //
    //     cy.get('#demo-simple-select').click()
    //     cy.get('ul[role="listbox"]').contains('PRINTSCRIPT').click();
    //
    //     cy.get('textarea.npm__react-simple-code-editor__textarea').first()
    //         .type('const snippet: string = "test";\nprintln(snippet)', {force: true});
    //
    //     cy.contains('button', 'Save Snippet').click();
    //
    //     cy.get('.css-z3n8bp > .MuiPaper-root').should('contain.text',
    //         'Code does not parse');
    // })


    const text = "Some new line";
    it('Case 4 Edit Snippets Should Pass', () => {
        cy.visit("/")

        // Esperar a que carguen los snippets
        cy.get('[data-testid="snippet-row"]', {timeout: 10000}).should('have.length.greaterThan', 0)

        // Hacer clic en el primer snippet
        cy.get('[data-testid="snippet-row"]').first().click();

        // Esperar a que se abra el drawer con los detalles
        cy.get('.css-lv0yle', {timeout: 10000}).should('be.visible')

        cy.intercept('PUT', '**/api/snippet/snippets/*').as('saveSnippet');
        cy.get('.css-10egq61 > .MuiBox-root > div > .npm__react-simple-code-editor__textarea').click();
        cy.get('.css-10egq61 > .MuiBox-root > div > .npm__react-simple-code-editor__textarea').type(`println('${text}');`);
        cy.get('[data-testid="SaveIcon"] > path').click();
        cy.wait('@saveSnippet').then((interception) => {
            expect(interception.response.statusCode).to.equal(200);
        });
    })

    it('Case 4 Edit Snippets With Parse Error Should Fail', () => {
        cy.visit("/")

        cy.get('[data-testid="snippet-row"]', {timeout: 10000}).should('have.length.greaterThan', 0)

        cy.get('[data-testid="snippet-row"]').first().click();

        cy.get('.css-lv0yle', {timeout: 10000}).should('be.visible')
        cy.intercept('PUT', '**/api/snippet/snippets/*').as('saveSnippet');
        cy.get('.css-10egq61 > .MuiBox-root > div > .npm__react-simple-code-editor__textarea').click();
        cy.get('.css-10egq61 > .MuiBox-root > div > .npm__react-simple-code-editor__textarea').type(`println('${text}')`);
        cy.get('[data-testid="SaveIcon"] > path').click();
        cy.get('.css-1w3p0av').should('contain.text',
            'Code does not parse');
    })

    it('Case 5 Should Pass', () => {
        cy.visit("/")
        const first10Snippets = cy.get('[data-testid="snippet-row"]')

        first10Snippets.should('have.length.greaterThan', 0)

        first10Snippets.should('have.length.lessThan', 10)
    })



})