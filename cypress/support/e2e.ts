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
                cy.url({ timeout: 15000 }).should((url) => {
                    const isOnAuth0 = url.includes(Cypress.env('auth0_domain'));
                    expect(isOnAuth0, 'Should not be on Auth0 login page').to.be.false;
                });
            },
            cacheAcrossSpecs: true,
        }
    )
    log.snapshot('after')
    log.end()
})