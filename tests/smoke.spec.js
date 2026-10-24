import { test, expect } from "@playwright/test";

test.describe("SportXtreme Events Smoke Suite", () => {
  test("1. Home page loads with branding, navigation, and footer", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/SportXtreme Events/i);

    // Verify header and navigation
    const header = page.locator("header");
    await expect(header).toBeVisible();

    // Verify main landmark
    const main = page.locator("main");
    await expect(main).toBeVisible();

    // Verify footer
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });

  test("2. /events page lists events or shows empty state", async ({ page }) => {
    await page.goto("/events");
    await expect(page).toHaveTitle(/All Events & Tournaments/i);

    // Verify H1 heading
    const h1 = page.locator("h1");
    await expect(h1).toContainText("EVENTS");

    // Check for either event cards or empty state message
    const eventCards = page.locator(".sx-card");
    const emptyState = page.getByText(/no events currently match/i);
    const hasEvents = (await eventCards.count()) > 0;
    const hasEmpty = (await emptyState.count()) > 0;
    expect(hasEvents || hasEmpty).toBeTruthy();
  });

  test("3. /gallery loads and lightbox opens and closes with Esc", async ({ page }) => {
    await page.goto("/gallery");
    await expect(page).toHaveTitle(/Event Gallery/i);

    // Verify H1 heading
    const h1 = page.locator("h1");
    await expect(h1).toContainText("GALLERY");

    // Find first photo card if present
    const photoCard = page.locator(".sx-card").first();
    const count = await page.locator(".sx-card").count();
    if (count > 0) {
      await photoCard.click();

      // Verify modal dialog is open
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      // Press Escape to close
      await page.keyboard.press("Escape");
      await expect(dialog).not.toBeVisible();
    }
  });

  test("4. /register page validates required fields and does not submit real registrations", async ({ page }) => {
    await page.goto("/register");
    await expect(page).toHaveTitle(/Participant Registration/i);

    // Verify H1 heading
    const h1 = page.locator("h1");
    await expect(h1).toContainText("REGISTRATION");

    // Intercept RPC calls to ensure tests never write to live database
    await page.route("**/rest/v1/rpc/register_participant", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            registration_id: "00000000-0000-0000-0000-000000000001",
            registration_number: "SX-TEST-001",
            check_in_token: "test-token-123",
          },
        ]),
      });
    });

    // Attempt to submit empty form
    const submitBtn = page.getByRole("button", { name: /confirm registration/i });
    if (await submitBtn.isVisible()) {
      await submitBtn.click();

      // Verify browser validation or error prevents completion
      const nameInput = page.locator("#reg-name");
      const isRequired = await nameInput.getAttribute("required");
      expect(isRequired).not.toBeNull();
    }
  });

  test("5. Protected admin route redirects when logged out", async ({ page }) => {
    // Attempting to visit /admin/dashboard without auth should redirect to /admin/login
    await page.goto("/admin/dashboard");
    await page.waitForURL("**/admin/login");
    expect(page.url()).toContain("/admin/login");

    // Verify admin login form is displayed
    const loginBtn = page.getByRole("button", { name: /sign in|login|authenticate/i });
    await expect(loginBtn).toBeVisible();
  });
});
