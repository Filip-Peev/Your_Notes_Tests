import { test, expect } from '@playwright/test';

// This will apply slow-mo to every test in THIS file only
test.use({ launchOptions: { slowMo: 100 } });

test.describe('Authentication Flow', () => {

  test.beforeEach(async ({ page }) => {
    // Navigates to the baseURL defined in playwright.config.ts
    await page.goto('./');
  });

  test('should toggle between login and registration forms', async ({ page }) => {
    const loginForm = page.locator('#loginForm');
    const registerForm = page.locator('#registerForm');

    // Verify initial state
    await expect(loginForm).toBeVisible();
    await expect(registerForm).toBeHidden();

    // Click 'Register' switch button
    await page.getByRole('button', { name: "Don't have an account? Register" }).click();
    await expect(registerForm).toBeVisible();
    await expect(loginForm).toBeHidden();

    // Click 'Login' switch button
    await page.getByRole('button', { name: 'Already have an account? Login' }).click();
    await expect(loginForm).toBeVisible();
  });

  test('should display red error message for invalid credentials', async ({ page }) => {
    const loginSection = page.locator('#loginForm');

    // Type the login form specifically
    await loginSection.getByLabel('Username:').pressSequentially('non_existent_user', { delay: 100 });
    await loginSection.getByLabel('Password:').pressSequentially('wrong_password', { delay: 100 });
    await loginSection.getByRole('button', { name: 'Login', exact: true }).click();

    // Verify error message appearance and styling
    const message = page.locator('.message');
    await expect(message).toBeVisible();
    await expect(message).toContainText('Invalid username or password.');

    // Check for the red color defined in your PHP inline style
    await expect(message.locator('span')).toHaveCSS('color', 'rgb(255, 0, 0)');
  });

  test('should successfully register a new user', async ({ page }) => {
    // 1. Switch to register form
    await page.locator('#showRegisterForm').click();

    const regSection = page.locator('#registerForm');
    const uniqueUsername = `user${Date.now()}`;

    // 2. Type registration details 
    await regSection.locator('#username_register').pressSequentially(uniqueUsername, { delay: 100 });
    await regSection.locator('#password_register').pressSequentially('SecurePass123', { delay: 100 });

    // 3. Click the Register SUBMIT button
    await regSection.locator('button[name="register"]').click();

    // 4. Verify success message
    const message = page.locator('.message');

    // Increase timeout slightly in case the PHP/DB processing is slow on the live server
    await expect(message).toBeVisible({ timeout: 5000 });
    await expect(message).toContainText('Registration successful');

    // Your PHP outputs: <span style='color: green;'>
    // Note: Browsers usually convert 'green' to 'rgb(0, 128, 0)'
    await expect(message.locator('span')).toHaveCSS('color', 'rgb(0, 128, 0)');
  });
});