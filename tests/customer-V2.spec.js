// @ts-check
import { test, expect } from '@playwright/test';
import { join } from 'path';
import dotenv from 'dotenv';
import { CustomerRegPage } from './pages/CustomerReg-V2.page';
import loginData from './fixtures/loginData.json' assert { type: 'json' };
import customerData from './fixtures/customerData.json' assert { type: 'json' };
import * as b2b from '../helpers/helperFunctions';
import { getDate, getSequenceNumber, getEmailSequenceNumber } from '../helpers/helperFunctions';

dotenv.config({ path: 'env/UAT.env' });

// Test Data
const baseUrl = process.env.BASE_URL;

// Avoid Chrome location permission prompt by pre-granting geolocation
test.use({ permissions: ['geolocation'], geolocation: { latitude: -6.200000, longitude: 106.816666 } });

// Create Customer
test.describe('[Test Set] Customer Registration - Superadmin', () => {
  // Login before each test
  test.beforeEach(async ({ page }) => {
    await b2b.login(page, baseUrl, loginData.superadminUser.email, loginData.superadminUser.password);
  });
  test('[Test Case] Create Customer GT - No Pinpoint - Save Draft', async ({ page }) => {
    const customerRegPage = new CustomerRegPage(page);

    // File path and name sequences
    const photoFilePath = join(__dirname, customerData.GT.photoPath);
    const sequenceNum = await getSequenceNumber('customer');
    const customerNameSequence = 'AF-GT-CUSTOMER-AUTO-' + getDate() + '-' + sequenceNum;
    console.log('Customer Name: ' + customerNameSequence);
    const customerEmailSequence = 'af.auto' + getDate() + '+test' + getEmailSequenceNumber() + '@yopmail.com';
    console.log('Customer Email: ' + customerEmailSequence);

    // Go To Add Customer Menu
    await b2b.goToMenu(page, baseUrl, 'Customer', 'Customer Registration');
    await page.waitForLoadState('networkidle');

    // Page 1 - Customer Info
    // Listen to Country Response
    const responsePromiseCountry = page.waitForResponse(responseCountry =>
        responseCountry.url().includes('uat-b2b-ms-accounts.sociolabs.io/states/all?filter[country_id]=5c1aa60e56941c32a3245bf6&sort=%7B%22name%22:1%7D') &&
        responseCountry.status() === 200,
        { timeout: 25000 }
    );

    // Get the API response for country states and GET State ID
    const responseCountry = await responsePromiseCountry;
    const responseDataCountry = await responseCountry.json();
    const state = responseDataCountry.data[0].name;
    console.log('State: ' + state);

    // Listen to State API to get City
    const responsePromiseState = page.waitForResponse(responseState =>
        responseState.url().includes('uat-b2b-ms-accounts.sociolabs.io/cities/all?filter[state_id]=619f2e622a2ee936cc25d957&sort=%7B%22type%22:1,%22name%22:1%7D') &&
        responseState.status() === 200,
        { timeout: 25000 }
    );

    // Trigger state selection to get city data
    await customerRegPage.selectDropdown(customerRegPage.stateField, state);

    // Wait for city response
    const responseState = await responsePromiseState;
    const responseDataState = await responseState.json();
    const city = responseDataState.data[0].name;
    console.log('City: ' + city);

    // Upload photo
    await page.waitForTimeout(500);
    await expect(customerRegPage.customerPhotoField).toBeVisible({ timeout: 10000});
    await customerRegPage.uploadCustomerPhoto(photoFilePath);
    await expect(page.locator('img[src*="soc-uat-uploads.s3.amazonaws.com"]')).toBeVisible({ timeout: 5000});

    await customerRegPage.fillCustomerInfo({
      name: customerNameSequence,
      street: customerData.GT.street,
      zipcode: customerData.GT.zipcode,
      phone: customerData.GT.phone,
      mobile: customerData.GT.mobile,
      email: customerEmailSequence
    });

    // Select city
    await customerRegPage.selectDropdown(customerRegPage.cityField, city);
    // Select WHT
    await customerRegPage.selectDropdown(customerRegPage.whtField, customerData.GT.wht);

    // Go to next page
    await customerRegPage.goToNextPage();

    // Page 2 - Sales Info

    // Select Sales Team
    await customerRegPage.selectDropdown(customerRegPage.salesTeamField, customerData.GT.salesTeam);
    // Select Market Type
    await customerRegPage.selectDropdown(customerRegPage.marketTypeField, customerData.GT.marketType);
    // Select Business Type
    await expect(customerRegPage.businessTypeField).toBeVisible();
    await customerRegPage.businessTypeField.click({ force: true });
    await expect(page.getByRole('textbox', { name: 'Search something here...' })).toBeVisible({ timeout: 5000 });
    await page.getByRole('textbox', { name: 'Search something here...' }).fill(customerData.GT.businessType);
    await page.getByText(customerData.GT.businessType + ' (GT)', { exact: true }).click();
    await expect(customerRegPage.businessTypeField).toHaveValue(customerData.GT.businessType);

    // Select Account
    await customerRegPage.selectDropdown(customerRegPage.accountField, customerData.GT.account);
    // Select Sales Person
    await customerRegPage.selectDropdown(customerRegPage.salesPersonField, customerData.GT.salesPersonCode);
    // Fill other sales info fields
    await customerRegPage.fillSalesInfo({
      bankName: customerData.GT.bankName,
      branch: customerData.GT.branch,
      accountNumber: customerData.GT.accountNumber,
      accountName: customerData.GT.accountName,
      specialExpDate: customerData.GT.specialExp
    });
    // Select Customer Type
    await customerRegPage.selectDropdown(customerRegPage.customerTypeField, customerData.GT.customerType);
    // Go to next page
    await customerRegPage.goToNextPage();

    // Page 3 - Addresses
    // Tax Address
    await customerRegPage.fillAddressInfo({
      name: customerData.GT.taxName,
      taxNumber: customerData.GT.taxNumber,
      state: state,
      city: city,
      zipcode: customerData.GT.zipcode,
      street: customerData.GT.street
    });

    // KTP Address
    await customerRegPage.fillAddressInfo({
      name: customerData.GT.idName,
      idNumber: customerData.GT.idNumber,
      state: state,
      city: city,
      zipcode: customerData.GT.zipcode,
      street: customerData.GT.street
    });

    // Delivery Address
    await customerRegPage.fillAddressInfo({
      deliveryName: customerData.GT.deliveryAddressName,
      pic: customerData.GT.addressPIC,
      state: state,
      city: city,
      zipcode: customerData.GT.zipcode,
      street: customerData.GT.street,
      mobile: customerData.GT.mobile
    });

    // Invoice Address
    await customerRegPage.fillAddressInfo({
      name: customerData.GT.invoiceAddressName,
      state: state,
      city: city,
      zipcode: customerData.GT.zipcode,
      street: customerData.GT.street,
      mobile: customerData.GT.mobile,
      checkbox: true
    }, 'invoice');

    // Store Address
    await customerRegPage.fillAddressInfo({
      name: customerData.GT.invoiceAddressName,
      storeCode: customerData.GT.storeCode,
      state: state,
      city: city,
      street: customerData.GT.street,
    }, 'store');

    await customerRegPage.saveDraft();
    await page.waitForTimeout(500);
    // const cr = customerRegPage; // For compatibility with b2b.addAddress helper
    
    // await b2b.addAddress(page, cr, 'addAddressField', {
    //   addressNameField: customerData.GT.taxName,
    //   taxNumberField: customerData.GT.taxNumber,
    //   state: state,
    //   city: city,
    //   zipcodeField: customerData.GT.zipcode,
    //   streetField: customerData.GT.street
    // });

    // await b2b.addAddress(page, cr, 'addAddressField', {
    //   addressNameField: customerData.GT.idName,
    //   idNumberField: customerData.GT.idNumber,
    //   state: state,
    //   city: city,
    //   zipcodeField: customerData.GT.zipcode,
    //   streetField: customerData.GT.street
    // });

    // await b2b.addAddress(page, cr, 'addAddressField', {
    //   deliveryNameField: customerData.GT.deliveryAddressName,
    //   picAddressField: customerData.GT.addressPIC,
    //   state: state,
    //   city: city,
    //   zipcodeField: customerData.GT.zipcode,
    //   streetField: customerData.GT.street,
    //   mobileField: customerData.GT.mobile
    // });

    // await b2b.addAddress(page, cr, 'addInvoiceAddressField', {
    //   addressNameField: customerData.GT.invoiceAddressName,
    //   state: state,
    //   city: city,
    //   zipcodeField: customerData.GT.zipcode,
    //   streetField: customerData.GT.street,
    //   mobileField: customerData.GT.mobile,
    //   checkbox: true 
    // });

    // await b2b.addAddress(page, cr, 'addStoreAddressField', {
    //   addressNameField: customerData.GT.invoiceAddressName,
    //   storeCodeField: customerData.GT.storeCode,
    //   state: state,
    //   city: city,
    //   streetField: customerData.GT.street,
    // });

    // // Save Draft
    // await customerRegPage.saveDraft();
  });
});
