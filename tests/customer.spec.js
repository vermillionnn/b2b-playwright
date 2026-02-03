// @ts-check
import { test, expect } from '@playwright/test';
import { join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import dotenv from 'dotenv';
import { CustomerRegPage } from './pages/CustomerReg.page';
import loginData from './fixtures/loginData.json' assert { type: 'json' };
import customerData from './fixtures/customerData.json' assert { type: 'json' };
import * as b2b from '../helpers/helperFunctions';
import { getDate, getSequenceNumber, getEmailSequenceNumber } from '../helpers/helperFunctions';

dotenv.config({ path: 'env/UAT.env' });

// Test Data
const baseUrl = process.env.BASE_URL;

test.use({ permissions: ['geolocation'], geolocation: { latitude: -6.200000, longitude: 106.816666 } });

// Create Customer
test.describe('[Test Set] Customer Registration - Superadmin', () => {
  // Login before each test
  test.beforeEach(async ({ page }) => {
    await b2b.login(page, baseUrl, loginData.superadminUser.email, loginData.superadminUser.password);
  });
  test('[Test Case] Create Customer GT - No Pinpoint - Save Draft', async ({ page }) => {
    const customerRegPage = new CustomerRegPage(page);
    const cr = customerRegPage.selectors;
    const photoFilePath = join(__dirname, customerData.GT.photoPath);
    
    const sequenceNum = await getSequenceNumber('customer');
    const customerNameSequence = 'AUTO-GT-' + getDate() + '-' + sequenceNum;
    console.log('Customer Name: ' + customerNameSequence);
    
    //GoTo Add Customer Menu
    await b2b.goToMenu(page, baseUrl, 'Customer', 'Customer Registration');
    await page.waitForLoadState('networkidle');
    
    //Listen to Country Response
    const responsePromiseCountry = page.waitForResponse(responseCountry =>
        responseCountry.url().includes('uat-b2b-ms-accounts.sociolabs.io/states/all?filter[country_id]=5c1aa60e56941c32a3245bf6&sort=%7B%22name%22:1%7D') &&
        responseCountry.status() === 200,
        { timeout: 25000 }
    );
  
    //Get the API response for country states and GET State ID
    const responseCountry = await responsePromiseCountry;
    const responseDataCountry = await responseCountry.json();
    const state = responseDataCountry.data[0].name;
    console.log('State: ' + state);
    
    //Add customer photo
    await page.waitForTimeout(500);
    await expect(cr.customerPhotoField).toBeVisible({ timeout: 10000});
    await cr.customerPhotoField.click({ timeout: 10000});
    await b2b.uploadAttachment(page, cr, 'customerPhotoField', photoFilePath);
    await expect(page.locator('img[src*="soc-uat-uploads.s3.amazonaws.com"]')).toBeVisible({ timeout: 5000});
    
    //Customer Name
    await expect(cr.customerNameField).toBeVisible();
    await cr.customerNameField.fill(customerNameSequence);
    
    //Company Address 1
    await expect(cr.streetField).toBeVisible();
    await cr.streetField.fill(customerData.GT.street)
    
    //Select State ID
    await b2b.selectDropdown(page, cr, 'stateField', state);
    
    //Listen to State API to get City
    const responsePromiseState = page.waitForResponse(responseState =>
        responseState.url().includes('uat-b2b-ms-accounts.sociolabs.io/cities/all?filter[state_id]=619f2e622a2ee936cc25d957&sort=%7B%22type%22:1,%22name%22:1%7D') &&
        responseState.status() === 200,
        { timeout: 25000 }
    );
    //Get the API response for city
    const responseState = await responsePromiseState;
    const responseDataState = await responseState.json();
    const city = responseDataState.data[0].name;
    console.log('City: ' + city);
    
    //Select City Based on State ID
    await b2b.selectDropdown(page, cr, 'cityField', city);
    
    //Input Zipcode
    await b2b.fillField(page, cr, 'zipcodeField', customerData.GT.zipcode);
    
    //Select Taxable Entrepreneur
    await expect(cr.pkpField).toBeVisible();
    await expect(cr.pkpField).toHaveValue(customerData.GT.pkp);
    
    //Select WHT
    await b2b.selectDropdown(page, cr, 'whtField', customerData.GT.wht);
    
    //Input Phone, Mobile, Email
    await b2b.fillField(page, cr, 'phoneField', customerData.GT.phone);
    await b2b.fillField(page, cr, 'mobileField', customerData.GT.mobile);
    
    const customerEmailSequence = 'af.auto' + getDate() + '+test' + getEmailSequenceNumber() + '@yopmail.com';
    console.log('Customer Email: ' + customerEmailSequence);
    await b2b.fillField(page, cr, 'emailField', customerEmailSequence);
    
    //Next Page
    await b2b.clickButton(page, cr, 'nextButton');
    
    //Page 2 - Sales Info Page
    //Select Sales Team
    await b2b.selectDropdown(page, cr, 'salesTeamField', customerData.GT.salesTeam);
    
    //Selet Market Type
    await b2b.selectDropdown(page, cr, 'marketTypeField', customerData.GT.marketType);
    
    //Select Business Type based on Sales Team
    // await b2b.selectDropdown(page, cr, 'businessTypeField', customerData.GT.businessType);
    const businessTypefield = cr.businessTypeField;
    await expect(businessTypefield).toBeVisible();
    await businessTypefield.click({ force: true });
    await expect(page.getByRole('textbox', { name: 'Search something here...' })).toBeVisible({ timeout: 5000 });
    await page.getByRole('textbox', { name: 'Search something here...' }).fill(customerData.GT.businessType);
    await page.getByText(customerData.GT.businessType + ' (GT)', { exact: true }).click();  
    await expect(businessTypefield).toHaveValue(customerData.GT.businessType);
    
    //Select Account Based on Business Type
    await b2b.selectDropdown(page, cr, 'accountField', customerData.GT.account);
    
    //Select Sales Person based on Sales Team
    await b2b.selectDropdown(page, cr, 'salesPersonField', customerData.GT.salesPersonCode);
    
    //Fill Bank Name, Branch, Account Number, Account Name, Special Expiration Date
    await b2b.fillField(page, cr, 'bankNameField', customerData.GT.bankName);
    await b2b.fillField(page, cr, 'branchField', customerData.GT.branch);
    await b2b.fillField(page, cr, 'accountNumberField', customerData.GT.accountNumber);
    await b2b.fillField(page, cr, 'accountNameField', customerData.GT.accountName);
    await b2b.fillField(page, cr, 'specialExpDateField', customerData.GT.specialExp);
    
    //Select Customer Type
    await b2b.selectDropdown(page, cr, 'customerTypeField', customerData.GT.customerType);
    
    //Next Page
    await b2b.clickButton(page, cr, 'nextButton');
    
    //Page 3 - Customer Address
    // NPWP Address
    await b2b.addAddress(page, cr, 'addAddressField', {
      addressNameField: customerData.GT.taxName,
      taxNumberField: customerData.GT.taxNumber,
      state: state,
      city: city,
      zipcodeField: customerData.GT.zipcode,
      streetField: customerData.GT.street
    });
  
    // KTP Address
    await b2b.addAddress(page, cr, 'addAddressField', {
      addressNameField: customerData.GT.idName,
      idNumberField: customerData.GT.idNumber,
      state: state,
      city: city,
      zipcodeField: customerData.GT.zipcode,
      streetField: customerData.GT.street
    });
    
    // Delivery Address
    await b2b.addAddress(page, cr, 'addAddressField', {
      deliveryNameField: customerData.GT.deliveryAddressName,
      picAddressField: customerData.GT.addressPIC,
      state: state,
      city: city,
      zipcodeField: customerData.GT.zipcode,
      streetField: customerData.GT.street,
      mobileField: customerData.GT.mobile
    });
    
    // Invoice Address
    await b2b.addAddress(page, cr, 'addInvoiceAddressField', {
      addressNameField: customerData.GT.invoiceAddressName,
      state: state,
      city: city,
      zipcodeField: customerData.GT.zipcode,
      streetField: customerData.GT.street,
      mobileField: customerData.GT.mobile,
      checkbox: true 
    });
  
    // Store Address
    await b2b.addAddress(page, cr, 'addStoreAddressField', {
      addressNameField: customerData.GT.invoiceAddressName,
      storeCodeField: customerData.GT.storeCode,
      state: state,
      city: city,
      streetField: customerData.GT.street,
    });
  
    //Prepare to capture create-customer response and Save Draft
    const createCustomerResponsePromise = page.waitForResponse(response =>
      response.url().includes('uat-b2b-ms-accounts.sociolabs.io/customers') &&
      response.request().method() === 'POST' &&
      response.status() === 200,
      { timeout: 25000 }
    );

    //Save Draft
    await b2b.clickButton(page, cr, 'saveDraftButton');

    //Wait for API response and persist customer id + name
    const createCustomerResponse = await createCustomerResponsePromise;
    try {
      const createCustomerData = await createCustomerResponse.json();
      const customerId = createCustomerData.data && createCustomerData.data._id ? createCustomerData.data._id : null;
      const customerName = createCustomerData.data && createCustomerData.data.name ? createCustomerData.data.name : null;
      if (customerId || customerName) {
        const dataPath = join(__dirname, './fixtures/customerData.json');
        const fileData = JSON.parse(readFileSync(dataPath, 'utf-8'));
        if (!fileData.lastCreatedCustomer) fileData.lastCreatedCustomer = {};
        if (customerId) fileData.lastCreatedCustomer.customerId = customerId;
        if (customerName) fileData.lastCreatedCustomer.customerName = customerName;
        writeFileSync(dataPath, JSON.stringify(fileData, null, 4));
        console.log('Saved customerId:', customerId);
        console.log('Saved customerName:', customerName);
      }
    } catch (e) {
      console.log('Failed to parse create-customer response or write fixture:', e);
    }
    await page.waitForTimeout(500);
  });
  
  test('[Test Case] Create Customer MT - No Pinpoint - Save Draft', async ({ page }) => {
    const customerRegPage = new CustomerRegPage(page);
    const cr = customerRegPage.selectors;
    const photoFilePath = join(__dirname, customerData.MT.photoPath);
    
    const sequenceNum = await getSequenceNumber('customer');
    const customerNameSequence = 'AUTO-MT-' + getDate() + '-' + sequenceNum;
    console.log('Customer Name: ' + customerNameSequence);
    
    //GoTo Add Customer Menu
    await b2b.goToMenu(page, baseUrl, 'Customer', 'Customer Registration');
    await page.waitForLoadState('networkidle');
    
    //Listen to Country Response
    const responsePromiseCountry = page.waitForResponse(responseCountry =>
      responseCountry.url().includes('uat-b2b-ms-accounts.sociolabs.io/states/all?filter[country_id]=5c1aa60e56941c32a3245bf6&sort=%7B%22name%22:1%7D') &&
      responseCountry.status() === 200,
      { timeout: 25000 }
    );
  
    //Get the API response for country states and GET State ID
    const responseCountry = await responsePromiseCountry;
    const responseDataCountry = await responseCountry.json();
    const state = responseDataCountry.data[0].name;
    console.log('State: ' + state);
    
    //Add customer photo
    await page.waitForTimeout(500);
    await expect(cr.customerPhotoField).toBeVisible({ timeout: 10000});
    await cr.customerPhotoField.click({ timeout: 10000});
    await b2b.uploadAttachment(page, cr, 'customerPhotoField', photoFilePath);
    await expect(page.locator('img[src*="soc-uat-uploads.s3.amazonaws.com"]')).toBeVisible({ timeout: 5000});
    
    //Customer Name
    await expect(cr.customerNameField).toBeVisible();
    await cr.customerNameField.fill(customerNameSequence);
    
    //Company Address 1
    await expect(cr.streetField).toBeVisible();
    await cr.streetField.fill(customerData.MT.street)
    
    //Select State ID
    await b2b.selectDropdown(page, cr, 'stateField', state);
    
    //Listen to State API to get City
    const responsePromiseState = page.waitForResponse(responseState =>
        responseState.url().includes('uat-b2b-ms-accounts.sociolabs.io/cities/all?filter[state_id]=619f2e622a2ee936cc25d957&sort=%7B%22type%22:1,%22name%22:1%7D') &&
        responseState.status() === 200,
        { timeout: 25000 }
    );
    //Get the API response for city
    const responseState = await responsePromiseState;
    const responseDataState = await responseState.json();
    const city = responseDataState.data[0].name;
    console.log('City: ' + city);
  
    //Select City Based on State ID
    await b2b.selectDropdown(page, cr, 'cityField', city);
    
    //Input Zipcode
    await b2b.fillField(page, cr, 'zipcodeField', customerData.MT.zipcode);
    
    //Select Taxable Entrepreneur
    await expect(cr.pkpField).toBeVisible();
    await expect(cr.pkpField).toHaveValue(customerData.MT.pkp);
    
    //Select WHT
    await b2b.selectDropdown(page, cr, 'whtField', customerData.MT.wht);
    
    //Input Phone, Mobile, Email
    await b2b.fillField(page, cr, 'phoneField', customerData.MT.phone);
    await b2b.fillField(page, cr, 'mobileField', customerData.MT.mobile);
    
    const customerEmailSequence = 'af.auto' + getDate() + '+test' + getEmailSequenceNumber() + '@yopmail.com';
    console.log('Customer Email: ' + customerEmailSequence);
    await b2b.fillField(page, cr, 'emailField', customerEmailSequence);
    
    //Next Page
    await b2b.clickButton(page, cr, 'nextButton');
    
    //Page 2 - Sales Info Page
    //Select Sales Team
    await b2b.selectDropdown(page, cr, 'salesTeamField', customerData.MT.salesTeam);
    
    //Selet Market Type
    await b2b.selectDropdown(page, cr, 'marketTypeField', customerData.MT.marketType);
    
    //Select Business Type based on Sales Team
    // await b2b.selectDropdown(page, cr, 'businessTypeField', customerData.businessTypeGT);
    const businessTypefield = cr.businessTypeField;
    await expect(businessTypefield).toBeVisible();
    await businessTypefield.click({ force: true });
    await expect(page.getByRole('textbox', { name: 'Search something here...' })).toBeVisible({ timeout: 5000 });
    await page.getByRole('textbox', { name: 'Search something here...' }).fill(customerData.MT.businessType);
    await page.getByText(customerData.MT.businessType + ' (MT)', { exact: true }).click();  
    await expect(businessTypefield).toHaveValue(customerData.MT.businessType);
    
    //Select Account Based on Business Type
    await b2b.selectDropdown(page, cr, 'accountField', customerData.MT.account);
    
    //Select Sales Person based on Sales Team
    await b2b.selectDropdown(page, cr, 'salesPersonField', customerData.MT.salesPersonCode);
    
    //Fill Bank Name, Branch, Account Number, Account Name, Special Expiration Date
    await b2b.fillField(page, cr, 'bankNameField', customerData.MT.bankName);
    await b2b.fillField(page, cr, 'branchField', customerData.MT.branch);
    await b2b.fillField(page, cr, 'accountNumberField', customerData.MT.accountNumber);
    await b2b.fillField(page, cr, 'accountNameField', customerData.MT.accountName);
    await b2b.fillField(page, cr, 'specialExpDateField', customerData.MT.specialExp);
    
    //Select Customer Type
    await b2b.selectDropdown(page, cr, 'customerTypeField', customerData.MT.customerType);
    
    //Next Page
    await b2b.clickButton(page, cr, 'nextButton');
    
    //Page 3 - Customer Address
    // NPWP Address
    await b2b.addAddress(page, cr, 'addAddressField', {
      addressNameField: customerData.MT.taxName,
      taxNumberField: customerData.MT.taxNumber,
      state: state,
      city: city,
      zipcodeField: customerData.MT.zipcode,
      streetField: customerData.MT.street
    });
  
    // KTP Address
    await b2b.addAddress(page, cr, 'addAddressField', {
      addressNameField: customerData.MT.idName,
      idNumberField: customerData.MT.idNumber,
      state: state,
      city: city,
      zipcodeField: customerData.MT.zipcode,
      streetField: customerData.MT.street
    });
    
    // Delivery Address
    await b2b.addAddress(page, cr, 'addAddressField', {
      deliveryNameField: customerData.MT.deliveryAddressName,
      picAddressField: customerData.MT.addressPIC,
      state: state,
      city: city,
      zipcodeField: customerData.MT.zipcode,
      streetField: customerData.MT.street,
      mobileField: customerData.MT.mobile
    });
    
    // Invoice Address
    await b2b.addAddress(page, cr, 'addInvoiceAddressField', {
      addressNameField: customerData.MT.invoiceAddressName,
      state: state,
      city: city,
      zipcodeField: customerData.MT.zipcode,
      streetField: customerData.MT.street,
      mobileField: customerData.MT.mobile,
      checkbox: true 
    });
  
    // Store Address
    await b2b.addAddress(page, cr, 'addStoreAddressField', {
      addressNameField: customerData.MT.invoiceAddressName,
      storeCodeField: customerData.MT.storeCode,
      state: state,
      city: city,
      streetField: customerData.MT.street,
    });
  
    //Prepare to capture create-customer response and Save Draft
    const createCustomerResponsePromise = page.waitForResponse(response =>
      response.url().includes('uat-b2b-ms-accounts.sociolabs.io/customers') &&
      response.request().method() === 'POST' &&
      response.status() === 200,
      { timeout: 25000 }
    );

    //Save Draft
    await b2b.clickButton(page, cr, 'saveDraftButton');

    //Wait for API response and persist customer id + name
    const createCustomerResponse = await createCustomerResponsePromise;
    try {
      const createCustomerData = await createCustomerResponse.json();
      const customerId = createCustomerData.data && createCustomerData.data._id ? createCustomerData.data._id : null;
      const customerName = createCustomerData.data && createCustomerData.data.name ? createCustomerData.data.name : null;
      if (customerId || customerName) {
        const dataPath = join(__dirname, './fixtures/customerData.json');
        const fileData = JSON.parse(readFileSync(dataPath, 'utf-8'));
        if (!fileData.lastCreatedCustomer) fileData.lastCreatedCustomer = {};
        if (customerId) fileData.lastCreatedCustomer.customerId = customerId;
        if (customerName) fileData.lastCreatedCustomer.customerName = customerName;
        writeFileSync(dataPath, JSON.stringify(fileData, null, 4));
        console.log('Saved customerId:', customerId);
        console.log('Saved customerName:', customerName);
      }
    } catch (e) {
      console.log('Failed to parse create-customer response or write fixture:', e);
    }
    await page.waitForTimeout(500);
  });

  test('[Test Case] Create Customer GT - With Pinpoint - Save Draft', async ({ page }) => {
    const customerRegPage = new CustomerRegPage(page);
    const cr = customerRegPage.selectors;
    const photoFilePath = join(__dirname, customerData.GT.photoPath);
  
    const sequenceNum = await getSequenceNumber('customer');
    const customerNameSequence = 'AUTO-GT-' + getDate() + '-' + sequenceNum;
    console.log('Customer Name: ' + customerNameSequence);
  
    //GoTo Add Customer Menu
    await b2b.goToMenu(page, baseUrl, 'Customer', 'Customer Registration');
    await page.waitForLoadState('networkidle');
  
    //Listen to Country Response
    const responsePromiseCountry = page.waitForResponse(responseCountry =>
        responseCountry.url().includes('uat-b2b-ms-accounts.sociolabs.io/states/all?filter[country_id]=5c1aa60e56941c32a3245bf6&sort=%7B%22name%22:1%7D') &&
        responseCountry.status() === 200,
        { timeout: 25000 }
    );
  
    //Get the API response for country states and GET State ID
    const responseCountry = await responsePromiseCountry;
    const responseDataCountry = await responseCountry.json();
    const state = responseDataCountry.data[0].name;
    console.log('State: ' + state);
  
    //Add customer photo
    await page.waitForTimeout(500);
    await expect(cr.customerPhotoField).toBeVisible({ timeout: 10000});
    await cr.customerPhotoField.click({ timeout: 10000});
    await b2b.uploadAttachment(page, cr, 'customerPhotoField', photoFilePath);
    await expect(page.locator('img[src*="soc-uat-uploads.s3.amazonaws.com"]')).toBeVisible({ timeout: 5000});
  
    //Customer Name
    await expect(cr.customerNameField).toBeVisible();
    await cr.customerNameField.fill(customerNameSequence);
  
    //Company Address 1
    await expect(cr.streetField).toBeVisible();
    await cr.streetField.fill(customerData.GT.street)
  
    //Select State ID
    await b2b.selectDropdown(page, cr, 'stateField', state);
  
    //Listen to State API to get City
    const responsePromiseState = page.waitForResponse(responseState =>
        responseState.url().includes('uat-b2b-ms-accounts.sociolabs.io/cities/all?filter[state_id]=619f2e622a2ee936cc25d957&sort=%7B%22type%22:1,%22name%22:1%7D') &&
        responseState.status() === 200,
        { timeout: 25000 }
    );
    //Get the API response for city
    const responseState = await responsePromiseState;
    const responseDataState = await responseState.json();
    const city = responseDataState.data[0].name;
    console.log('City: ' + city);
  
    //Select City Based on State ID
    await b2b.selectDropdown(page, cr, 'cityField', city);
  
    //Input Zipcode
    await b2b.fillField(page, cr, 'zipcodeField', customerData.GT.zipcode);
  
    //Select Taxable Entrepreneur
    await expect(cr.pkpField).toBeVisible();
    await expect(cr.pkpField).toHaveValue(customerData.GT.pkp);
  
    //Select WHT
    await b2b.selectDropdown(page, cr, 'whtField', customerData.GT.wht);
  
    //Input Phone, Mobile, Email
    await b2b.fillField(page, cr, 'phoneField', customerData.GT.phone);
    await b2b.fillField(page, cr, 'mobileField', customerData.GT.mobile);
    
    const customerEmailSequence = 'af.auto' + getDate() + '+test' + getEmailSequenceNumber() + '@yopmail.com';
    console.log('Customer Email: ' + customerEmailSequence);
    await b2b.fillField(page, cr, 'emailField', customerEmailSequence);
  
    //Next Page
    await b2b.clickButton(page, cr, 'nextButton');
  
    //Page 2 - Sales Info Page
    //Select Sales Team
    await b2b.selectDropdown(page, cr, 'salesTeamField', customerData.GT.salesTeam);
  
    //Selet Market Type
    await b2b.selectDropdown(page, cr, 'marketTypeField', customerData.GT.marketType);
  
    //Select Business Type based on Sales Team
    // await b2b.selectDropdown(page, cr, 'businessTypeField', customerData.businessTypeGT);
    const businessTypefield = cr.businessTypeField;
    await expect(businessTypefield).toBeVisible();
    await businessTypefield.click({ force: true });
    await expect(page.getByRole('textbox', { name: 'Search something here...' })).toBeVisible({ timeout: 5000 });
    await page.getByRole('textbox', { name: 'Search something here...' }).fill(customerData.GT.businessType);
    await page.getByText(customerData.GT.businessType + ' (GT)', { exact: true }).click();  
    await expect(businessTypefield).toHaveValue(customerData.GT.businessType);
  
    //Select Account Based on Business Type
    await b2b.selectDropdown(page, cr, 'accountField', customerData.GT.account);
  
    //Select Sales Person based on Sales Team
    await b2b.selectDropdown(page, cr, 'salesPersonField', customerData.GT.salesPersonCode);
  
    //Fill Bank Name, Branch, Account Number, Account Name, Special Expiration Date
    await b2b.fillField(page, cr, 'bankNameField', customerData.GT.bankName);
    await b2b.fillField(page, cr, 'branchField', customerData.GT.branch);
    await b2b.fillField(page, cr, 'accountNumberField', customerData.GT.accountNumber);
    await b2b.fillField(page, cr, 'accountNameField', customerData.GT.accountName);
    await b2b.fillField(page, cr, 'specialExpDateField', customerData.GT.specialExp);
  
    //Select Customer Type
    await b2b.selectDropdown(page, cr, 'customerTypeField', customerData.GT.customerType);
  
    //Next Page
    await b2b.clickButton(page, cr, 'nextButton');
  
    //Page 3 - Customer Address
    // NPWP Address
    await b2b.addAddress(page, cr, 'addAddressField', {
      addressNameField: customerData.GT.taxName,
      taxNumberField: customerData.GT.taxNumber,
      state: state,
      city: city,
      zipcodeField: customerData.GT.zipcode,
      streetField: customerData.GT.street
    });
  
    // KTP Address
    await b2b.addAddress(page, cr, 'addAddressField', {
      addressNameField: customerData.GT.idName,
      idNumberField: customerData.GT.idNumber,
      state: state,
      city: city,
      zipcodeField: customerData.GT.zipcode,
      streetField: customerData.GT.street
    });
  
    // Delivery Address
    await b2b.addAddress(page, cr, 'addAddressField', {
      deliveryNameField: customerData.GT.deliveryAddressName,
      picAddressField: customerData.GT.addressPIC,
      state: state,
      city: city,
      zipcodeField: customerData.GT.zipcode,
      streetField: customerData.GT.street,
      mobileField: customerData.GT.mobile,
      pinpoint: true
    });
  
    // Invoice Address
    await b2b.addAddress(page, cr, 'addInvoiceAddressField', {
      addressNameField: customerData.GT.invoiceAddressName,
      state: state,
      city: city,
      zipcodeField: customerData.GT.zipcode,
      streetField: customerData.GT.street,
      mobileField: customerData.GT.mobile,
      checkbox: true 
    });
  
    // Store Address
    await b2b.addAddress(page, cr, 'addStoreAddressField', {
      addressNameField: customerData.GT.invoiceAddressName,
      storeCodeField: customerData.GT.storeCode,
      state: state,
      city: city,
      streetField: customerData.GT.street,
      pinpoint: true
    });
  
    //Prepare to capture create-customer response and Save Draft
    const createCustomerResponsePromise = page.waitForResponse(response =>
      response.url().includes('uat-b2b-ms-accounts.sociolabs.io/customers') &&
      response.request().method() === 'POST' &&
      response.status() === 200,
      { timeout: 25000 }
    );

    //Save Draft
    await b2b.clickButton(page, cr, 'saveDraftButton');

    //Wait for API response and persist customer id + name
    const createCustomerResponse = await createCustomerResponsePromise;
    try {
      const createCustomerData = await createCustomerResponse.json();
      const customerId = createCustomerData.data && createCustomerData.data._id ? createCustomerData.data._id : null;
      const customerName = createCustomerData.data && createCustomerData.data.name ? createCustomerData.data.name : null;
      if (customerId || customerName) {
        const dataPath = join(__dirname, './fixtures/customerData.json');
        const fileData = JSON.parse(readFileSync(dataPath, 'utf-8'));
        if (!fileData.lastCreatedCustomer) fileData.lastCreatedCustomer = {};
        if (customerId) fileData.lastCreatedCustomer.customerId = customerId;
        if (customerName) fileData.lastCreatedCustomer.customerName = customerName;
        writeFileSync(dataPath, JSON.stringify(fileData, null, 4));
        console.log('Saved customerId:', customerId);
        console.log('Saved customerName:', customerName);
      }
    } catch (e) {
      console.log('Failed to parse create-customer response or write fixture:', e);
    }
    await page.waitForTimeout(500);
  });
  
  test('[Test Case] Create Customer MT - With Pinpoint - Save Draft', async ({ page }) => {
    const customerRegPage = new CustomerRegPage(page);
    const cr = customerRegPage.selectors;
    const photoFilePath = join(__dirname, customerData.MT.photoPath);
    
    const sequenceNum = await getSequenceNumber('customer');
    const customerNameSequence = 'AUTO-MT-' + getDate() + '-' + sequenceNum;
    console.log('Customer Name: ' + customerNameSequence);
    
    //GoTo Add Customer Menu
    await b2b.goToMenu(page, baseUrl, 'Customer', 'Customer Registration');
    await page.waitForLoadState('networkidle');
    
    //Listen to Country Response
    const responsePromiseCountry = page.waitForResponse(responseCountry =>
      responseCountry.url().includes('uat-b2b-ms-accounts.sociolabs.io/states/all?filter[country_id]=5c1aa60e56941c32a3245bf6&sort=%7B%22name%22:1%7D') &&
      responseCountry.status() === 200,
      { timeout: 25000 }
    );
  
    //Get the API response for country states and GET State ID
    const responseCountry = await responsePromiseCountry;
    const responseDataCountry = await responseCountry.json();
    const state = responseDataCountry.data[0].name;
    console.log('State: ' + state);
    
    //Add customer photo
    await page.waitForTimeout(500);
    await expect(cr.customerPhotoField).toBeVisible({ timeout: 10000});
    await cr.customerPhotoField.click({ timeout: 10000});
    await b2b.uploadAttachment(page, cr, 'customerPhotoField', photoFilePath);
    await expect(page.locator('img[src*="soc-uat-uploads.s3.amazonaws.com"]')).toBeVisible({ timeout: 5000});
    
    //Customer Name
    await expect(cr.customerNameField).toBeVisible();
    await cr.customerNameField.fill(customerNameSequence);
    
    //Company Address 1
    await expect(cr.streetField).toBeVisible();
    await cr.streetField.fill(customerData.MT.street)
    
    //Select State ID
    await b2b.selectDropdown(page, cr, 'stateField', state);
    
    //Listen to State API to get City
    const responsePromiseState = page.waitForResponse(responseState =>
      responseState.url().includes('uat-b2b-ms-accounts.sociolabs.io/cities/all?filter[state_id]=619f2e622a2ee936cc25d957&sort=%7B%22type%22:1,%22name%22:1%7D') &&
      responseState.status() === 200,
      { timeout: 25000 }
    );
    //Get the API response for city
    const responseState = await responsePromiseState;
    const responseDataState = await responseState.json();
    const city = responseDataState.data[0].name;
    console.log('City: ' + city);
    
    //Select City Based on State ID
    await b2b.selectDropdown(page, cr, 'cityField', city);
    
    //Input Zipcode
    await b2b.fillField(page, cr, 'zipcodeField', customerData.MT.zipcode);
    
    //Select Taxable Entrepreneur
    await expect(cr.pkpField).toBeVisible();
    await expect(cr.pkpField).toHaveValue(customerData.MT.pkp);
    
    //Select WHT
    await b2b.selectDropdown(page, cr, 'whtField', customerData.MT.wht);
    
    //Input Phone, Mobile, Email
    await b2b.fillField(page, cr, 'phoneField', customerData.MT.phone);
    await b2b.fillField(page, cr, 'mobileField', customerData.MT.mobile);
    
    const customerEmailSequence = 'af.auto' + getDate() + '+test' + getEmailSequenceNumber() + '@yopmail.com';
    console.log('Customer Email: ' + customerEmailSequence);
    await b2b.fillField(page, cr, 'emailField', customerEmailSequence);
    
    //Next Page
    await b2b.clickButton(page, cr, 'nextButton');
    
    //Page 2 - Sales Info Page
    //Select Sales Team
    await b2b.selectDropdown(page, cr, 'salesTeamField', customerData.MT.salesTeam);
    
    //Selet Market Type
    await b2b.selectDropdown(page, cr, 'marketTypeField', customerData.MT.marketType);
    
    //Select Business Type based on Sales Team
    // await b2b.selectDropdown(page, cr, 'businessTypeField', customerData.businessTypeGT);
    const businessTypefield = cr.businessTypeField;
    await expect(businessTypefield).toBeVisible();
    await businessTypefield.click({ force: true });
    await expect(page.getByRole('textbox', { name: 'Search something here...' })).toBeVisible({ timeout: 5000 });
    await page.getByRole('textbox', { name: 'Search something here...' }).fill(customerData.MT.businessType);
    await page.getByText(customerData.MT.businessType + ' (MT)', { exact: true }).click();  
    await expect(businessTypefield).toHaveValue(customerData.MT.businessType);
    
    //Select Account Based on Business Type
    await b2b.selectDropdown(page, cr, 'accountField', customerData.MT.account);
    
    //Select Sales Person based on Sales Team
    await b2b.selectDropdown(page, cr, 'salesPersonField', customerData.MT.salesPersonCode);
    
    //Fill Bank Name, Branch, Account Number, Account Name, Special Expiration Date
    await b2b.fillField(page, cr, 'bankNameField', customerData.MT.bankName);
    await b2b.fillField(page, cr, 'branchField', customerData.MT.branch);
    await b2b.fillField(page, cr, 'accountNumberField', customerData.MT.accountNumber);
    await b2b.fillField(page, cr, 'accountNameField', customerData.MT.accountName);
    await b2b.fillField(page, cr, 'specialExpDateField', customerData.MT.specialExp);
    
    //Select Customer Type
    await b2b.selectDropdown(page, cr, 'customerTypeField', customerData.MT.customerType);
    
    //Next Page
    await b2b.clickButton(page, cr, 'nextButton');
  
    //Page 3 - Customer Address
    // NPWP Address
    await b2b.addAddress(page, cr, 'addAddressField', {
      addressNameField: customerData.MT.taxName,
      taxNumberField: customerData.MT.taxNumber,
      state: state,
      city: city,
      zipcodeField: customerData.MT.zipcode,
      streetField: customerData.MT.street
    });
    
    // KTP Address
    await b2b.addAddress(page, cr, 'addAddressField', {
      addressNameField: customerData.MT.idName,
      idNumberField: customerData.MT.idNumber,
      state: state,
      city: city,
      zipcodeField: customerData.MT.zipcode,
      streetField: customerData.MT.street
    });
    
    // Delivery Address
    await b2b.addAddress(page, cr, 'addAddressField', {
      deliveryNameField: customerData.MT.deliveryAddressName,
      picAddressField: customerData.MT.addressPIC,
      state: state,
      city: city,
      zipcodeField: customerData.MT.zipcode,
      streetField: customerData.MT.street,
      mobileField: customerData.MT.mobile,
      pinpoint: true
    });
    
    // Invoice Address
    await b2b.addAddress(page, cr, 'addInvoiceAddressField', {
      addressNameField: customerData.MT.invoiceAddressName,
      state: state,
      city: city,
      zipcodeField: customerData.MT.zipcode,
      streetField: customerData.MT.street,
      mobileField: customerData.MT.mobile,
      checkbox: true 
    });
    
    // Store Address
    await b2b.addAddress(page, cr, 'addStoreAddressField', {
      addressNameField: customerData.MT.invoiceAddressName,
      storeCodeField: customerData.MT.storeCode,
      state: state,
      city: city,
      streetField: customerData.MT.street,
      pinpoint: true
    });
    
    //Prepare to capture create-customer response and Save Draft
    const createCustomerResponsePromise = page.waitForResponse(response =>
      response.url().includes('uat-b2b-ms-accounts.sociolabs.io/customers') &&
      response.request().method() === 'POST' &&
      response.status() === 200,
      { timeout: 25000 }
    );

    //Save Draft
    await b2b.clickButton(page, cr, 'saveDraftButton');

    //Wait for API response and persist customer id + name
    const createCustomerResponse = await createCustomerResponsePromise;
    try {
      const createCustomerData = await createCustomerResponse.json();
      const customerId = createCustomerData.data && createCustomerData.data._id ? createCustomerData.data._id : null;
      const customerName = createCustomerData.data && createCustomerData.data.name ? createCustomerData.data.name : null;
      if (customerId || customerName) {
        const dataPath = join(__dirname, './fixtures/customerData.json');
        const fileData = JSON.parse(readFileSync(dataPath, 'utf-8'));
        if (!fileData.lastCreatedCustomer) fileData.lastCreatedCustomer = {};
        if (customerId) fileData.lastCreatedCustomer.customerId = customerId;
        if (customerName) fileData.lastCreatedCustomer.customerName = customerName;
        writeFileSync(dataPath, JSON.stringify(fileData, null, 4));
        console.log('Saved customerId:', customerId);
        console.log('Saved customerName:', customerName);
      }
    } catch (e) {
      console.log('Failed to parse create-customer response or write fixture:', e);
    }
    await page.waitForTimeout(500);
  });
});
  
// Full Flow Customer until Approve/Reject
test.describe('[Test Set] Customer Registration Full Flow - Superadmin', () => {
  // Login before each test
  test.beforeEach(async ({ page }) => {
    await b2b.login(page, baseUrl, loginData.superadminUser.email, loginData.superadminUser.password);
  });

  test('[Test Case] Create Customer GT - Full Flow Approved', async ({ page }) => {
    const customerRegPage = new CustomerRegPage(page);
    const cr = customerRegPage.selectors;
    const photoFilePath = join(__dirname, customerData.GT.photoPath);
  
    const sequenceNum = await getSequenceNumber('customer');
    const customerNameSequence = 'AUTO-GT-' + getDate() + '-' + sequenceNum;
    console.log('Customer Name: ' + customerNameSequence);
  
    //GoTo Add Customer Menu
    await b2b.goToMenu(page, baseUrl, 'Customer', 'Customer Registration');
    await page.waitForLoadState('networkidle');
  
    //Listen to Country Response
    const responsePromiseCountry = page.waitForResponse(responseCountry =>
        responseCountry.url().includes('uat-b2b-ms-accounts.sociolabs.io/states/all?filter[country_id]=5c1aa60e56941c32a3245bf6&sort=%7B%22name%22:1%7D') &&
        responseCountry.status() === 200,
        { timeout: 25000 }
    );
  
    //Get the API response for country states and GET State ID
    const responseCountry = await responsePromiseCountry;
    const responseDataCountry = await responseCountry.json();
    const state = responseDataCountry.data[0].name;
    console.log('State: ' + state);
  
    //Add customer photo
    await page.waitForTimeout(500);
    await expect(cr.customerPhotoField).toBeVisible({ timeout: 10000});
    await cr.customerPhotoField.click({ timeout: 10000});
    await b2b.uploadAttachment(page, cr, 'customerPhotoField', photoFilePath);
    await expect(page.locator('img[src*="soc-uat-uploads.s3.amazonaws.com"]')).toBeVisible({ timeout: 5000});
  
    //Customer Name
    await expect(cr.customerNameField).toBeVisible();
    await cr.customerNameField.fill(customerNameSequence);
  
    //Company Address 1
    await expect(cr.streetField).toBeVisible();
    await cr.streetField.fill(customerData.GT.street)
  
    //Select State ID
    await b2b.selectDropdown(page, cr, 'stateField', state);
  
    //Listen to State API to get City
    const responsePromiseState = page.waitForResponse(responseState =>
        responseState.url().includes('uat-b2b-ms-accounts.sociolabs.io/cities/all?filter[state_id]=619f2e622a2ee936cc25d957&sort=%7B%22type%22:1,%22name%22:1%7D') &&
        responseState.status() === 200,
        { timeout: 25000 }
    );
    //Get the API response for city
    const responseState = await responsePromiseState;
    const responseDataState = await responseState.json();
    const city = responseDataState.data[0].name;
    console.log('City: ' + city);
  
    //Select City Based on State ID
    await b2b.selectDropdown(page, cr, 'cityField', city);
  
    //Input Zipcode
    await b2b.fillField(page, cr, 'zipcodeField', customerData.GT.zipcode);
  
    //Select Taxable Entrepreneur
    await expect(cr.pkpField).toBeVisible();
    await expect(cr.pkpField).toHaveValue(customerData.GT.pkp);
  
    //Select WHT
    await b2b.selectDropdown(page, cr, 'whtField', customerData.GT.wht);
  
    //Input Phone, Mobile, Email
    await b2b.fillField(page, cr, 'phoneField', customerData.GT.phone);
    await b2b.fillField(page, cr, 'mobileField', customerData.GT.mobile);
    
    const customerEmailSequence = 'af.auto' + getDate() + '+test' + getEmailSequenceNumber() + '@yopmail.com';
    console.log('Customer Email: ' + customerEmailSequence);
    await b2b.fillField(page, cr, 'emailField', customerEmailSequence);
  
    //Next Page
    await b2b.clickButton(page, cr, 'nextButton');
  
    //Page 2 - Sales Info Page
    //Select Sales Team
    await b2b.selectDropdown(page, cr, 'salesTeamField', customerData.GT.salesTeam);
  
    //Selet Market Type
    await b2b.selectDropdown(page, cr, 'marketTypeField', customerData.GT.marketType);
  
    //Select Business Type based on Sales Team
    // await b2b.selectDropdown(page, cr, 'businessTypeField', customerData.businessTypeGT);
    const businessTypefield = cr.businessTypeField;
    await expect(businessTypefield).toBeVisible();
    await businessTypefield.click({ force: true });
    await expect(page.getByRole('textbox', { name: 'Search something here...' })).toBeVisible({ timeout: 5000 });
    await page.getByRole('textbox', { name: 'Search something here...' }).fill(customerData.GT.businessType);
    await page.getByText(customerData.GT.businessType + ' (GT)', { exact: true }).click();  
    await expect(businessTypefield).toHaveValue(customerData.GT.businessType);
  
    //Select Account Based on Business Type
    await b2b.selectDropdown(page, cr, 'accountField', customerData.GT.account);
  
    //Select Sales Person based on Sales Team
    await b2b.selectDropdown(page, cr, 'salesPersonField', customerData.GT.salesPersonCode);
  
    //Fill Bank Name, Branch, Account Number, Account Name, Special Expiration Date
    await b2b.fillField(page, cr, 'bankNameField', customerData.GT.bankName);
    await b2b.fillField(page, cr, 'branchField', customerData.GT.branch);
    await b2b.fillField(page, cr, 'accountNumberField', customerData.GT.accountNumber);
    await b2b.fillField(page, cr, 'accountNameField', customerData.GT.accountName);
    await b2b.fillField(page, cr, 'specialExpDateField', customerData.GT.specialExp);
  
    //Select Customer Type
    await b2b.selectDropdown(page, cr, 'customerTypeField', customerData.GT.customerType);
  
    //Next Page
    await b2b.clickButton(page, cr, 'nextButton');
  
    //Page 3 - Customer Address
    // NPWP Address
    await b2b.addAddress(page, cr, 'addAddressField', {
      addressNameField: customerData.GT.taxName,
      taxNumberField: customerData.GT.taxNumber,
      state: state,
      city: city,
      zipcodeField: customerData.GT.zipcode,
      streetField: customerData.GT.street
    });
  
    // KTP Address
    await b2b.addAddress(page, cr, 'addAddressField', {
      addressNameField: customerData.GT.idName,
      idNumberField: customerData.GT.idNumber,
      state: state,
      city: city,
      zipcodeField: customerData.GT.zipcode,
      streetField: customerData.GT.street
    });
  
    // Delivery Address
    await b2b.addAddress(page, cr, 'addAddressField', {
      deliveryNameField: customerData.GT.deliveryAddressName,
      picAddressField: customerData.GT.addressPIC,
      state: state,
      city: city,
      zipcodeField: customerData.GT.zipcode,
      streetField: customerData.GT.street,
      mobileField: customerData.GT.mobile,
      pinpoint: true
    });
  
    // Invoice Address
    await b2b.addAddress(page, cr, 'addInvoiceAddressField', {
      addressNameField: customerData.GT.invoiceAddressName,
      state: state,
      city: city,
      zipcodeField: customerData.GT.zipcode,
      streetField: customerData.GT.street,
      mobileField: customerData.GT.mobile,
      checkbox: true 
    });
  
    // Store Address
    await b2b.addAddress(page, cr, 'addStoreAddressField', {
      addressNameField: customerData.GT.invoiceAddressName,
      storeCodeField: customerData.GT.storeCode,
      state: state,
      city: city,
      streetField: customerData.GT.street,
      pinpoint: true
    });
  
    //Prepare to capture create-customer response and Submit
    const createCustomerResponsePromise = page.waitForResponse(response =>
      response.url().includes('uat-b2b-ms-accounts.sociolabs.io/customers') &&
      response.request().method() === 'POST' &&
      response.status() === 200,
      { timeout: 25000 }
    );

    // Submit
    await b2b.clickButton(page, cr, 'submitButton');

    //Wait for API response and persist customer id + name
    let customerId, customerName;
    const createCustomerResponse = await createCustomerResponsePromise;
    try {
      const createCustomerData = await createCustomerResponse.json();
      customerId = createCustomerData.data && createCustomerData.data._id ? createCustomerData.data._id : null;
      customerName = createCustomerData.data && createCustomerData.data.name ? createCustomerData.data.name : null;
      if (customerId || customerName) {
        const dataPath = join(__dirname, './fixtures/customerData.json');
        const fileData = JSON.parse(readFileSync(dataPath, 'utf-8'));
        if (!fileData.lastCreatedCustomer) fileData.lastCreatedCustomer = {};
        if (customerId) fileData.lastCreatedCustomer.customerId = customerId;
        if (customerName) fileData.lastCreatedCustomer.customerName = customerName;
        writeFileSync(dataPath, JSON.stringify(fileData, null, 4));
        console.log('Saved customerId:', customerId);
        console.log('Saved customerName:', customerName);
      }
    } catch (e) {
      console.log('Failed to parse create-customer response or write fixture:', e);
    }
    await page.waitForTimeout(500);

    console.log('Customer ID: ' + customerId);
    console.log('Customer Name: ' + customerName);

    await expect(cr.submittedPopUp).toBeVisible();
    await b2b.clickButton(page, cr, 'okButton');
    await expect(cr.needApprovalStatus).toBeVisible();

    // Logout
    await expect(page.getByText(loginData.superadminUser.name)).toBeVisible({ timeout: 5000 });
    await page.getByText(loginData.superadminUser.name).click();
    await expect(page.getByText('Log out')).toBeVisible({ timeout: 5000 });
    await page.getByText('Log out').click();

    // Relogin
    await b2b.login(page, baseUrl, loginData.approverUser.email, loginData.approverUser.password);

    await b2b.goToMenu(page, baseUrl, 'Customer', 'All');
    await page.waitForLoadState('networkidle');
    
    // Approve Customer
    // Search Customer by customer name
    await b2b.search(page, cr, customerName);
    await page.waitForLoadState('networkidle');

    // Open the Customer Details
    await page.getByText(customerName, { exact: true }).first().click();
    await page.waitForLoadState('networkidle');

    // Approve the customer
    await expect(cr.confirmButton).toBeVisible();
    await cr.confirmButton.click();
    await expect(cr.approvedToast).toBeVisible();
    await expect(cr.approvedStatus).toBeVisible();
  });

  test('[Test Case] Create Customer GT - Full Flow Rejected', async ({ page }) => {
    const customerRegPage = new CustomerRegPage(page);
    const cr = customerRegPage.selectors;
    const photoFilePath = join(__dirname, customerData.GT.photoPath);
  
    const sequenceNum = await getSequenceNumber('customer');
    const customerNameSequence = 'AUTO-GT-' + getDate() + '-' + sequenceNum;
    console.log('Customer Name: ' + customerNameSequence);
  
    //GoTo Add Customer Menu
    await b2b.goToMenu(page, baseUrl, 'Customer', 'Customer Registration');
    await page.waitForLoadState('networkidle');
  
    //Listen to Country Response
    const responsePromiseCountry = page.waitForResponse(responseCountry =>
        responseCountry.url().includes('uat-b2b-ms-accounts.sociolabs.io/states/all?filter[country_id]=5c1aa60e56941c32a3245bf6&sort=%7B%22name%22:1%7D') &&
        responseCountry.status() === 200,
        { timeout: 25000 }
    );
  
    //Get the API response for country states and GET State ID
    const responseCountry = await responsePromiseCountry;
    const responseDataCountry = await responseCountry.json();
    const state = responseDataCountry.data[0].name;
    console.log('State: ' + state);
  
    //Add customer photo
    await page.waitForTimeout(500);
    await expect(cr.customerPhotoField).toBeVisible({ timeout: 10000});
    await cr.customerPhotoField.click({ timeout: 10000});
    await b2b.uploadAttachment(page, cr, 'customerPhotoField', photoFilePath);
    await expect(page.locator('img[src*="soc-uat-uploads.s3.amazonaws.com"]')).toBeVisible({ timeout: 5000});
  
    //Customer Name
    await expect(cr.customerNameField).toBeVisible();
    await cr.customerNameField.fill(customerNameSequence);
  
    //Company Address 1
    await expect(cr.streetField).toBeVisible();
    await cr.streetField.fill(customerData.GT.street)
  
    //Select State ID
    await b2b.selectDropdown(page, cr, 'stateField', state);
  
    //Listen to State API to get City
    const responsePromiseState = page.waitForResponse(responseState =>
        responseState.url().includes('uat-b2b-ms-accounts.sociolabs.io/cities/all?filter[state_id]=619f2e622a2ee936cc25d957&sort=%7B%22type%22:1,%22name%22:1%7D') &&
        responseState.status() === 200,
        { timeout: 25000 }
    );
    //Get the API response for city
    const responseState = await responsePromiseState;
    const responseDataState = await responseState.json();
    const city = responseDataState.data[0].name;
    console.log('City: ' + city);
  
    //Select City Based on State ID
    await b2b.selectDropdown(page, cr, 'cityField', city);
  
    //Input Zipcode
    await b2b.fillField(page, cr, 'zipcodeField', customerData.GT.zipcode);
  
    //Select Taxable Entrepreneur
    await expect(cr.pkpField).toBeVisible();
    await expect(cr.pkpField).toHaveValue(customerData.GT.pkp);
  
    //Select WHT
    await b2b.selectDropdown(page, cr, 'whtField', customerData.GT.wht);
  
    //Input Phone, Mobile, Email
    await b2b.fillField(page, cr, 'phoneField', customerData.GT.phone);
    await b2b.fillField(page, cr, 'mobileField', customerData.GT.mobile);
    
    const customerEmailSequence = 'af.auto' + getDate() + '+test' + getEmailSequenceNumber() + '@yopmail.com';
    console.log('Customer Email: ' + customerEmailSequence);
    await b2b.fillField(page, cr, 'emailField', customerEmailSequence);
  
    //Next Page
    await b2b.clickButton(page, cr, 'nextButton');
  
    //Page 2 - Sales Info Page
    //Select Sales Team
    await b2b.selectDropdown(page, cr, 'salesTeamField', customerData.GT.salesTeam);
  
    //Selet Market Type
    await b2b.selectDropdown(page, cr, 'marketTypeField', customerData.GT.marketType);
  
    //Select Business Type based on Sales Team
    // await b2b.selectDropdown(page, cr, 'businessTypeField', customerData.businessTypeGT);
    const businessTypefield = cr.businessTypeField;
    await expect(businessTypefield).toBeVisible();
    await businessTypefield.click({ force: true });
    await expect(page.getByRole('textbox', { name: 'Search something here...' })).toBeVisible({ timeout: 5000 });
    await page.getByRole('textbox', { name: 'Search something here...' }).fill(customerData.GT.businessType);
    await page.getByText(customerData.GT.businessType + ' (GT)', { exact: true }).click();  
    await expect(businessTypefield).toHaveValue(customerData.GT.businessType);
  
    //Select Account Based on Business Type
    await b2b.selectDropdown(page, cr, 'accountField', customerData.GT.account);
  
    //Select Sales Person based on Sales Team
    await b2b.selectDropdown(page, cr, 'salesPersonField', customerData.GT.salesPersonCode);
  
    //Fill Bank Name, Branch, Account Number, Account Name, Special Expiration Date
    await b2b.fillField(page, cr, 'bankNameField', customerData.GT.bankName);
    await b2b.fillField(page, cr, 'branchField', customerData.GT.branch);
    await b2b.fillField(page, cr, 'accountNumberField', customerData.GT.accountNumber);
    await b2b.fillField(page, cr, 'accountNameField', customerData.GT.accountName);
    await b2b.fillField(page, cr, 'specialExpDateField', customerData.GT.specialExp);
  
    //Select Customer Type
    await b2b.selectDropdown(page, cr, 'customerTypeField', customerData.GT.customerType);
  
    //Next Page
    await b2b.clickButton(page, cr, 'nextButton');
  
    //Page 3 - Customer Address
    // NPWP Address
    await b2b.addAddress(page, cr, 'addAddressField', {
      addressNameField: customerData.GT.taxName,
      taxNumberField: customerData.GT.taxNumber,
      state: state,
      city: city,
      zipcodeField: customerData.GT.zipcode,
      streetField: customerData.GT.street
    });
  
    // KTP Address
    await b2b.addAddress(page, cr, 'addAddressField', {
      addressNameField: customerData.GT.idName,
      idNumberField: customerData.GT.idNumber,
      state: state,
      city: city,
      zipcodeField: customerData.GT.zipcode,
      streetField: customerData.GT.street
    });
  
    // Delivery Address
    await b2b.addAddress(page, cr, 'addAddressField', {
      deliveryNameField: customerData.GT.deliveryAddressName,
      picAddressField: customerData.GT.addressPIC,
      state: state,
      city: city,
      zipcodeField: customerData.GT.zipcode,
      streetField: customerData.GT.street,
      mobileField: customerData.GT.mobile,
      pinpoint: true
    });
  
    // Invoice Address
    await b2b.addAddress(page, cr, 'addInvoiceAddressField', {
      addressNameField: customerData.GT.invoiceAddressName,
      state: state,
      city: city,
      zipcodeField: customerData.GT.zipcode,
      streetField: customerData.GT.street,
      mobileField: customerData.GT.mobile,
      checkbox: true 
    });
  
    // Store Address
    await b2b.addAddress(page, cr, 'addStoreAddressField', {
      addressNameField: customerData.GT.invoiceAddressName,
      storeCodeField: customerData.GT.storeCode,
      state: state,
      city: city,
      streetField: customerData.GT.street,
      pinpoint: true
    });
  
    //Prepare to capture create-customer response and Submit
    const createCustomerResponsePromise = page.waitForResponse(response =>
      response.url().includes('uat-b2b-ms-accounts.sociolabs.io/customers') &&
      response.request().method() === 'POST' &&
      response.status() === 200,
      { timeout: 25000 }
    );

    // Submit
    await b2b.clickButton(page, cr, 'submitButton');

    //Wait for API response and persist customer id + name
    let customerId, customerName;
    const createCustomerResponse = await createCustomerResponsePromise;
    try {
      const createCustomerData = await createCustomerResponse.json();
      customerId = createCustomerData.data && createCustomerData.data._id ? createCustomerData.data._id : null;
      customerName = createCustomerData.data && createCustomerData.data.name ? createCustomerData.data.name : null;
      if (customerId || customerName) {
        const dataPath = join(__dirname, './fixtures/customerData.json');
        const fileData = JSON.parse(readFileSync(dataPath, 'utf-8'));
        if (!fileData.lastCreatedCustomer) fileData.lastCreatedCustomer = {};
        if (customerId) fileData.lastCreatedCustomer.customerId = customerId;
        if (customerName) fileData.lastCreatedCustomer.customerName = customerName;
        writeFileSync(dataPath, JSON.stringify(fileData, null, 4));
        console.log('Saved customerId:', customerId);
        console.log('Saved customerName:', customerName);
      }
    } catch (e) {
      console.log('Failed to parse create-customer response or write fixture:', e);
    }
    await page.waitForTimeout(500);

    console.log('Customer ID: ' + customerId);
    console.log('Customer Name: ' + customerName);

    await expect(cr.submittedPopUp).toBeVisible();
    await b2b.clickButton(page, cr, 'okButton');
    await expect(cr.needApprovalStatus).toBeVisible();

    // Logout
    await expect(page.getByText(loginData.superadminUser.name)).toBeVisible({ timeout: 5000 });
    await page.getByText(loginData.superadminUser.name).click();
    await expect(page.getByText('Log out')).toBeVisible({ timeout: 5000 });
    await page.getByText('Log out').click();

    // Relogin
    await b2b.login(page, baseUrl, loginData.approverUser.email, loginData.approverUser.password);

    await b2b.goToMenu(page, baseUrl, 'Customer', 'All');
    await page.waitForLoadState('networkidle');
    
    // Reject Customer
    // Search Customer by customer name
    await b2b.search(page, cr, customerName);
    await page.waitForLoadState('networkidle');

    // Open the Customer Details
    await page.getByText(customerName, { exact: true }).first().click();
    await page.waitForLoadState('networkidle');

    // Reject the customer
    await expect(cr.rejectButton).toBeVisible();
    await cr.rejectButton.click();
    await expect(cr.rejectReasonPopUp).toBeVisible();
    await cr.rejectReasonPopUp.fill('Test Reject Customer Automation')
    await cr.submitButton.click();
    await expect(cr.rejectedStatus).toBeVisible();
  });

  test('[Test Case] Create Customer MT - Full Flow Approved', async ({ page }) => {
    const customerRegPage = new CustomerRegPage(page);
    const cr = customerRegPage.selectors;
    const photoFilePath = join(__dirname, customerData.MT.photoPath);
    
    const sequenceNum = await getSequenceNumber('customer');
    const customerNameSequence = 'AUTO-MT-' + getDate() + '-' + sequenceNum;
    console.log('Customer Name: ' + customerNameSequence);
    
    //GoTo Add Customer Menu
    await b2b.goToMenu(page, baseUrl, 'Customer', 'Customer Registration');
    await page.waitForLoadState('networkidle');
    
    //Listen to Country Response
    const responsePromiseCountry = page.waitForResponse(responseCountry =>
      responseCountry.url().includes('uat-b2b-ms-accounts.sociolabs.io/states/all?filter[country_id]=5c1aa60e56941c32a3245bf6&sort=%7B%22name%22:1%7D') &&
      responseCountry.status() === 200,
      { timeout: 25000 }
    );
  
    //Get the API response for country states and GET State ID
    const responseCountry = await responsePromiseCountry;
    const responseDataCountry = await responseCountry.json();
    const state = responseDataCountry.data[0].name;
    console.log('State: ' + state);
    
    //Add customer photo
    await page.waitForTimeout(500);
    await expect(cr.customerPhotoField).toBeVisible({ timeout: 10000});
    await cr.customerPhotoField.click({ timeout: 10000});
    await b2b.uploadAttachment(page, cr, 'customerPhotoField', photoFilePath);
    await expect(page.locator('img[src*="soc-uat-uploads.s3.amazonaws.com"]')).toBeVisible({ timeout: 5000});
    
    //Customer Name
    await expect(cr.customerNameField).toBeVisible();
    await cr.customerNameField.fill(customerNameSequence);
    
    //Company Address 1
    await expect(cr.streetField).toBeVisible();
    await cr.streetField.fill(customerData.MT.street)
    
    //Select State ID
    await b2b.selectDropdown(page, cr, 'stateField', state);
    
    //Listen to State API to get City
    const responsePromiseState = page.waitForResponse(responseState =>
      responseState.url().includes('uat-b2b-ms-accounts.sociolabs.io/cities/all?filter[state_id]=619f2e622a2ee936cc25d957&sort=%7B%22type%22:1,%22name%22:1%7D') &&
      responseState.status() === 200,
      { timeout: 25000 }
    );
    //Get the API response for city
    const responseState = await responsePromiseState;
    const responseDataState = await responseState.json();
    const city = responseDataState.data[0].name;
    console.log('City: ' + city);
    
    //Select City Based on State ID
    await b2b.selectDropdown(page, cr, 'cityField', city);
    
    //Input Zipcode
    await b2b.fillField(page, cr, 'zipcodeField', customerData.MT.zipcode);
    
    //Select Taxable Entrepreneur
    await expect(cr.pkpField).toBeVisible();
    await expect(cr.pkpField).toHaveValue(customerData.MT.pkp);
    
    //Select WHT
    await b2b.selectDropdown(page, cr, 'whtField', customerData.MT.wht);
    
    //Input Phone, Mobile, Email
    await b2b.fillField(page, cr, 'phoneField', customerData.MT.phone);
    await b2b.fillField(page, cr, 'mobileField', customerData.MT.mobile);
    
    const customerEmailSequence = 'af.auto' + getDate() + '+test' + getEmailSequenceNumber() + '@yopmail.com';
    console.log('Customer Email: ' + customerEmailSequence);
    await b2b.fillField(page, cr, 'emailField', customerEmailSequence);
    
    //Next Page
    await b2b.clickButton(page, cr, 'nextButton');
    
    //Page 2 - Sales Info Page
    //Select Sales Team
    await b2b.selectDropdown(page, cr, 'salesTeamField', customerData.MT.salesTeam);
    
    //Selet Market Type
    await b2b.selectDropdown(page, cr, 'marketTypeField', customerData.MT.marketType);
    
    //Select Business Type based on Sales Team
    // await b2b.selectDropdown(page, cr, 'businessTypeField', customerData.businessTypeGT);
    const businessTypefield = cr.businessTypeField;
    await expect(businessTypefield).toBeVisible();
    await businessTypefield.click({ force: true });
    await expect(page.getByRole('textbox', { name: 'Search something here...' })).toBeVisible({ timeout: 5000 });
    await page.getByRole('textbox', { name: 'Search something here...' }).fill(customerData.MT.businessType);
    await page.getByText(customerData.MT.businessType + ' (MT)', { exact: true }).click();  
    await expect(businessTypefield).toHaveValue(customerData.MT.businessType);
    
    //Select Account Based on Business Type
    await b2b.selectDropdown(page, cr, 'accountField', customerData.MT.account);
    
    //Select Sales Person based on Sales Team
    await b2b.selectDropdown(page, cr, 'salesPersonField', customerData.MT.salesPersonCode);
    
    //Fill Bank Name, Branch, Account Number, Account Name, Special Expiration Date
    await b2b.fillField(page, cr, 'bankNameField', customerData.MT.bankName);
    await b2b.fillField(page, cr, 'branchField', customerData.MT.branch);
    await b2b.fillField(page, cr, 'accountNumberField', customerData.MT.accountNumber);
    await b2b.fillField(page, cr, 'accountNameField', customerData.MT.accountName);
    await b2b.fillField(page, cr, 'specialExpDateField', customerData.MT.specialExp);
    
    //Select Customer Type
    await b2b.selectDropdown(page, cr, 'customerTypeField', customerData.MT.customerType);
    
    //Next Page
    await b2b.clickButton(page, cr, 'nextButton');
  
    //Page 3 - Customer Address
    // NPWP Address
    await b2b.addAddress(page, cr, 'addAddressField', {
      addressNameField: customerData.MT.taxName,
      taxNumberField: customerData.MT.taxNumber,
      state: state,
      city: city,
      zipcodeField: customerData.MT.zipcode,
      streetField: customerData.MT.street
    });
    
    // KTP Address
    await b2b.addAddress(page, cr, 'addAddressField', {
      addressNameField: customerData.MT.idName,
      idNumberField: customerData.MT.idNumber,
      state: state,
      city: city,
      zipcodeField: customerData.MT.zipcode,
      streetField: customerData.MT.street
    });
    
    // Delivery Address
    await b2b.addAddress(page, cr, 'addAddressField', {
      deliveryNameField: customerData.MT.deliveryAddressName,
      picAddressField: customerData.MT.addressPIC,
      state: state,
      city: city,
      zipcodeField: customerData.MT.zipcode,
      streetField: customerData.MT.street,
      mobileField: customerData.MT.mobile,
      pinpoint: true
    });
    
    // Invoice Address
    await b2b.addAddress(page, cr, 'addInvoiceAddressField', {
      addressNameField: customerData.MT.invoiceAddressName,
      state: state,
      city: city,
      zipcodeField: customerData.MT.zipcode,
      streetField: customerData.MT.street,
      mobileField: customerData.MT.mobile,
      checkbox: true 
    });
    
    // Store Address
    await b2b.addAddress(page, cr, 'addStoreAddressField', {
      addressNameField: customerData.MT.invoiceAddressName,
      storeCodeField: customerData.MT.storeCode,
      state: state,
      city: city,
      streetField: customerData.MT.street,
      pinpoint: true
    });
    
    //Prepare to capture create-customer response and Save Draft
    const createCustomerResponsePromise = page.waitForResponse(response =>
      response.url().includes('uat-b2b-ms-accounts.sociolabs.io/customers') &&
      response.request().method() === 'POST' &&
      response.status() === 200,
      { timeout: 25000 }
    );

    // Submit
    await b2b.clickButton(page, cr, 'submitButton');

    //Wait for API response and persist customer id + name
    let customerId, customerName;
    const createCustomerResponse = await createCustomerResponsePromise;
    try {
      const createCustomerData = await createCustomerResponse.json();
      customerId = createCustomerData.data && createCustomerData.data._id ? createCustomerData.data._id : null;
      customerName = createCustomerData.data && createCustomerData.data.name ? createCustomerData.data.name : null;
      if (customerId || customerName) {
        const dataPath = join(__dirname, './fixtures/customerData.json');
        const fileData = JSON.parse(readFileSync(dataPath, 'utf-8'));
        if (!fileData.lastCreatedCustomer) fileData.lastCreatedCustomer = {};
        if (customerId) fileData.lastCreatedCustomer.customerId = customerId;
        if (customerName) fileData.lastCreatedCustomer.customerName = customerName;
        writeFileSync(dataPath, JSON.stringify(fileData, null, 4));
        console.log('Saved customerId:', customerId);
        console.log('Saved customerName:', customerName);
      }
    } catch (e) {
      console.log('Failed to parse create-customer response or write fixture:', e);
    }
    await page.waitForTimeout(500);

    console.log('Customer ID: ' + customerId);
    console.log('Customer Name: ' + customerName);

    await expect(cr.submittedPopUp).toBeVisible();
    await b2b.clickButton(page, cr, 'okButton');
    await expect(cr.needApprovalStatus).toBeVisible();

    // Logout
    await expect(page.getByText(loginData.superadminUser.name)).toBeVisible({ timeout: 5000 });
    await page.getByText(loginData.superadminUser.name).click();
    await expect(page.getByText('Log out')).toBeVisible({ timeout: 5000 });
    await page.getByText('Log out').click();

    // Relogin
    await b2b.login(page, baseUrl, loginData.approverUser.email, loginData.approverUser.password);

    await b2b.goToMenu(page, baseUrl, 'Customer', 'All');
    await page.waitForLoadState('networkidle');
    
    // Approve Customer
    // Search Customer by customer name
    await b2b.search(page, cr, customerName);
    await page.waitForLoadState('networkidle');

    // Open the Customer Details
    await page.getByText(customerName, { exact: true }).first().click();
    await page.waitForLoadState('networkidle');

    // Approve the customer
    await expect(cr.confirmButton).toBeVisible();
    await cr.confirmButton.click();
    await expect(cr.approvedToast).toBeVisible();
    await expect(cr.approvedStatus).toBeVisible();
  });
  
  test('[Test Case] Create Customer MT - Full Flow Rejected', async ({ page }) => {
    const customerRegPage = new CustomerRegPage(page);
    const cr = customerRegPage.selectors;
    const photoFilePath = join(__dirname, customerData.MT.photoPath);
    
    const sequenceNum = await getSequenceNumber('customer');
    const customerNameSequence = 'AUTO-MT-' + getDate() + '-' + sequenceNum;
    console.log('Customer Name: ' + customerNameSequence);
    
    //GoTo Add Customer Menu
    await b2b.goToMenu(page, baseUrl, 'Customer', 'Customer Registration');
    await page.waitForLoadState('networkidle');
    
    //Listen to Country Response
    const responsePromiseCountry = page.waitForResponse(responseCountry =>
      responseCountry.url().includes('uat-b2b-ms-accounts.sociolabs.io/states/all?filter[country_id]=5c1aa60e56941c32a3245bf6&sort=%7B%22name%22:1%7D') &&
      responseCountry.status() === 200,
      { timeout: 25000 }
    );
  
    //Get the API response for country states and GET State ID
    const responseCountry = await responsePromiseCountry;
    const responseDataCountry = await responseCountry.json();
    const state = responseDataCountry.data[0].name;
    console.log('State: ' + state);
    
    //Add customer photo
    await page.waitForTimeout(500);
    await expect(cr.customerPhotoField).toBeVisible({ timeout: 10000});
    await cr.customerPhotoField.click({ timeout: 10000});
    await b2b.uploadAttachment(page, cr, 'customerPhotoField', photoFilePath);
    await expect(page.locator('img[src*="soc-uat-uploads.s3.amazonaws.com"]')).toBeVisible({ timeout: 5000});
    
    //Customer Name
    await expect(cr.customerNameField).toBeVisible();
    await cr.customerNameField.fill(customerNameSequence);
    
    //Company Address 1
    await expect(cr.streetField).toBeVisible();
    await cr.streetField.fill(customerData.MT.street)
    
    //Select State ID
    await b2b.selectDropdown(page, cr, 'stateField', state);
    
    //Listen to State API to get City
    const responsePromiseState = page.waitForResponse(responseState =>
      responseState.url().includes('uat-b2b-ms-accounts.sociolabs.io/cities/all?filter[state_id]=619f2e622a2ee936cc25d957&sort=%7B%22type%22:1,%22name%22:1%7D') &&
      responseState.status() === 200,
      { timeout: 25000 }
    );
    //Get the API response for city
    const responseState = await responsePromiseState;
    const responseDataState = await responseState.json();
    const city = responseDataState.data[0].name;
    console.log('City: ' + city);
    
    //Select City Based on State ID
    await b2b.selectDropdown(page, cr, 'cityField', city);
    
    //Input Zipcode
    await b2b.fillField(page, cr, 'zipcodeField', customerData.MT.zipcode);
    
    //Select Taxable Entrepreneur
    await expect(cr.pkpField).toBeVisible();
    await expect(cr.pkpField).toHaveValue(customerData.MT.pkp);
    
    //Select WHT
    await b2b.selectDropdown(page, cr, 'whtField', customerData.MT.wht);
    
    //Input Phone, Mobile, Email
    await b2b.fillField(page, cr, 'phoneField', customerData.MT.phone);
    await b2b.fillField(page, cr, 'mobileField', customerData.MT.mobile);
    
    const customerEmailSequence = 'af.auto' + getDate() + '+test' + getEmailSequenceNumber() + '@yopmail.com';
    console.log('Customer Email: ' + customerEmailSequence);
    await b2b.fillField(page, cr, 'emailField', customerEmailSequence);
    
    //Next Page
    await b2b.clickButton(page, cr, 'nextButton');
    
    //Page 2 - Sales Info Page
    //Select Sales Team
    await b2b.selectDropdown(page, cr, 'salesTeamField', customerData.MT.salesTeam);
    
    //Selet Market Type
    await b2b.selectDropdown(page, cr, 'marketTypeField', customerData.MT.marketType);
    
    //Select Business Type based on Sales Team
    // await b2b.selectDropdown(page, cr, 'businessTypeField', customerData.businessTypeGT);
    const businessTypefield = cr.businessTypeField;
    await expect(businessTypefield).toBeVisible();
    await businessTypefield.click({ force: true });
    await expect(page.getByRole('textbox', { name: 'Search something here...' })).toBeVisible({ timeout: 5000 });
    await page.getByRole('textbox', { name: 'Search something here...' }).fill(customerData.MT.businessType);
    await page.getByText(customerData.MT.businessType + ' (MT)', { exact: true }).click();  
    await expect(businessTypefield).toHaveValue(customerData.MT.businessType);
    
    //Select Account Based on Business Type
    await b2b.selectDropdown(page, cr, 'accountField', customerData.MT.account);
    
    //Select Sales Person based on Sales Team
    await b2b.selectDropdown(page, cr, 'salesPersonField', customerData.MT.salesPersonCode);
    
    //Fill Bank Name, Branch, Account Number, Account Name, Special Expiration Date
    await b2b.fillField(page, cr, 'bankNameField', customerData.MT.bankName);
    await b2b.fillField(page, cr, 'branchField', customerData.MT.branch);
    await b2b.fillField(page, cr, 'accountNumberField', customerData.MT.accountNumber);
    await b2b.fillField(page, cr, 'accountNameField', customerData.MT.accountName);
    await b2b.fillField(page, cr, 'specialExpDateField', customerData.MT.specialExp);
    
    //Select Customer Type
    await b2b.selectDropdown(page, cr, 'customerTypeField', customerData.MT.customerType);
    
    //Next Page
    await b2b.clickButton(page, cr, 'nextButton');
  
    //Page 3 - Customer Address
    // NPWP Address
    await b2b.addAddress(page, cr, 'addAddressField', {
      addressNameField: customerData.MT.taxName,
      taxNumberField: customerData.MT.taxNumber,
      state: state,
      city: city,
      zipcodeField: customerData.MT.zipcode,
      streetField: customerData.MT.street
    });
    
    // KTP Address
    await b2b.addAddress(page, cr, 'addAddressField', {
      addressNameField: customerData.MT.idName,
      idNumberField: customerData.MT.idNumber,
      state: state,
      city: city,
      zipcodeField: customerData.MT.zipcode,
      streetField: customerData.MT.street
    });
    
    // Delivery Address
    await b2b.addAddress(page, cr, 'addAddressField', {
      deliveryNameField: customerData.MT.deliveryAddressName,
      picAddressField: customerData.MT.addressPIC,
      state: state,
      city: city,
      zipcodeField: customerData.MT.zipcode,
      streetField: customerData.MT.street,
      mobileField: customerData.MT.mobile,
      pinpoint: true
    });
    
    // Invoice Address
    await b2b.addAddress(page, cr, 'addInvoiceAddressField', {
      addressNameField: customerData.MT.invoiceAddressName,
      state: state,
      city: city,
      zipcodeField: customerData.MT.zipcode,
      streetField: customerData.MT.street,
      mobileField: customerData.MT.mobile,
      checkbox: true 
    });
    
    // Store Address
    await b2b.addAddress(page, cr, 'addStoreAddressField', {
      addressNameField: customerData.MT.invoiceAddressName,
      storeCodeField: customerData.MT.storeCode,
      state: state,
      city: city,
      streetField: customerData.MT.street,
      pinpoint: true
    });
    
    //Prepare to capture create-customer response and Save Draft
    const createCustomerResponsePromise = page.waitForResponse(response =>
      response.url().includes('uat-b2b-ms-accounts.sociolabs.io/customers') &&
      response.request().method() === 'POST' &&
      response.status() === 200,
      { timeout: 25000 }
    );

    // Submit
    await b2b.clickButton(page, cr, 'submitButton');

    //Wait for API response and persist customer id + name
    let customerId, customerName;
    const createCustomerResponse = await createCustomerResponsePromise;
    try {
      const createCustomerData = await createCustomerResponse.json();
      customerId = createCustomerData.data && createCustomerData.data._id ? createCustomerData.data._id : null;
      customerName = createCustomerData.data && createCustomerData.data.name ? createCustomerData.data.name : null;
      if (customerId || customerName) {
        const dataPath = join(__dirname, './fixtures/customerData.json');
        const fileData = JSON.parse(readFileSync(dataPath, 'utf-8'));
        if (!fileData.lastCreatedCustomer) fileData.lastCreatedCustomer = {};
        if (customerId) fileData.lastCreatedCustomer.customerId = customerId;
        if (customerName) fileData.lastCreatedCustomer.customerName = customerName;
        writeFileSync(dataPath, JSON.stringify(fileData, null, 4));
        console.log('Saved customerId:', customerId);
        console.log('Saved customerName:', customerName);
      }
    } catch (e) {
      console.log('Failed to parse create-customer response or write fixture:', e);
    }
    await page.waitForTimeout(500);

    console.log('Customer ID: ' + customerId);
    console.log('Customer Name: ' + customerName);

    await expect(cr.submittedPopUp).toBeVisible();
    await b2b.clickButton(page, cr, 'okButton');
    await expect(cr.needApprovalStatus).toBeVisible();

    // Logout
    await expect(page.getByText(loginData.superadminUser.name)).toBeVisible({ timeout: 5000 });
    await page.getByText(loginData.superadminUser.name).click();
    await expect(page.getByText('Log out')).toBeVisible({ timeout: 5000 });
    await page.getByText('Log out').click();

    // Relogin
    await b2b.login(page, baseUrl, loginData.approverUser.email, loginData.approverUser.password);

    await b2b.goToMenu(page, baseUrl, 'Customer', 'All');
    await page.waitForLoadState('networkidle');
    
    // Reject Customer
    // Search Customer by customer name
    await b2b.search(page, cr, customerName);
    await page.waitForLoadState('networkidle');

    // Open the Customer Details
    await page.getByText(customerName, { exact: true }).first().click();
    await page.waitForLoadState('networkidle');

    // Reject the customer
    await expect(cr.rejectButton).toBeVisible();
    await cr.rejectButton.click();
    await expect(cr.rejectReasonPopUp).toBeVisible();
    await cr.rejectReasonPopUp.fill('Test Reject Customer Automation')
    await cr.submitButton.click();
    await expect(cr.rejectedStatus).toBeVisible();
  });
});
  