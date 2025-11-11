describe('Debug Auth0', () => {
    it('should show what Auth0 stores', () => {
        // Limpiar todo primero
        cy.clearAllCookies();
        cy.clearAllLocalStorage();
        cy.clearAllSessionStorage();

        // Visitar la página
        cy.visit('/', { failOnStatusCode: false });

        // Esperar a que redirija a Auth0 o cargue
        cy.wait(2000);

        // Ver a dónde nos llevó
        cy.url().then((url) => {
            cy.log('Current URL:', url);
        });

        // Si estamos en Auth0, hacer login
        cy.url().then((url) => {
            if (url.includes(Cypress.env('auth0_domain'))) {
                cy.log('On Auth0 login page, attempting login...');
                cy.origin(
                    Cypress.env('auth0_domain'),
                    { args: {
                            username: Cypress.env('auth0_username'),
                            password: Cypress.env('auth0_password')
                        }},
                    ({ username, password }) => {
                        cy.get('input#username', { timeout: 10000 }).type(username);
                        cy.get('input#password', { timeout: 10000 }).type(password, { log: false });
                        cy.contains('button[value=default]', 'Continue').click();
                    }
                );

                // Esperar a que vuelva a nuestra app
                cy.url({ timeout: 15000 }).should('include', Cypress.config('baseUrl'));
            }
        });

        // Esperar un poco más para que Auth0 guarde todo
        cy.wait(3000);

        // Ahora sí, ver qué guardó
        cy.window().then((win) => {
            cy.log('=== LOCAL STORAGE ===');
            const localStorageData: Record<string, string> = {};
            for (let i = 0; i < win.localStorage.length; i++) {
                const key = win.localStorage.key(i);
                if (key) {
                    const value = win.localStorage.getItem(key);
                    localStorageData[key] = value ? value.substring(0, 100) : 'null';
                    cy.log(`LocalStorage[${key}]: ${value?.substring(0, 100)}...`);
                }
            }

            cy.log('=== SESSION STORAGE ===');
            const sessionStorageData: Record<string, string> = {};
            for (let i = 0; i < win.sessionStorage.length; i++) {
                const key = win.sessionStorage.key(i);
                if (key) {
                    const value = win.sessionStorage.getItem(key);
                    sessionStorageData[key] = value ? value.substring(0, 100) : 'null';
                    cy.log(`SessionStorage[${key}]: ${value?.substring(0, 100)}...`);
                }
            }

            // Escribir a un archivo para análisis
            cy.writeFile('cypress/fixtures/storage-debug.json', {
                localStorage: localStorageData,
                sessionStorage: sessionStorageData
            });
        });

        cy.getCookies().then((cookies) => {
            cy.log('=== COOKIES ===');
            cookies.forEach(cookie => {
                cy.log(`Cookie[${cookie.name}]: ${cookie.value.substring(0, 50)}...`);
            });
        });
    });
});