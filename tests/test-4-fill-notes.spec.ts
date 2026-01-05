import { test, expect } from '@playwright/test';

test.use({ launchOptions: { slowMo: 0 } });

test.describe('Notes Management System - Single User Flow', () => {

  test('should manage multiple notes and logout', async ({ page }) => {
    test.setTimeout(120000);
    const uniqueUser = `user${Date.now()}`;
    const testPass = 'TestPass123';
    const baseTitle = 'Automation Note';
    const baseContent = 'This note was created by Playwright.';

    // --- STEP 1: REGISTER AND LOGIN ---
    await test.step('Register and Login', async () => {
      await page.goto('./');
      await page.locator('#showRegisterForm').click();
      await page.locator('#username_register').fill(uniqueUser);
      await page.locator('#password_register').fill(testPass);
      await page.locator('button[name="register"]').click();

      const message = page.locator('.message');
      await expect(message).toContainText('Registration successful');

      const loginSection = page.locator('#loginForm');
      await loginSection.locator('#username').fill(uniqueUser);
      await loginSection.locator('#password').fill(testPass);
      await loginSection.locator('button[name="login"]').click();
      await expect(page).toHaveURL(/.*notes.php/);
    });

    // --- STEP 2: ADD 10 NOTES TOTAL ---
    await test.step('Add 10 notes', async () => {
      for (let i = 1; i <= 10; i++) {
        const currentTitle = `${baseTitle} #${i}`;
        const currentContent = `${baseContent} iteration ${i}`;

        await page.locator('#title').fill(currentTitle);
        await page.locator('#content').fill(currentContent);
        await page.getByRole('button', { name: 'Add Note' }).click();

        // Verify success message and visibility for each note
        await expect(page.locator('.message')).toContainText('Note added successfully!');
        await expect(page.locator('.note', { hasText: currentTitle })).toBeVisible();
      }

      // Final count check: ensure at least 10 notes are visible on the page
      const noteCount = await page.locator('.note').count();
      expect(noteCount).toBeGreaterThanOrEqual(10);
    });

    // --- STEP 3: LOGOUT ---
    await test.step('Logout and verify access', async () => {
      await page.getByRole('button', { name: 'Logout' }).click();
      await expect(page).toHaveURL(/.*index.php/);

      await page.goto('./notes.php');
      await expect(page).toHaveURL(/.*index.php/);
    });
  });
});