// @ts-check
import { test, expect } from '@playwright/test';
import { join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import dotenv from 'dotenv';
import { SalesOrderPage } from './pages/SalesOrder.page';
import loginData from './fixtures/loginData.json' assert { type: 'json' };
import salesOrderData from './fixtures/salesOrderData.json' assert { type: 'json' };
import * as b2b from '../helpers/helperFunctions';
import { getDate, getSequenceNumber } from '../helpers/helperFunctions';

dotenv.config({ path: 'env/UAT.env' });

//Test Data
const baseUrl = process.env.BASE_URL;

// Test Set for Superadmin User
test.describe('[Test Set] Create Sales Order - Superadmin', () => {
  test.beforeEach(async ({ page }) => {
    await b2b.login(page, baseUrl, loginData.superadminUser.email, loginData.superadminUser.password);
  });

  // Test Case: Create SO for MT Customer and Submit
  test('[Test Case] Create Sales Order MT - Submit', async ({ page }) => {
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
    await so.modal.fill(salesOrderData.MT.customer.name);
    await page.getByText(salesOrderData.MT.customer.name).click({ timeout: 10000 });
    
    // Extract customer data from API response
    const response = await responsePromise;
    const responseData = await response.json();
    const customerData = responseData.data[0];
    const invoiceAddress = customerData.invoice_address[0].name;
    const invoiceAddressFull = `${customerData.invoice_address[0].street}, ${customerData.invoice_address[0].city.name}, ${customerData.invoice_address[0].country.name}, ${customerData.invoice_address[0].postal_code}`;
    const deliveryAddressName = customerData.delivery_address[0].name;
    const deliveryAddressFull = `${customerData.delivery_address[0].street}, ${customerData.delivery_address[0].city.name}, ${customerData.delivery_address[0].country.name}, ${customerData.delivery_address[0].postal_code}`;
    const salesTeam = customerData.sales_team.name;
    const salesPerson = customerData.user.name;
    const warehouseName = customerData.sales_team.warehouse.name;

    console.log('Extracted Invoice Address: ' + invoiceAddressFull);
    console.log('Extracted Delivery Address: ' + deliveryAddressFull);
    console.log('Extracted Sales Team: ' + salesTeam);
    console.log('Extracted salesPerson: ' + salesPerson);
    console.log('Extracted Warehouse: ' + warehouseName);
    
    // Select Invoice Address
    await b2b.selectDropdown(page, so, 'invoiceAddressField', invoiceAddress);
    await expect(so.invoiceAddressField).toHaveValue(invoiceAddress);
    await expect(page.getByText(invoiceAddressFull).first()).toBeVisible();

    // Select Delivery Address
    await b2b.selectDropdown(page, so, 'deliveryAddressField', deliveryAddressName);
    await expect(so.deliveryAddressField).toHaveValue(deliveryAddressName);
    await expect(page.getByText(deliveryAddressFull).first()).toBeVisible();

    // Select Sales Team
    await b2b.selectDropdown(page, so, 'salesTeamField', salesTeam);
    
    // Select Sales Person
    await b2b.selectDropdown(page, so, 'salesPersonField', salesPerson);

    // Verify Warehouse auto-selected
    await expect(so.warehouseField).toHaveValue(warehouseName);

    // Set Expiration Date (2 days from today)
    await b2b.selectDate(page, so, 'expirationDateField', 2);

    // Select Pricelist
    await b2b.selectDropdown(page, so, 'pricelistField', salesOrderData.MT.pricelist.name);

    // Fill Customer PO Number
    const customerPONumber = 'AFT-PO-AUTO-' + getDate() + '-' + getSequenceNumber('salesOrder');
    await so.customerPONumberField.fill(customerPONumber);
    console.log('Customer PO Number: ' + customerPONumber);

    // Set Customer PO Date (today)
    await b2b.selectDate(page, so, 'customerPODateField', 0);
    // await page.getByText(String(today.getDate()), {exact: true}).click({ force: true, timeout: 10000 });

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

    await b2b.selectDropdown(page, so, 'productNameField', salesOrderData.MT.product.name);

    // Get price from API response
    const priceResponse = await priceResponsePromise;
    const priceResponseData = await priceResponse.json();
    const finalPrice = priceResponseData.data[0].final_price;
    console.log('Extracted Final Price: ' + finalPrice);

    await so.quantityField.fill(salesOrderData.MT.product.quantity);
    
    // Save product
    await b2b.clickButton(page, so, 'saveButton');

    // Get SO Reference Code & Sales Order ID from API
    const referenceCodeResponsePromise = page.waitForResponse(response =>
      response.url().includes('uat-b2b-ms-orders.sociolabs.io/orders') &&
      response.request().method() === 'POST' &&
      response.status() === 200,
      { timeout: 25000 }
    );
    
    // Save Sales Order
    await so.saveFormButton.scrollIntoViewIfNeeded();
    await b2b.clickButton(page, so, 'saveFormButton');
    
    const referenceCodeResponse = await referenceCodeResponsePromise;
    const referenceCodeResponseData = await referenceCodeResponse.json();
    const salesOrderId = referenceCodeResponseData.data._id;
    const referenceCode = referenceCodeResponseData.data.reference_code;
    console.log('Sales Order ID: ' + salesOrderId);
    console.log('Sales Order Reference Code: ' + referenceCode);
    
    // Save to salesOrderData.json
    const dataPath = join(__dirname, './fixtures/salesOrderData.json');
    const data = JSON.parse(readFileSync(dataPath, 'utf-8'));
    data.lastCreatedSalesOrder.salesOrderId = salesOrderId;
    data.lastCreatedSalesOrder.referenceCode = referenceCode;
    writeFileSync(dataPath, JSON.stringify(data, null, 4));
    
    // Sales Order Submitted Pop-Up
    await expect(page.getByText('Sales Order Submitted').nth(1)).toBeVisible({ timeout: 10000 });
    await page.getByText('OK').nth(1).click();
    await expect(page.getByRole('button', { name: 'Edit', exact: true })).toBeVisible();

    // Add Salesman Signature
    await so.salesmanSignatureField.scrollIntoViewIfNeeded();
    await expect(so.salesmanSignatureField).toBeVisible();

    await so.salesmanSignatureField.click({ force: true});
    await page.waitForTimeout(1000);
    await page.waitForLoadState('networkidle');
    // await expect(so.signatureField).toBeVisible();
    await b2b.drawSignature(page);
    await so.nameSignatureField.fill(salesPerson);
    await b2b.clickButton(page, so, 'addSignatureButton');

    await page.waitForTimeout(1000);
    await page.waitForLoadState('networkidle');
    
    // Add Customer Signature
    await so.customerSignatureField.click({ force: true});
    await page.waitForTimeout(1000);
    await page.waitForLoadState('networkidle');
    // await expect(so.signatureField).toBeVisible();
    await b2b.drawSignature(page);
    await so.nameSignatureField.fill(salesOrderData.MT.customer.name);
    await b2b.clickButton(page, so, 'addSignatureButton');

    // Request Confirmation
    await page.getByRole('button', { name: 'Request Confirmation', exact: true }).scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Request Confirmation', exact: true }).click();
    await page.getByText('OK').nth(2).click();
    
    await expect(page.getByText('Sales Order Submitted').nth(4)).toBeVisible({ timeout: 10000 });
    await page.getByText('OK').nth(2).click();
  });
  
  // Test Case: Create SO for MT Customer and Save Draft
  test('[Test Case] Create Sales Order MT - Save Draft', async ({ page }) => {
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
    await so.modal.fill(salesOrderData.MT.customer.name);
    await page.getByText(salesOrderData.MT.customer.name).click({ timeout: 10000 });
    
    // Extract customer data from API response
    const response = await responsePromise;
    const responseData = await response.json();
    const customerData = responseData.data[0];
    const invoiceAddress = customerData.invoice_address[0].name;
    const invoiceAddressFull = `${customerData.invoice_address[0].street}, ${customerData.invoice_address[0].city.name}, ${customerData.invoice_address[0].country.name}, ${customerData.invoice_address[0].postal_code}`;
    const deliveryAddressName = customerData.delivery_address[0].name;
    const deliveryAddressFull = `${customerData.delivery_address[0].street}, ${customerData.delivery_address[0].city.name}, ${customerData.delivery_address[0].country.name}, ${customerData.delivery_address[0].postal_code}`;
    const salesTeam = customerData.sales_team.name;
    const salesPerson = customerData.user.name;
    const warehouseName = customerData.sales_team.warehouse.name;

    console.log('Extracted Invoice Address: ' + invoiceAddressFull);
    console.log('Extracted Delivery Address: ' + deliveryAddressFull);
    console.log('Extracted Sales Team: ' + salesTeam);
    console.log('Extracted salesPerson: ' + salesPerson);
    console.log('Extracted Warehouse: ' + warehouseName);
    
    // Select Invoice Address
    await b2b.selectDropdown(page, so, 'invoiceAddressField', invoiceAddress);
    await expect(so.invoiceAddressField).toHaveValue(invoiceAddress);
    await expect(page.getByText(invoiceAddressFull).first()).toBeVisible();

    // Select Delivery Address
    await b2b.selectDropdown(page, so, 'deliveryAddressField', deliveryAddressName);
    await expect(so.deliveryAddressField).toHaveValue(deliveryAddressName);
    await expect(page.getByText(deliveryAddressFull).first()).toBeVisible();

    // Select Sales Team
    await b2b.selectDropdown(page, so, 'salesTeamField', salesTeam);
    
    // Select Sales Person
    await b2b.selectDropdown(page, so, 'salesPersonField', salesPerson);

    // Verify Warehouse auto-selected
    await expect(so.warehouseField).toHaveValue(warehouseName);

    // Set Expiration Date (2 days from today)
    await b2b.selectDate(page, so, 'expirationDateField', 2);

    // Select Pricelist
    await b2b.selectDropdown(page, so, 'pricelistField', salesOrderData.MT.pricelist.name);

    // Fill Customer PO Number
    const customerPONumber = 'AFT-PO-AUTO-' + getDate() + '-' + getSequenceNumber('salesOrder');
    await so.customerPONumberField.fill(customerPONumber);
    console.log('Customer PO Number: ' + customerPONumber);

    // Set Customer PO Date (today)
    await b2b.selectDate(page, so, 'customerPODateField', 0);
    // await page.getByText(String(today.getDate()), {exact: true}).click({ force: true, timeout: 10000 });

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

    await b2b.selectDropdown(page, so, 'productNameField', salesOrderData.MT.product.name);

    // Get price from API response
    const priceResponse = await priceResponsePromise;
    const priceResponseData = await priceResponse.json();
    const finalPrice = priceResponseData.data[0].final_price;
    console.log('Extracted Final Price: ' + finalPrice);

    await so.quantityField.fill(salesOrderData.MT.product.quantity);
    
    // Save product
    await b2b.clickButton(page, so, 'saveButton');

    // Get SO Reference Code & Sales Order ID from API
    const referenceCodeResponsePromise = page.waitForResponse(response =>
      response.url().includes('uat-b2b-ms-orders.sociolabs.io/orders') &&
      response.request().method() === 'POST' &&
      response.status() === 200,
      { timeout: 25000 }
    );
    
    // Save Sales Order
    await so.saveFormButton.scrollIntoViewIfNeeded();
    await b2b.clickButton(page, so, 'saveFormButton');
    
    const referenceCodeResponse = await referenceCodeResponsePromise;
    const referenceCodeResponseData = await referenceCodeResponse.json();
    const salesOrderId = referenceCodeResponseData.data._id;
    const referenceCode = referenceCodeResponseData.data.reference_code;
    console.log('Sales Order ID: ' + salesOrderId);
    console.log('Sales Order Reference Code: ' + referenceCode);
    
    // Save to salesOrderData.json
    const dataPath = join(__dirname, './fixtures/salesOrderData.json');
    const data = JSON.parse(readFileSync(dataPath, 'utf-8'));
    data.lastCreatedSalesOrder.salesOrderId = salesOrderId;
    data.lastCreatedSalesOrder.referenceCode = referenceCode;
    writeFileSync(dataPath, JSON.stringify(data, null, 4));
    
    // Sales Order Submitted Pop-Up
    await expect(page.getByText('Sales Order Submitted').nth(1)).toBeVisible({ timeout: 10000 });
    await page.getByText('OK').nth(1).click();
    // await expect(page.getByRole('button', { name: 'Edit', exact: true })).toBeVisible();

    // Add Salesman Signature
    await so.salesmanSignatureField.scrollIntoViewIfNeeded();
    await expect(so.salesmanSignatureField).toBeVisible();

    await so.salesmanSignatureField.click({ force: true});
    await page.waitForTimeout(1000);
    await page.waitForLoadState('networkidle');
    // await expect(so.signatureField).toBeVisible();
    await b2b.drawSignature(page);
    await so.nameSignatureField.fill(salesPerson);
    await b2b.clickButton(page, so, 'addSignatureButton');

    await page.waitForTimeout(1000);
    await page.waitForLoadState('networkidle');
    
    // Add Customer Signature
    await so.customerSignatureField.click({ force: true});
    await page.waitForTimeout(1000);
    await page.waitForLoadState('networkidle');
    // await expect(so.signatureField).toBeVisible();
    await b2b.drawSignature(page);
    await so.nameSignatureField.fill(salesOrderData.MT.customer.name);
    await b2b.clickButton(page, so, 'addSignatureButton');
  });

});

// Test Set for Approver User
test.describe('[Test Set] Sales Order Approval', () => {
  test.beforeEach(async ({ page }) => {
    await b2b.login(page, baseUrl, loginData.approverUser.email, loginData.approverUser.password);
  });

  //Test Case: Approve Sales Order
  test('[Test Case] Approve Sales Order', async ({ page }) => {
    const salesOrderPage = new SalesOrderPage(page);
    const so = salesOrderPage.selectors;

    // Read the saved sales order data
    const salesOrderId = salesOrderData.lastCreatedSalesOrder.salesOrderId;
    const referenceCode = salesOrderData.lastCreatedSalesOrder.referenceCode;
    console.log('Sales Order ID: ' + salesOrderId);
    console.log('Reference Code: ' + referenceCode);

    await b2b.goToMenu(page, baseUrl, 'Transaction', 'Sales Order');
    await page.waitForLoadState('networkidle');

    // Search for the Sales Order by Reference Code
    await b2b.search(page, so, referenceCode);
    await page.waitForLoadState('networkidle');

    // Open the Sales Order
    await page.getByText(referenceCode, { exact: true }).first().click();
    await page.waitForLoadState('networkidle');
    
    // Approve sales order
    await expect(so.needApprovalStatus).toBeVisible();
    await b2b.clickButton(page, so, 'confirmButton');

    // OK on confirmation pop-up
    await b2b.okPopUp(page, so, 'confirmPopUp');

    // OK on submitted pop-up
    await b2b.okPopUp(page, so, 'submittedPopUp');

    await expect(so.approvedStatus).toBeVisible();

    await page.waitForTimeout(500);
  });

  //Test Case: Reject Sales Order
  test('[Test Case] Reject Sales Order', async ({ page }) => {
    const salesOrderPage = new SalesOrderPage(page);
    const so = salesOrderPage.selectors;

     // Read the saved sales order data
    const salesOrderId = salesOrderData.lastCreatedSalesOrder.salesOrderId;
    const referenceCode = salesOrderData.lastCreatedSalesOrder.referenceCode;
    console.log('Sales Order ID: ' + salesOrderId);
    console.log('Reference Code: ' + referenceCode);

    await b2b.goToMenu(page, baseUrl, 'Transaction', 'Sales Order');
    await page.waitForLoadState('networkidle');

  });

});