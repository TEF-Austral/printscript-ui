import './commands'
import {loginViaAuth0Ui} from "./auth-provider-commands/auth0";

Cypress.Commands.add('loginToAuth0', (username: string, password: string) => {
    const log = Cypress.log({
        displayName: 'AUTH0 LOGIN',
        message: [`🔐 Authenticating | ${username}`],
        autoEnd: false,
    })
    log.snapshot('before')

    cy.session(
        `auth0-${username}`,
        () => {
            cy.visit('/')
            loginViaAuth0Ui(username, password)
        },
        {
            validate: () => {
                cy.wrap(localStorage)
                    .invoke('getItem', 'authAccessToken')
                    .should('exist')
            },
            cacheAcrossSpecs: true,
        }
    )
    log.snapshot('after')
    log.end()
})