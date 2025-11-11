export function loginViaAuth0Ui(username: string, password: string) {
    cy.url({ timeout: 10000 }).then((url) => {
        if (url.includes(Cypress.env('auth0_domain'))) {
            cy.origin(
                Cypress.env('auth0_domain'),
                { args: { username, password } },
                ({ username, password }) => {
                    cy.get('input#username', { timeout: 10000 }).type(username)
                    cy.get('input#password', { timeout: 10000 }).type(password, { log: false })
                    cy.contains('button[value=default]', 'Continue').click()
                }
            )
            cy.url({ timeout: 10000 }).should('equal', Cypress.config('baseUrl') + '/')
        } else {
            cy.log('Already authenticated or no redirect to Auth0 occurred')
        }
    })
}