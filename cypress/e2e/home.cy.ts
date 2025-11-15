import {SNIPPET_URL, FRONTEND_URL, AUTH0_USERNAME, AUTH0_PASSWORD} from "../../src/utils/constants"; //AUTH0_PASSWORD, AUTH0_USERNAME,
import {CreateSnippet} from "../../src/utils/snippet";

const authToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IktsaG5XZGpBNkFDNEJDZFBkMVFkNyJ9.eyJ1c2VybmFtZSI6InRvbWFzZ2VtaW5pNTQiLCJpc3MiOiJodHRwczovL3RmLWF1c3RyYWwudXMuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDY5MTc1NmY3YmM1OTIwZjAyOGZmZmJlMSIsImF1ZCI6WyJodHRwczovL3RmLWF1c3RyYWwuY29tL2FwaSIsImh0dHBzOi8vdGYtYXVzdHJhbC51cy5hdXRoMC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNzYzMTU2OTE2LCJleHAiOjE3NjMyNDMzMTYsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJhenAiOiJuTVFXeWl2M0VrZUE0UVJValNYRjdRdW9wekZRMjNDNyJ9.oLA7VvKoxVo5exoGzDWpDFnFXSkUuv86MK1Hed4N_BuJuO6TECNEmCObTTOUnA1umF55pZkOkQx-xRtini6Q1n8JsS0eQgjTI7EdZjzPK5DTtgrdxHDv1j9ynZkLSSAAr-F6SVxfPYih7Kmpwqu9Bdh8H6DvjHV3ewo-vlIVfAO-GSkRIB8mARLer1SF32Pka__kThmCqVFmmahMAh13ltFIMmHQZidPFKR8AepUo7nUrtb3lVHsQiroWwQpwa9mZDMuLon0QLRuQpdY5T8T_lTuecHVLvxkhrqvocvwIbsq9A3GLkH8w77TyW3qtO_BBScmkKWRszsi8Fx-_-IXdw"

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

    // You need to have at least 1 snippet in your DB for this test to pass
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
            url: SNIPPET_URL + '/snippets', // Adjust if you have a different base URL configured in Cypress
            body: snippetData,
            failOnStatusCode: true, // Optional: set to true if you want the test to fail on non-2xx status codes
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