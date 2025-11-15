import {AUTH0_PASSWORD, AUTH0_USERNAME} from "../../src/utils/constants";


describe('Share snippet tests', () => {
    beforeEach(() => {
        cy.loginToAuth0(
            AUTH0_USERNAME,
            AUTH0_PASSWORD
        )

        cy.visit("/")

        // Esperar a que carguen los snippets
        cy.get('[data-testid="snippet-row"]', {timeout: 10000}).should('have.length.greaterThan', 0)

        // Hacer clic en el primer snippet
        cy.get('[data-testid="snippet-row"]').first().click();

        // Esperar a que se abra el drawer con los detalles
        cy.get('.css-lv0yle', {timeout: 10000}).should('be.visible')
    });

    it('Can share a snippet with "Read" and "Write" permissions (200 OK)', () => {
        cy.intercept('POST', '**/api/snippet/snippets/*/share').as('shareSnippet');

        cy.get('[aria-label="Share"]').click();

        // 1. Marcar "Write" ("Read" ya está marcado por defecto)
        cy.contains('label', 'Write').find('input[type="checkbox"]').check();

        // 2. Escribir email y seleccionar usuario
        cy.contains('Type the user\'s name')
            .parent()
            .find('input')
            .type("bytomas2005@gmail.com");

        cy.wait(3500);
        cy.get('[role="listbox"] [role="option"]').first().click();

        // 3. Hacer clic en Share
        cy.get('.css-1yuhvjn > .MuiBox-root > .MuiButton-contained').click();

        // 4. Verificar la respuesta 200 OK
        cy.wait('@shareSnippet').then((interception) => {
            expect(interception.response.statusCode).to.equal(200);
        });
    });

    it('Can share a snippet with ONLY "Write" permissions (200 OK)', () => {
        cy.intercept('POST', '**/api/snippet/snippets/*/share').as('shareSnippet');

        cy.get('[aria-label="Share"]').click();

        // 1. Desmarcar "Read"
        cy.contains('label', 'Read').find('input[type="checkbox"]').uncheck();

        // 2. Marcar "Write"
        cy.contains('label', 'Write').find('input[type="checkbox"]').check();

        // 3. Escribir email y seleccionar usuario
        cy.contains('Type the user\'s name')
            .parent()
            .find('input')
            .type("bytomas2005@gmail.com");

        cy.wait(3500);
        cy.get('[role="listbox"] [role="option"]').first().click();

        // 4. Hacer clic en Share
        cy.get('.css-1yuhvjn > .MuiBox-root > .MuiButton-contained').click();

        // 5. Verificar la respuesta 200 OK
        cy.wait('@shareSnippet').then((interception) => {
            expect(interception.response.statusCode).to.equal(200);
        });
    });
})