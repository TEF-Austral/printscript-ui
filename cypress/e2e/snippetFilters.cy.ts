import { AUTH0_PASSWORD, AUTH0_USERNAME, SNIPPET_URL } from "../../src/utils/constants";

type BackendSnippet = {
  snippetId: number | string;
  name: string;
  description: string;
  content: string;
  language: string;
  version: string;
  author: string;
  complianceStatus?: string;
};

const makeSnippet = (id: number, overrides: Partial<BackendSnippet> = {}): BackendSnippet => ({
  snippetId: id,
  name: `Snippet ${id}`,
  description: `Description ${id}`,
  content: `println('Snippet ${id}');`,
  language: overrides.language || (id % 2 === 0 ? 'PRINTSCRIPT' : 'JAVA'),
  version: '1.0',
  author: overrides.author || (id % 2 === 0 ? 'me@example.com' : 'other@example.com'),
  complianceStatus: overrides.complianceStatus || (id % 3 === 0 ? 'compliant' : (id % 3 === 1 ? 'pending' : 'failed')),
  ...overrides
});

const dataSet: BackendSnippet[] = [
  makeSnippet(1, { language: 'PRINTSCRIPT', author: 'me@example.com', complianceStatus: 'compliant' }),
  makeSnippet(2, { language: 'JAVA', author: 'me@example.com', complianceStatus: 'pending' }),
  makeSnippet(3, { language: 'PYTHON', author: 'other@example.com', complianceStatus: 'failed' }),
  makeSnippet(4, { language: 'PRINTSCRIPT', author: 'me@example.com', complianceStatus: 'pending' }),
  makeSnippet(5, { language: 'GOLANG', author: 'other@example.com', complianceStatus: 'compliant' }),
];

const filterSnippets = (url: string): BackendSnippet[] => {
  const u = new URL(url, 'http://localhost');
  const ownership = u.searchParams.get('ownership');
  const name = u.searchParams.get('name');
  const language = u.searchParams.get('language');
  const compliance = u.searchParams.get('compliance');
  const sortBy = u.searchParams.get('sortBy');
  const sortOrder = u.searchParams.get('sortOrder');

  let filtered = [...dataSet];

  if (ownership && ownership !== 'ALL') {
    if (ownership === 'OWNED') filtered = filtered.filter(s => s.author === 'me@example.com');
    if (ownership === 'SHARED') filtered = filtered.filter(s => s.author !== 'me@example.com');
  }
  if (name) {
    filtered = filtered.filter(s => s.name.toLowerCase().includes(name.toLowerCase()));
  }
  if (language) {
    filtered = filtered.filter(s => s.language === language);
  }
  if (compliance && compliance !== 'ALL') {
    const map: Record<string, string[]> = {
      COMPLIANT: ['compliant'],
      PENDING: ['pending'],
      FAILED: ['failed'],
      NON_COMPLIANT: ['not-compliant'],
    };
    const expected = map[compliance] || [];
    filtered = filtered.filter(s => expected.includes(String(s.complianceStatus)));
  }

  const getFieldValue = (item: BackendSnippet, sortByKey: string): string => {
    if (sortByKey === 'COMPLIANCE') return String(item.complianceStatus ?? '').toLowerCase();
    if (sortByKey === 'NAME') return String(item.name ?? '').toLowerCase();
    if (sortByKey === 'LANGUAGE') return String(item.language ?? '').toLowerCase();
    return '';
  };

  if (sortBy) {
    filtered.sort((a, b) => {
      const valA = getFieldValue(a, sortBy);
      const valB = getFieldValue(b, sortBy);
      if (valA < valB) return -1;
      if (valA > valB) return 1;
      return 0;
    });
  }
  if (sortOrder === 'DESC') filtered.reverse();

  return filtered;
};

