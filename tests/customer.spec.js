// @ts-check
import { test, expect } from '@playwright/test';
import { join } from 'path';
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
    const customerNameSequence = 'AF-GT-CUSTOMER-AUTO-' + getDate() + '-' + sequenceNum;
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
  
    //Save Draft
    await b2b.clickButton(page, cr, 'saveDraftButton');
    await page.waitForTimeout(500);
  });
  
  test('[Test Case] Create Customer MT - No Pinpoint - Save Draft', async ({ page }) => {
    const customerRegPage = new CustomerRegPage(page);
    const cr = customerRegPage.selectors;
    const photoFilePath = join(__dirname, customerData.MT.photoPath);
  
    const sequenceNum = await getSequenceNumber('customer');
    const customerNameSequence = 'AF-MT-CUSTOMER-AUTO-' + getDate() + '-' + sequenceNum;
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
  
    //Save Draft
    await b2b.clickButton(page, cr, 'saveDraftButton');
    await page.waitForTimeout(500);
  });

  test('[Test Case] Create Customer MT - With Pinpoint - Save Draft', async ({ page }) => {
    const customerRegPage = new CustomerRegPage(page);
    const cr = customerRegPage.selectors;
    const photoFilePath = join(__dirname, customerData.MT.photoPath);
  
    const sequenceNum = await getSequenceNumber('customer');
    const customerNameSequence = 'AF-MT-CUSTOMER-AUTO-' + getDate() + '-' + sequenceNum;
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
  
    //Save Draft
    await b2b.clickButton(page, cr, 'saveDraftButton');
    await page.waitForTimeout(500);
  });
});
