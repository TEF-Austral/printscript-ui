export function loginViaAuth0Ui(username: string, password: string) {
    cy.visit('/')
    cy.origin(
        Cypress.env('auth0_domain'),
        { args: { username, password } },
        ({ username, password }) => {
            cy.get('input#username').type(username)
            cy.get('input#password').type(password, { log: false })
            cy.contains('button[value=default]', 'Continue').click()
        }
    )
    cy.url().should('equal', Cypress.config('baseUrl') + '/')
}