/// <reference types="cypress" />

describe('Message caching', () => {
    beforeEach(() => {
        localStorage.setItem('Desktop:localSearchPromptDisplayed', 'true');
        localStorage.setItem('Global:messageSubjectDragTipShown', 'true');
    });

  it('should cache all messages on first time page load', async () => {
        (await indexedDB.databases())
            .filter(db => db.name && /messageCache/.test(db.name))
            .forEach(db => indexedDB.deleteDatabase(db.name!));

        cy.intercept('/rest/v1/email/12').as('message12requested');

        cy.visit('/');
        cy.wait('@message12requested', {'timeout':10000});
        cy.wait(1000); // hopefully this is enough time for all the iDB writes to actually finish
    });

    it('should not re-request messages after a page reload', () => {
        cy.visit('/#Inbox:12');
        let called = false;
        cy.intercept('/rest/v1/email/12', (_req) => {
            called = true;
        });

        cy.get('div#messageHeaderSubject').contains('Default from fix test').then(() => {
            assert.equal(called, false);
        });
    });
});
