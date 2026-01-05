import { test, expect } from '@playwright/test';

test.use({ launchOptions: { slowMo: 0 } });

test.describe('Notes Management System - Single User Flow', () => {
  
  test('should manage notes and logout with a single user', async ({ page }) => {
    const uniqueUser = `user${Date.now()}`;
    const testPass = 'TestPass123';
    const title = 'Automation Note';
    const content = 'This note was created by Playwright.';

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

    // --- STEP 2: ADD A NOTE ---
    await test.step('Add a note', async () => {
      await page.locator('#title').fill(title);
      await page.locator('#content').fill(content);
      await page.getByRole('button', { name: 'Add Note' }).click();
      
      await expect(page.locator('.message')).toContainText('Note added successfully!');
      await expect(page.locator('.note').first().locator('h3')).toHaveText(title);
    });

    // --- STEP 3: DELETE THE NOTE ---
    await test.step('Delete the note', async () => {
      const noteToDelete = page.locator('.note').filter({ hasText: title });
      await noteToDelete.locator('button[name="delete_note"]').click();
      
      await expect(page.locator('.message')).toContainText('Note deleted successfully!');
      await expect(noteToDelete).not.toBeVisible();
    });

    // --- STEP 4: LOGOUT ---
    await test.step('Logout and verify access', async () => {
      await page.getByRole('button', { name: 'Logout' }).click();
      await expect(page).toHaveURL(/.*index.php/);

      await page.goto('./notes.php');
      await expect(page).toHaveURL(/.*index.php/);
    });
  });
});