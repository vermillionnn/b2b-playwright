// @ts-check
import { test, expect } from '@playwright/test';
import { join } from 'path';
import dotenv from 'dotenv';
import { SalesOrderPage } from './pages/SalesOrder.page';
import loginData from './fixtures/loginData.json' assert { type: 'json' };
import salesOrderData from './fixtures/salesOrderData.json' assert { type: 'json' };
import * as b2b from '../helpers/helperFunctions';
import { getDate, getSequenceNumber } from '../helpers/helperFunctions';

dotenv.config({ path: 'env/UAT.env' });

//Test Data
const baseUrl = process.env.BASE_URL;

// Login before each test
test.beforeEach(async ({ page }) => {
  await b2b.login(page, baseUrl, loginData.validUser.email, loginData.validUser.password);
});

// Create SO
test('Create Sales Order', async ({ page }) => {
  const salesOrderPage = new SalesOrderPage(page);
  const so = salesOrderPage.selectors;
  
  // Navigate to Add Sales Order Menu
  await b2b.goToMenu(page, baseUrl, 'Transaction', 'Add Sales Order');
  await page.waitForLoadState('networkidle');

  // Select Customer with API response handling
  await expect(so.customerField).toBeVisible({ timeout: 10000 });
  await so.customerField.click({ force: true });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  const responsePromise = page.waitForResponse(response =>
    response.url().includes('uat-b2b-ms-accounts.sociolabs.io/customers') &&
    response.url().includes('filter[status]=approved') &&
    response.url().includes('filter[is_active]=true') &&
    response.status() === 200,
    { timeout: 25000 }
  );
  
  await expect(so.modal).toBeVisible({ timeout: 10000 });
  await so.modal.fill(salesOrderData.customer.name);
  await page.getByText(salesOrderData.customer.name).click({ timeout: 10000 });
  
  // Extract customer data from API response
  const response = await responsePromise;
  const responseData = await response.json();
  const customerData = responseData.data[0];
  const invoiceAddress = customerData.invoice_address[0].name;
  const deliveryAddressName = customerData.delivery_address[0].name;
  const deliveryAddressFull = `${customerData.delivery_address[0].street}, ${customerData.delivery_address[0].city.name}, ${customerData.delivery_address[0].country.name}, ${customerData.delivery_address[0].postal_code}`;
  const salesTeam = customerData.sales_team.name;
  const salesPerson = customerData.user.name;
  const warehouseName = customerData.sales_team.warehouse.name;

  console.log('Extracted Delivery Address: ' + deliveryAddressFull);
  console.log('Extracted Sales Team: ' + salesTeam);
  console.log('Extracted salesPerson: ' + salesPerson);
  console.log('Extracted Warehouse: ' + warehouseName);
  
  // Verify invoice address auto-populated
  await expect(so.invoiceAddressField).toHaveValue(invoiceAddress);

  // Select Delivery Address
  await b2b.selectDropdown(page, so, 'deliveryAddressField', deliveryAddressName);
  await expect(page.getByText(deliveryAddressFull)).toBeVisible();

  // Select Sales Team
  await b2b.selectDropdown(page, so, 'salesTeamField', salesTeam);
  
  // Select Sales Person
  await b2b.selectDropdown(page, so, 'salesPersonField', salesPerson);

  // Verify Warehouse auto-selected
  await expect(so.warehouseField).toHaveValue(warehouseName);

  // Set Expiration Date (2 days from today)
  await so.expirationDateField.click({ force: true, timeout: 10000 });
  await page.waitForTimeout(1000);

  const today = new Date();
  const twoDaysFromToday = new Date(today);
  twoDaysFromToday.setDate(twoDaysFromToday.getDate() + 2);
  const expirationDay = twoDaysFromToday.getDate();
  console.log('Today: ' + today.getDate() + ', Selecting expiration date: ' + expirationDay);
  await page.getByText(String(expirationDay), {exact: true}).click({ force: true, timeout: 10000});
  await page.getByText('SELECT', { exact: true }).click();

  // Select Pricelist
  await b2b.selectDropdown(page, so, 'pricelistField', salesOrderData.pricelist.name);

  // Fill Customer PO Number
  const customerPONumber = 'AFT-PO-AUTO-' + getDate() + '-' + getSequenceNumber();
  await so.customerPONumberField.fill(customerPONumber);

  // Set Customer PO Date (today)
  await so.customerPODateField.click({ force: true, timeout: 10000 });
  console.log('Selecting customer PO date: ' + today.getDate());
  await page.waitForTimeout(1000);
  await page.locator('div').filter({ hasText: String(today.getDate()) }).nth(3).click({ force: true, timeout: 10000 });
  // await page.getByText(String(today.getDate()), {exact: true}).click({ force: true, timeout: 10000 });
  await page.getByText('SELECT', { exact: true }).click();

  // Add Attachment
  await so.attachmentButton.scrollIntoViewIfNeeded();
  const filePath = join(__dirname, './sample-file/sample-attachment.png');
  const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      so.attachmentButton.click()
  ]);
  await fileChooser.setFiles(filePath);

  // Add Product with API price handling
  await so.addProductButton.scrollIntoViewIfNeeded();
  await so.addProductButton.click();

  const priceResponsePromise = page.waitForResponse(response =>
    response.url().includes('uat-b2b-api.sociolabs.io/product-price-rules/search') &&
    response.status() === 200,
    { timeout: 20000 }
  );

  await b2b.selectDropdown(page, so, 'productNameField', salesOrderData.product.name);

  // Get price from API response
  const priceResponse = await priceResponsePromise;
  const priceResponseData = await priceResponse.json();
  const finalPrice = priceResponseData.data[0].final_price;
  console.log('Extracted Final Price: ' + finalPrice);

  await so.quantityField.fill(salesOrderData.product.quantity);
  
  // Save product line
  await page.getByRole('button', { name: 'Save', exact: true }).click({timeout: 10000});

  // Save Sales Order
  await page.getByRole('button', { name: 'SAVE', exact: true }).scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'SAVE', exact: true }).click();
  
  await expect(page.getByText('Sales Order Submitted').nth(1)).toBeVisible({ timeout: 10000 });
  await page.getByText('OK').nth(1).click();
  await expect(page.getByRole('button', { name: 'Edit', exact: true })).toBeVisible();

  // Add Salesman Signature
  await so.salesmanSignatureField.scrollIntoViewIfNeeded();
  await so.salesmanSignatureField.click({ force: true });
  await expect(so.signatureField).toBeVisible();
  await b2b.drawSignature(page);
  await so.nameSignatureField.fill(salesPerson);
  await page.getByRole('button', { name: 'Add' }).click({ force: true });
  
  // Add Customer Signature
  await so.customerSignatureField.click({ force: true });
  await b2b.drawSignature(page);
  await so.nameSignatureField.fill(salesOrderData.customer.name);
  await page.getByRole('button', { name: 'Add' }).click({ force: true });

  // Request Confirmation
  await page.getByRole('button', { name: 'Request Confirmation', exact: true }).scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Request Confirmation', exact: true }).click();
  await page.getByText('OK').nth(2).click();
  
  await expect(page.getByText('Sales Order Submitted').nth(4)).toBeVisible({ timeout: 10000 });
  await page.getByText('OK').nth(2).click();
});


//Approve SO
test('Approve Sales Order', async ({ page }) => {

});

//Reject SO
test('Reject Sales Order', async ({ page }) => {

});

//SO Page Visibility
test('Sales Order Page Visibility', async ({ page }) => {

});