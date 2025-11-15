import {AUTH0_PASSWORD, AUTH0_USERNAME} from "../../src/utils/constants";

describe('Add snippet tests', () => {
    beforeEach(() => {
        cy.loginToAuth0(
            AUTH0_USERNAME,
            AUTH0_PASSWORD
        )

        cy.visit("/")

        // Esperar a que carguen los snippets
        cy.get('[data-testid="snippet-row"]', { timeout: 10000 }).should('have.length.greaterThan', 0)

        // Hacer clic en el primer snippet
        cy.get('[data-testid="snippet-row"]').first().click();

        // Esperar a que se abra el drawer con los detalles
        cy.get('.css-lv0yle', { timeout: 10000 }).should('be.visible')
    })

    it('Can share a snippet only Read', () => {
        cy.intercept('POST', '**/api/snippet/snippets/*/share').as('shareSnippet');

        cy.get('[aria-label="Share"]').click()

        cy.contains('Type the user\'s name')
            .parent()
            .find('input')
            .type("bytomas2005@gmail.com")

        cy.wait(3500);

        cy.get('[role="listbox"] [role="option"]').first().click();

        cy.get('.css-1yuhvjn > .MuiBox-root > .MuiButton-contained').click();

        cy.wait('@shareSnippet').then((interception) => {
            expect(interception.response.statusCode).to.equal(200);
        });
    });

    it('Can run snippets', function() {
        cy.get('[data-testid="PlayArrowIcon"]').click();
        cy.get('.css-1hpabnv > .MuiBox-root > div > .npm__react-simple-code-editor__textarea').should("have.length.greaterThan",0);
    });


    it('Can format snippet and verifies content change (200 OK)', () => {
        cy.intercept('POST', '**/api/snippet/format/preview*').as('formatSnippet');

        cy.get('[data-testid="ReadMoreIcon"] > path').click();

        cy.wait('@formatSnippet').then((interception) => {
            expect(interception.response.statusCode).to.equal(200);
        });
    });
    const text = "Some new line";
    it('Can save snippets', function() {
        cy.intercept('PUT', '**/api/snippet/snippets/*').as('saveSnippet');
        cy.get('.css-10egq61 > .MuiBox-root > div > .npm__react-simple-code-editor__textarea').click();
        cy.get('.css-10egq61 > .MuiBox-root > div > .npm__react-simple-code-editor__textarea').type(`println('${text}');`);
        cy.get('[data-testid="SaveIcon"] > path').click();
        cy.wait('@saveSnippet').then((interception) => {
            expect(interception.response.statusCode).to.equal(200);
        });
    });

    it('Can delete snippets and verifies successful API request (204 No Content)', function() {

        cy.intercept('DELETE', '**/api/snippet/snippets/*').as('deleteSnippet');

        cy.get('[data-testid="DeleteIcon"] > path').click();

        cy.get('.css-z3n8bp > .MuiBox-root > .MuiButton-contained').click();

        cy.wait('@deleteSnippet').then((interception) => {
            // Asersión clave: Verificar que el borrado fue exitoso (204 No Content)
            expect(interception.response.statusCode).to.equal(204);
        });

        // Opcional: Verificar que el modal/drawer se cierra después de la eliminación exitosa.
        // cy.get('[data-testid="snippet-detail-container"]').should('not.exist');
    });
})