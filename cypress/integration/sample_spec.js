describe("Test Webapp", function() {
  it("Visits the Login page", function() {
    cy.visit("/");

    cy.get("#formBasicEmail").should("be.visible");
    cy.get("#formBasicPassword").should("be.visible");
    cy.get(".btn").should("be.visible");
  });

  it("Try login", function() {
    cy.visit("/");
    cy.get("#formBasicEmail").type("wonder13662@gmail.com");
    cy.get("#formBasicPassword").type("zebu80");
    cy.get(".btn").click();

    // Check Url - overview
    cy.url().should("include", "/overview");

    // Check Overview page
    cy.contains("Go to Transaction").should("be.visible");
    cy.contains("Log out").should("be.visible");

    // Check Currency Data loaded
    cy.get("[data-cy=currency-rate-table]").should("be.visible");
    cy.get("[data-cy=currency-rate-table]")
      .find("tbody > tr")
      .should("be.visible");

    // Check USD, EUR, GBP is visible
    cy.get("[data-cy=currency-rate-table]")
      .find("tbody")
      .children()
      .should("have.length", 6);

    // Check Balances loaded
    cy.get("[data-cy=balance-table]").should("be.visible");
    cy.get("[data-cy=balance-table]")
      .find("tbody > tr")
      .should("be.visible");
    cy.get("[data-cy=balance-table]")
      .find("tbody")
      .children()
      .should("have.length", 3);

    // Check Transaction history loaded
    cy.get("[data-cy=transaction-table]").should("be.visible");
    cy.get("[data-cy=transaction-table]")
      .find("tbody > tr")
      .should("be.visible");
  });

  it("Open the transaction page", function() {
    cy.visit("/");
    cy.contains("Go to Transaction").click();

    cy.get("[data-cy=select-box-receiver]").should("be.visible");

    cy.get("[data-cy=sender-currency-box]").should("be.visible");
  });

  it("Log out", function() {
    cy.visit("/");
    cy.contains("Log out").click();
  });
});
