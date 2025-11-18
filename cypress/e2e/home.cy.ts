import {SNIPPET_URL, FRONTEND_URL, AUTH0_USERNAME, AUTH0_PASSWORD} from "../../src/utils/constants";
import {CreateSnippet} from "../../src/utils/snippet";

const authToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IktsaG5XZGpBNkFDNEJDZFBkMVFkNyJ9.eyJ1c2VybmFtZSI6InRvbWFzZ2VtaW5pNTQiLCJpc3MiOiJodHRwczovL3RmLWF1c3RyYWwudXMuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDY5MTc1NmY3YmM1OTIwZjAyOGZmZmJlMSIsImF1ZCI6WyJodHRwczovL3RmLWF1c3RyYWwuY29tL2FwaSIsImh0dHBzOi8vdGYtYXVzdHJhbC51cy5hdXRoMC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNzYzNDg0NjA1LCJleHAiOjE3NjM1NzEwMDUsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJhenAiOiJuTVFXeWl2M0VrZUE0UVJValNYRjdRdW9wekZRMjNDNyJ9.DGoa8pb6LbMBjP5wOxq3h4J6MBvVfKG2vJKdr8P3HiDXTdWzbMLIQXGWh-TduNb_J8VF9ZxrxZIV4eaIxsOf8xXU9JAvx9TEiSOvl0XTD3JRp7DqjKyTZgZscqJlarzO1IPbzSJFm26J9N7TaHe31L8o39hEK0f2daw5lE8D_6Eci0pdp60C_ta41JXjEI93jh90L7SFbXy-rbfN_P6diSz86DORVq6bNbL1JIKfbqAeY5Un2xcAiZoi7kvcO1M2diKJ6CbZIx748D3bjGX8PGXKsJf-aHCKVFpEXogc6qAkSTnGcPoAzKGn2L0llkkmIia56QwlOEfXSrxPVU-QQQ"

describe('Home', () => {
    beforeEach(() => {
        cy.loginToAuth0(
            AUTH0_USERNAME,
            AUTH0_PASSWORD
        )
    })
    before(() => {
        process.env.FRONTEND_URL = Cypress.env("FRONTEND_URL");
        process.env.BACKEND_URL = Cypress.env("BACKEND_URL");
    })

    it('Renders home', () => {
        cy.visit(FRONTEND_URL)
        /* ==== Generated with Cypress Studio ==== */
        cy.get('.MuiTypography-h6').should('have.text', 'Printscript');
        cy.get('#\\:r1\\:').should('be.visible');
        cy.get('.MuiGrid-container > :nth-child(1) > .MuiFormControl-root > .MuiInputBase-root > .MuiSelect-select').should('be.visible');
        cy.get(':nth-child(3) > .MuiFormControl-root > .MuiInputBase-root > .MuiSelect-select').should('be.visible');
        cy.get(':nth-child(4) > .MuiFormControl-root > .MuiInputBase-root > .MuiSelect-select').should('be.visible');
        cy.get('.MuiBox-root > .MuiFormControl-root > .MuiInputBase-root > .MuiSelect-select').should('be.visible');
        cy.get('.MuiGrid-container > :nth-child(5)').should('be.visible');
        cy.get(':nth-child(5) > .MuiBox-root > .MuiButtonBase-root').should('be.visible');
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(1)').should('be.visible');
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(2)').should('be.visible');
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(3)').should('be.visible');
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(4)').should('be.visible');

        cy.get('.css-jie5ja').click();

        //Sort By
        cy.get('.MuiBox-root > .MuiFormControl-root > .MuiInputBase-root > .MuiSelect-select').click()
        cy.get('[data-value="LANGUAGE"]').should('be.visible');
        cy.get('[data-value="COMPLIANCE"]').should('be.visible'); // Corregido de "COMPILANCE"
        cy.get('[data-value="NAME"]').should('be.visible');

        // Seleccionar 'LANGUAGE' y verificar que el valor cambió
        cy.get('[data-value="LANGUAGE"]').click();
        cy.get('.MuiBox-root > .MuiFormControl-root > .MuiInputBase-root > .MuiSelect-select').should('have.text', 'Language');

        /* ==== Check Clear Filters ==== */
        // El botón "Clear Filters" debería aparecer
        cy.get('.MuiButton-root:contains("Clear Filters")').should('be.visible');

        // Click en "Clear Filters"
        cy.get('.MuiButton-root:contains("Clear Filters")').click();

        // El botón "Clear Filters" debería desaparecer
        cy.get('.MuiButton-root:contains("Clear Filters")').should('not.exist');

        // El "Sort By" debería volver a "Name"
        cy.get('.MuiBox-root > .MuiFormControl-root > .MuiInputBase-root > .MuiSelect-select').should('have.text', 'Name');


        /* ==== Check Add Snippet Menu ==== */
        // Click en "Add Snippet"
        cy.get('.MuiButton-root:contains("Add Snippet")').click();

        // Verificar que el menú (Popover) aparezca
        cy.get('.MuiMenu-root').should('be.visible');
        cy.get('.MuiMenu-list [role="menuitem"]:contains("Create snippet")').should('be.visible');
        cy.get('.MuiMenu-list [role="menuitem"]:contains("Load snippet from file")').should('be.visible');

        // Click en "Create snippet"
        cy.get('.MuiMenu-list [role="menuitem"]:contains("Create snippet")').should('be.visible');

        cy.contains('button', 'Add Snippet').should('be.visible');

        cy.contains('Create snippet').should('be.visible');

        cy.get('.MuiBackdrop-root').click();

        cy.contains('Create snippet').should('not.be.visible');

        cy.contains('Load snippet from file').should('not.be.visible');

    })

    it('Renders the first snippets', () => {
        cy.visit(FRONTEND_URL)
        const first10Snippets = cy.get('[data-testid="snippet-row"]')

        first10Snippets.should('have.length.greaterThan', 0)

        first10Snippets.should('have.length.lessThan', 10)
    })

    it('Can creat snippet find snippets by name', () => {
        cy.visit(FRONTEND_URL)
        const snippetData: CreateSnippet = {
            name: "Test name",
            content: "println(1);",
            language: "PRINTSCRIPT",
            extension: ".prs",
            description: "Some description",
            version: "1.1"
        }

        cy.intercept('GET', SNIPPET_URL + "/snippets*", (req) => {
            req.reply((res) => {
                expect(res.statusCode).to.eq(200);
            });
        }).as('getSnippets');

        cy.request({
            method: 'POST',
            url: SNIPPET_URL + '/snippets',
            body: snippetData,
            failOnStatusCode: true,
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        }).then((response) => {
            expect(response.status).to.eq(201);

            expect(response.body.name).to.eq(snippetData.name)
            expect(response.body.content).to.eq(snippetData.content)
            expect(response.body.language).to.eq(snippetData.language)
            expect(response.body).to.haveOwnProperty("snippetId")

            cy.get('#\\:r1\\:').clear();
            cy.get('#\\:r1\\:').type(snippetData.name + "{enter}");

            cy.wait("@getSnippets")
            cy.contains(snippetData.name).should('exist');
        })
    })
})