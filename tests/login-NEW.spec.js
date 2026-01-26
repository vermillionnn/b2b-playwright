// @ts-check
import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { DashboardPage } from './pages/Dashboard.page';
import loginData from './fixtures/loginData.json' assert { type: 'json' };
import * as b2b from '../helpers/helperFunctions';

dotenv.config({ path: 'env/UAT.env' });

// Test Data
const baseUrl = process.env.BASE_URL;


// Login
test.describe('[Test Set] Login', () => {
   // Test Case: Login as Superadmin
   test('[Test Case][Positive] Login as Superadmin', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      const d = dashboardPage.selectors;

      await b2b.login(page, baseUrl, loginData.superadminUser.email, loginData.superadminUser.password);
      await expect(page).toHaveURL('https://uat-b2b-apps.sociolabs.io/dashboard');
      await expect(page.getByText(loginData.toastMsg.successLogin, { exact: true })).toBeVisible();
      await expect(d.assignedCustomersSection).toBeVisible();
      await expect(d.plannedActivitySection).toBeVisible();
      await expect(d.totalSalesOrderSection).toBeVisible();
      await expect(d.totalSalesInvoiceSection).toBeVisible();
      await expect(d.upcomingActivitiesSection).toBeVisible();
      await expect(d.taskSection).toBeVisible();
      await page.waitForTimeout(500);
  });

  // Test Case: Login as Salesman
  test('[Test Case][Positive] Login as Salesman', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      const d = dashboardPage.selectors;

      await b2b.login(page, baseUrl, loginData.salesmanUser.email, loginData.salesmanUser.password);
      await expect(page).toHaveURL('https://uat-b2b-apps.sociolabs.io/dashboard');
      await expect(page.getByText(loginData.toastMsg.successLogin, { exact: true })).toBeVisible();
      await expect(d.assignedCustomersSection).toBeVisible();
      await expect(d.plannedActivitySection).toBeVisible();
      await expect(d.totalSalesOrderSection).toBeVisible();
      await expect(d.totalSalesInvoiceSection).toBeVisible();
      await expect(d.upcomingActivitiesSection).toBeVisible();
      await expect(d.taskSection).toBeVisible();
      await page.waitForTimeout(500);
  });

  test('[Test Case][Positive] Login as Beauty Advisor', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      const d = dashboardPage.selectors;
      await b2b.login(page, baseUrl, loginData.beautyAdvisorUser.email, loginData.beautyAdvisorUser.password);
      await expect(page).toHaveURL('https://uat-b2b-apps.sociolabs.io/dashboard');
      await expect(page.getByText(loginData.toastMsg.successLogin, { exact: true })).toBeVisible();
      await expect(d.numberOfVisitSection).toBeVisible();
      await expect(d.plannedActivitySection).toBeVisible();
      await expect(d.totalSellInSection).toBeVisible();
      await expect(d.totalSellOutSection).toBeVisible();
      await expect(d.upcomingActivitiesSection).toBeVisible();
      await expect(d.taskSection).toBeVisible();
      await page.waitForTimeout(500);
  });

  test('[Test Case][Negative] Login using Invalid Email', async ({ page }) => {
     await b2b.login(page, baseUrl, loginData.invalidEmail.email, loginData.invalidEmail.password);
     await expect(page).toHaveURL('https://uat-b2b-apps.sociolabs.io/login');
     await expect(page.getByText(loginData.errorMsg.invalidEmail, { exact: true })).toBeVisible();
     await page.waitForTimeout(500);
  });

  test('[Test Case][Negative] Login using Invalid Password', async ({ page }) => {
     await b2b.login(page, baseUrl, loginData.invalidPassword.email, loginData.invalidPassword.password);
     await expect(page).toHaveURL('https://uat-b2b-apps.sociolabs.io/login');
     await expect(page.getByText(loginData.errorMsg.invalidPassword, { exact: true })).toBeVisible();
     await page.waitForTimeout(500);
  });
});
    