describe('Snippet Filters Tests', () => {
  beforeEach(() => {
    cy.loginToAuth0(
      AUTH0_USERNAME,
      AUTH0_PASSWORD
    );

    cy.intercept('GET', SNIPPET_URL + '/filetypes', {
      statusCode: 200,
      body: [
        { language: 'PRINTSCRIPT', extension: 'prs' },
        { language: 'JAVA', extension: 'java' },
        { language: 'PYTHON', extension: 'py' },
        { language: 'GOLANG', extension: 'go' },
      ]
    }).as('fileTypes');

    cy.intercept('GET', SNIPPET_URL + '/snippets*', (req) => {
      const filtered = filterSnippets(req.url).map(s => ({
        ...s,
        snippetId: s.snippetId,
      }));

      req.reply({
        statusCode: 200,
        body: {
          page: 0,
          pageSize: 10,
          count: filtered.length,
          snippets: filtered,
        }
      });
    }).as('listSnippets');
  });

  it('Filters by ownership OWNED', () => {
    cy.visit('/');
    cy.wait('@listSnippets');
    cy.get('[data-testid="ownership-select"]').click();
    cy.get('ul[role="listbox"]').contains('Owned').click();
    cy.wait('@listSnippets');
    cy.get('[data-testid="snippet-row"]').each(row => {
      cy.wrap(row).should('contain.text', 'me@example.com');
    });
  });

  it('Filters by ownership SHARED', () => {
    cy.visit('/');
    cy.wait('@listSnippets');
    cy.get('[data-testid="ownership-select"]').click();
    cy.get('ul[role="listbox"]').contains('Shared').click();
    cy.wait('@listSnippets');
    cy.get('[data-testid="snippet-row"]').each(row => {
      cy.wrap(row).should('not.contain.text', 'me@example.com');
    });
  });

  it('Filters by name search (enter key)', () => {
    cy.visit('/');
    cy.wait('@listSnippets');
    cy.get('[data-testid="snippet-search-input"]').type('Snippet 1{enter}');
    cy.wait('@listSnippets');
    cy.get('[data-testid="snippet-row"]').should('have.length', 1)
      .first().should('contain.text', 'Snippet 1');
  });

  it('Filters by language PRINTSCRIPT', () => {
    cy.visit('/');
    cy.wait('@listSnippets');
    cy.get('[data-testid="language-select"]').click();
    cy.get('ul[role="listbox"]').contains('PRINTSCRIPT').click();
    cy.wait('@listSnippets');
    cy.get('[data-testid="snippet-row"]').each(row => {
      cy.wrap(row).should('contain.text', 'PRINTSCRIPT');
    });
  });

  it('Filters by compliance COMPLIANT', () => {
    cy.visit('/');
    cy.wait('@listSnippets');
    cy.get('[data-testid="compliance-select"]').click();
    cy.get('ul[role="listbox"]').contains('Compliant').click();
    cy.wait('@listSnippets');
    cy.get('[data-testid="snippet-row"]').each(row => {
      cy.wrap(row).should('contain.text', 'Compliant');
    });
  });

  it('Sort by Language DESC then ASC', () => {
    cy.visit('/');
    cy.wait('@listSnippets');
    cy.get('[data-testid="sort-by-select"]').click();
    cy.get('ul[role="listbox"]').contains('Language').click();
    cy.wait('@listSnippets');
    cy.get('[data-testid="sort-order-button"]').click();
    cy.wait('@listSnippets');
    cy.get('[data-testid="snippet-row"]').then(rows => {
      const langsDesc = [...rows].map(r => r.children[1].textContent);
      const sortedDesc = [...langsDesc].sort((a, b) => a!.localeCompare(b!)).reverse();
      expect(langsDesc).to.deep.equal(sortedDesc);
    });
    cy.get('[data-testid="sort-order-button"]').click();
    cy.wait('@listSnippets');
    cy.get('[data-testid="snippet-row"]').then(rows => {
      const langsAsc = [...rows].map(r => r.children[1].textContent);
      const sortedAsc = [...langsAsc].sort((a, b) => a!.localeCompare(b!));
      expect(langsAsc).to.deep.equal(sortedAsc);
    });
  });

  it('Clear filters resets to default', () => {
    cy.visit('/');
    cy.wait('@listSnippets');
    cy.get('[data-testid="ownership-select"]').click();
    cy.get('ul[role="listbox"]').contains('Owned').click();
    cy.get('[data-testid="language-select"]').click();
    cy.get('ul[role="listbox"]').contains('JAVA').click();
    cy.get('[data-testid="compliance-select"]').click();
    cy.get('ul[role="listbox"]').contains('Pending').click();
    cy.get('[data-testid="sort-by-select"]').click();
    cy.get('ul[role="listbox"]').contains('Language').click();
    cy.get('[data-testid="sort-order-button"]').click();
    cy.wait('@listSnippets');
    cy.get('[data-testid="clear-filters-button"]').click();
    cy.wait('@listSnippets');
    cy.get('[data-testid="snippet-row"]').should('have.length', dataSet.length);
  });
});
