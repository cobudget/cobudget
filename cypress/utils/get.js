export default function get (testid) {
    return cy.get(`[data-testid=${testid}]`);
}