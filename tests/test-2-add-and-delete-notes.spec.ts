import { test, expect } from '@playwright/test';

// Setting slowMo to 0 for speed, but you can change to 300 for debugging
test.use({ launchOptions: { slowMo: 0 } });

test.describe('Notes Management System', () => {

  test.beforeEach(async ({ page }) => {
    // Generate a fresh unique username for EVERY test to avoid "Already Taken" errors
    const uniqueUser = `user${Date.now()}`;
    const testPass = 'TestPass123';

    // 1. Navigate to the base URL
    await page.goto('./');

    // 2. Register a fresh user
    await page.locator('#showRegisterForm').click();
    await page.locator('#username_register').pressSequentially(uniqueUser, { delay: 100 });
    await page.locator('#password_register').fill(testPass);
    await page.locator('button[name="register"]').click();

    // 3. Wait for registration success message 
    const message = page.locator('.message');
    await expect(message).toContainText('Registration successful', { timeout: 5000 });

    // 4. Perform Login
    const loginSection = page.locator('#loginForm');
    await loginSection.locator('#username').fill(uniqueUser);
    await loginSection.locator('#password').fill(testPass);
    await loginSection.locator('button[name="login"]').click();

    // 5. Verify we reached the notes page
    await expect(page).toHaveURL(/.*notes.php/, { timeout: 5000 });
  });

  test('should add a new note and verify it in the list', async ({ page }) => {
    const title = 'Automation Note';
    const content = 'This note was created by Playwright.';

    // Fill the Add Note form
    await page.locator('#title').fill(title);
    await page.locator('#content').fill(content);
    await page.getByRole('button', { name: 'Add Note' }).click();

    // Verify success message
    const successMsg = page.locator('.message');
    await expect(successMsg).toContainText('Note added successfully!');

    // Verify the note appears in the container
    const firstNote = page.locator('.note').first();
    await expect(firstNote.locator('h3')).toHaveText(title);
    await expect(firstNote.locator('p').first()).toHaveText(content);

    // Delay 5 seconds to observe the result
    await page.waitForTimeout(5000);
  });

  test('should delete an existing note', async ({ page }) => {

    // Add a note so we have something to delete
    await page.locator('#title').pressSequentially('Delete Me', { delay: 100 });
    await page.locator('#content').pressSequentially('This note will be removed.', { delay: 100 });
    await page.getByRole('button', { name: 'Add Note' }).click();

    // Locate the specific note
    const noteToDelete = page.locator('.note').filter({ hasText: 'Delete Me' });

    // Click the delete button
    await noteToDelete.locator('button[name="delete_note"]').click();

    // Verify deletion message
    const deleteMsg = page.locator('.message');
    await expect(deleteMsg).toContainText('Note deleted successfully!');

    // Verify the note is gone
    await expect(noteToDelete).not.toBeVisible();
  });

  test('should logout and block access to notes.php', async ({ page }) => {
    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/.*index.php/);

    // Try to access notes.php directly
    await page.goto('./notes.php');
    await expect(page).toHaveURL(/.*index.php/);
  });
});