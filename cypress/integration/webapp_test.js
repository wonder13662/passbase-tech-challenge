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

    cy.get("[data-cy=balance-usd]")
      .invoke("text")
      .should("gt", "0", { timeout: 5000 });

    cy.get("[data-cy=select-box-receiver]")
      .contains("mathias")
      .should("be.visible");

    cy.get("[data-cy=sender-currency-box]").should("be.visible");
    cy.get("[data-cy=select-box-currency-sender]").should("be.visible");
    cy.get("[data-cy=sender-amount-input]").should("be.visible");
    cy.get("[data-cy=receiver-amount-input]").should("be.visible");
    cy.get("[data-cy=select-box-currency-receiver]").should("be.visible");
  });

  it("Log out", function() {
    cy.visit("/");
    cy.contains("Log out").click();
  });
});

describe("Wire money", function() {
  it("Wonder13662 send USD 10 to Mathias", function() {
    cy.visit("/");
    cy.get("#formBasicEmail").type("wonder13662@gmail.com");
    cy.get("#formBasicPassword").type("zebu80");
    cy.get(".btn").click();
    cy.contains("Go to Transaction").click();

    // Check the transaction page
    cy.get("[data-cy=balance-usd]")
      .invoke("text")
      .should("gt", "0", { timeout: 5000 });
    cy.contains("mathias").should("be.visible");

    // Let's send some money!
    cy.get("[data-cy=balance-usd]")
      .invoke("text")
      .then(balanceUSD => {
        // Add 1 USD to send
        cy.get("[data-cy=sender-amount-input]").type(1);

        // Wire money to mathias
        cy.contains("Send").click();

        // After wiring money, USD balance should be lower than initial balance
        cy.get("[data-cy=balance-usd]")
          .invoke("text")
          .should("lt", balanceUSD, { timeout: 10000 });
      });

    cy.contains("Log out").click();
  });
});

describe("Return money back", function() {
  it("Mathias send USD 10 back to Wonder13662", function() {
    cy.visit("/");
    cy.get("#formBasicEmail").type("mathias@passbase.com");
    cy.get("#formBasicPassword").type("zebu80");
    cy.get(".btn").click();
    cy.contains("Go to Transaction").click();

    // Check the transaction page
    cy.contains("wonder13662").should("be.visible");
    cy.get("[data-cy=balance-usd]")
      .invoke("text")
      .should("gt", "0");
    // Let's send some money!
    cy.get("[data-cy=balance-usd]")
      .invoke("text")
      .then(balanceUSD => {
        // Add 1 USD to send
        cy.get("[data-cy=sender-amount-input]").type(1);

        // Wire money to mathias
        cy.contains("Send").click();

        // After wiring money, USD balance should be lower than initial balance
        cy.get("[data-cy=balance-usd]")
          .invoke("text")
          .should("lt", balanceUSD, { timeout: 10000 });
      });
    cy.contains("Log out").click();
  });
});
