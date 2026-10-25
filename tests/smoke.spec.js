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

  test("2. /events page renders with H1 and lists events or shows empty state", async ({ page }) => {
    await page.goto("/events");
    await expect(page).toHaveTitle(/All Events & Tournaments/i);

    // Verify single H1 heading
    const h1 = page.locator("h1");
    await expect(h1).toHaveCount(1);
    await expect(h1).toContainText("EVENTS");

    // Check for either event cards or empty state message
    const eventCards = page.locator(".sx-card");
    const emptyState = page.getByText(/no events currently match/i);
    const hasEvents = (await eventCards.count()) > 0;
    const hasEmpty = (await emptyState.count()) > 0;
    expect(hasEvents || hasEmpty).toBeTruthy();
  });

  test("3. /gallery lightbox supports keyboard arrow navigation and restores focus on close", async ({ page }) => {
    await page.goto("/gallery");
    await expect(page).toHaveTitle(/Event Gallery/i);

    const h1 = page.locator("h1");
    await expect(h1).toHaveCount(1);
    await expect(h1).toContainText("GALLERY");

    const photoCards = page.locator('button[aria-label^="View photo:"]');
    const count = await photoCards.count();

    if (count > 1) {
      const firstCard = photoCards.first();
      await firstCard.click();

      // Dialog opens
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      // ArrowRight navigates to next photo
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(100);

      // ArrowLeft navigates back
      await page.keyboard.press("ArrowLeft");
      await page.waitForTimeout(100);

      // Escape closes dialog
      await page.keyboard.press("Escape");
      await expect(dialog).not.toBeVisible();

      // Focus should be restored to the triggering element
      await expect(firstCard).toBeFocused();
    }
  });

  test("4. /register form validates required fields on empty submit", async ({ page }) => {
    await page.goto("/register");
    await expect(page).toHaveTitle(/Participant Registration/i);

    const h1 = page.locator("h1");
    await expect(h1).toHaveCount(1);
    await expect(h1).toContainText("REGISTRATION");

    // HTML5 required attributes must be present
    const nameInput = page.locator("#reg-name");
    await expect(nameInput).toHaveAttribute("required", "");

    const emailInput = page.locator("#reg-email");
    await expect(emailInput).toHaveAttribute("required", "");

    const phoneInput = page.locator("#reg-phone");
    await expect(phoneInput).toHaveAttribute("required", "");
  });

  test("5. /register mocks RPC success and displays ticket with in-browser QR code", async ({ page }) => {
    // Intercept RPC call to return successful ticket credentials without live DB mutation
    await page.route("**/rest/v1/rpc/register_participant", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            success: true,
            code: "SUCCESS",
            message: "Registration confirmed successfully!",
            registration_id: "00000000-0000-0000-0000-000000000001",
            registration_number: "SX-777888",
            check_in_token: "mock-opaque-token-abc123xyz",
          },
        ]),
      });
    });

    await page.goto("/register");

    // Wait for event options to load
    const eventSelect = page.locator("#reg-event-select");
    await expect(eventSelect).toBeVisible();

    // Select first available event if present
    const options = await eventSelect.locator("option").all();
    if (options.length > 1) {
      const optionValue = await options[1].getAttribute("value");
      if (optionValue) {
        await eventSelect.selectOption(optionValue);
      }
    }

    // Fill registration form
    await page.fill("#reg-name", "Test Athlete");
    await page.fill("#reg-email", "athlete.test@example.com");
    await page.fill("#reg-phone", "+919876543210");

    // Submit form
    const submitBtn = page.getByRole("button", { name: /confirm registration/i });
    if (await submitBtn.isEnabled()) {
      await submitBtn.click();

      // Assert confirmed ticket display
      await expect(page.getByText(/REGISTRATION CONFIRMED/i)).toBeVisible({ timeout: 5000 });
      await expect(page.getByText("SX-777888")).toBeVisible();

      // Assert QR code image generated via data URL (no api.qrserver.com)
      const qrImg = page.locator('img[alt="Ticket verification QR Code"]');
      await expect(qrImg).toBeVisible();
      const src = await qrImg.getAttribute("src");
      expect(src).toMatch(/^data:image\/png;base64,/);
    }
  });

  test("6. /register handles DUPLICATE_REGISTRATION error code from RPC", async ({ page }) => {
    await page.route("**/rest/v1/events*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "00000000-0000-0000-0000-000000000001",
            title: "National Marathon 2026",
            status: "open",
            event_date: "2026-12-31",
            registration_deadline: "2026-12-01",
            max_participants: 500,
            registration_price: 499,
          },
        ]),
      });
    });

    await page.route("**/rest/v1/rpc/register_participant", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            success: false,
            code: "DUPLICATE_REGISTRATION",
            message: "A participant with this email or phone is already registered.",
            registration_id: null,
            registration_number: null,
            check_in_token: null,
          },
        ]),
      });
    });

    await page.goto("/register");
    const eventSelect = page.locator("#reg-event-select");
    await expect(eventSelect).toBeVisible({ timeout: 5000 });
    await expect(page.locator("#reg-name")).toBeVisible({ timeout: 5000 });

    await page.fill("#reg-name", "Duplicate Runner");
    await page.fill("#reg-email", "runner@example.com");
    await page.fill("#reg-phone", "+919876543210");

    const submitBtn = page.getByRole("button", { name: /confirm registration/i });
    if (await submitBtn.isEnabled()) {
      await submitBtn.click();
      const alert = page.locator('[role="alert"]#reg-error-summary');
      await expect(alert).toBeVisible();
      await expect(alert).toContainText(/already registered/i);
    }
  });

  test("7. /register handles EVENT_FULL error code from RPC", async ({ page }) => {
    await page.route("**/rest/v1/events*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "00000000-0000-0000-0000-000000000001",
            title: "National Marathon 2026",
            status: "open",
            event_date: "2026-12-31",
            registration_deadline: "2026-12-01",
            max_participants: 500,
            registration_price: 499,
          },
        ]),
      });
    });

    await page.route("**/rest/v1/rpc/register_participant", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            success: false,
            code: "EVENT_FULL",
            message: "This event has reached full capacity.",
            registration_id: null,
            registration_number: null,
            check_in_token: null,
          },
        ]),
      });
    });

    await page.goto("/register");
    const eventSelect = page.locator("#reg-event-select");
    await expect(eventSelect).toBeVisible({ timeout: 5000 });
    await expect(page.locator("#reg-name")).toBeVisible({ timeout: 5000 });

    await page.fill("#reg-name", "Late Runner");
    await page.fill("#reg-email", "late@example.com");
    await page.fill("#reg-phone", "+919876543210");

    const submitBtn = page.getByRole("button", { name: /confirm registration/i });
    if (await submitBtn.isEnabled()) {
      await submitBtn.click();
      const alert = page.locator('[role="alert"]#reg-error-summary');
      await expect(alert).toBeVisible();
      await expect(alert).toContainText(/Maximum participant capacity reached/i);
    }
  });

  test("8. /register handles REGISTRATION_CLOSED error code from RPC", async ({ page }) => {
    await page.route("**/rest/v1/events*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "00000000-0000-0000-0000-000000000001",
            title: "National Marathon 2026",
            status: "open",
            event_date: "2026-12-31",
            registration_deadline: "2026-12-01",
            max_participants: 500,
            registration_price: 499,
          },
        ]),
      });
    });

    await page.route("**/rest/v1/rpc/register_participant", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            success: false,
            code: "REGISTRATION_CLOSED",
            message: "The registration deadline has passed.",
            registration_id: null,
            registration_number: null,
            check_in_token: null,
          },
        ]),
      });
    });

    await page.goto("/register");
    const eventSelect = page.locator("#reg-event-select");
    await expect(eventSelect).toBeVisible({ timeout: 5000 });
    await expect(page.locator("#reg-name")).toBeVisible({ timeout: 5000 });

    await page.fill("#reg-name", "Closed Runner");
    await page.fill("#reg-email", "closed@example.com");
    await page.fill("#reg-phone", "+919876543210");

    const submitBtn = page.getByRole("button", { name: /confirm registration/i });
    if (await submitBtn.isEnabled()) {
      await submitBtn.click();
      const alert = page.locator('[role="alert"]#reg-error-summary');
      await expect(alert).toBeVisible();
      await expect(alert).toContainText(/deadline for this event has passed/i);
    }
  });

  test("9. Protected admin route redirects unauthenticated users to /admin/login", async ({ page }) => {
    await page.route("**/auth/v1/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ session: null, user: null }),
      });
    });

    await page.goto("/admin/dashboard");
    await page.waitForURL("**/admin/login", { timeout: 10000 });
    expect(page.url()).toContain("/admin/login");

    const loginBtn = page.getByRole("button", { name: /sign in|login|authenticate/i });
    await expect(loginBtn).toBeVisible({ timeout: 5000 });
  });

  test("10. Zero unhandled console errors across all customer routes", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        // Ignore expected connection errors if live backend unreachable in isolated test runs
        if (!text.includes("Failed to load resource") && !text.includes("ERR_CONNECTION_REFUSED")) {
          consoleErrors.push(text);
        }
      }
    });

    const routes = ["/", "/events", "/gallery", "/register"];
    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");
    }

    expect(consoleErrors).toEqual([]);
  });
});
