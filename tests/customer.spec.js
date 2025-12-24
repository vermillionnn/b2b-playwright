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

// Login before each test
test.beforeEach(async ({ page }) => {
  await b2b.login(page, baseUrl, loginData.validUser.email, loginData.validUser.password);
});

// Create Customer
test('Create Customer GT - No Pinpoint - Save Draft', async ({ page }) => {
  const customerRegPage = new CustomerRegPage(page);
  const cr = customerRegPage.selectors;

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
  const filePath = join(__dirname, './sample-file/gt-yellow.png');
  const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      cr.customerPhotoField.click()
  ]);
  await fileChooser.setFiles(filePath);
  await expect(page.locator('img[src*="soc-uat-uploads.s3.amazonaws.com"]')).toBeVisible({ timeout: 5000});

  //Customer Name
  await expect(cr.customerNameField).toBeVisible();
  await cr.customerNameField.fill(customerNameSequence);

  //Company Address 1
  await expect(cr.streetField).toBeVisible();
  await cr.streetField.fill(customerData.street)

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
  await b2b.fillField(page, cr, 'zipcodeField', customerData.zipcode);

  //Select Taxable Entrepreneur
  await expect(cr.pkpField).toBeVisible();
  await expect(cr.pkpField).toHaveValue(customerData.pkp);

  //Select WHT
  await b2b.selectDropdown(page, cr, 'whtField', customerData.wht);

  //Input Phone, Mobile, Email
  await b2b.fillField(page, cr, 'phoneField', customerData.phone);
  await b2b.fillField(page, cr, 'mobileField', customerData.mobile);
  
  const customerEmailSequence = 'af.auto' + getDate() + '+test' + getEmailSequenceNumber() + '@yopmail.com';
  console.log('Customer Email: ' + customerEmailSequence);
  await b2b.fillField(page, cr, 'emailField', customerEmailSequence);

  //Next Page
  await b2b.clickButton(page, cr, 'nextButton');

  //Page 2 - Sales Info Page
  //Select Sales Team
  await b2b.selectDropdown(page, cr, 'salesTeamField', customerData.salesTeam);

  //Selet Market Type
  await b2b.selectDropdown(page, cr, 'marketTypeField', customerData.marketTypeGT);

  //Select Business Type based on Sales Team
  // await b2b.selectDropdown(page, cr, 'businessTypeField', customerData.businessTypeGT);
  const businessTypefield = cr.businessTypeField;
  await expect(businessTypefield).toBeVisible();
  await businessTypefield.click({ force: true });
  await expect(page.getByRole('textbox', { name: 'Search something here...' })).toBeVisible({ timeout: 5000 });
  await page.getByRole('textbox', { name: 'Search something here...' }).fill(customerData.businessTypeGT);
  await page.getByText(customerData.businessTypeGT + ' (GT)', { exact: true }).click();  
  await expect(businessTypefield).toHaveValue(customerData.businessTypeGT);

  //Select Account Based on Business Type
  await b2b.selectDropdown(page, cr, 'accountField', customerData.accountGT);

  //Select Sales Person based on Sales Team
  await b2b.selectDropdown(page, cr, 'salesPersonField', customerData.salesPersonCode);

  //Fill Bank Name, Branch, Account Number, Account Name, Special Expiration Date
  await b2b.fillField(page, cr, 'bankNameField', customerData.bankName);
  await b2b.fillField(page, cr, 'branchField', customerData.branch);
  await b2b.fillField(page, cr, 'accountNumberField', customerData.accountNumber);
  await b2b.fillField(page, cr, 'accountNameField', customerData.accountName);
  await b2b.fillField(page, cr, 'specialExpDateField', customerData.specialExp);

  //Select Customer Type
  await b2b.selectDropdown(page, cr, 'customerTypeField', customerData.customerType);

  //Next Page
  await b2b.clickButton(page, cr, 'nextButton');

  //Page 3 - Customer Address
  // NPWP Address
  await b2b.addAddress(page, cr, 'addAddressField', {
    addressNameField: customerData.taxName,
    taxNumberField: customerData.taxNumber,
    state: state,
    city: city,
    zipcodeField: customerData.zipcode,
    streetField: customerData.street
  });

  // KTP Address
  await b2b.addAddress(page, cr, 'addAddressField', {
    addressNameField: customerData.idName,
    idNumberField: customerData.idNumber,
    state: state,
    city: city,
    zipcodeField: customerData.zipcode,
    streetField: customerData.street
  });

  // Delivery Address
  await b2b.addAddress(page, cr, 'addAddressField', {
    deliveryNameField: customerData.deliveryAddressName,
    picAddressField: customerData.addressPIC,
    state: state,
    city: city,
    zipcodeField: customerData.zipcode,
    streetField: customerData.street,
    mobileField: customerData.mobile
  });

  // Invoice Address
  await b2b.addAddress(page, cr, 'addInvoiceAddressField', {
    addressNameField: customerData.invoiceAddressName,
    state: state,
    city: city,
    zipcodeField: customerData.zipcode,
    streetField: customerData.street,
    mobileField: customerData.mobile,
    checkbox: true 
  });

  // Store Address
  await b2b.addAddress(page, cr, 'addStoreAddressField', {
    addressNameField: customerData.invoiceAddressName,
    storeCodeField: customerData.storeCode,
    state: state,
    city: city,
    streetField: customerData.street,
  });

  //Save Draft
  await b2b.clickButton(page, cr, 'saveDraftButton');
  await page.waitForTimeout(500);
});

test('Create Customer MT - No Pinpoint - Save Draft', async ({ page }) => {
  const customerRegPage = new CustomerRegPage(page);
  const cr = customerRegPage.selectors;

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
  const filePath = join(__dirname, './sample-file/mt-yellow.png');
  const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      cr.customerPhotoField.click()
  ]);
  await fileChooser.setFiles(filePath);
  await expect(page.locator('img[src*="soc-uat-uploads.s3.amazonaws.com"]')).toBeVisible({ timeout: 5000});

  //Customer Name
  await expect(cr.customerNameField).toBeVisible();
  await cr.customerNameField.fill(customerNameSequence);

  //Company Address 1
  await expect(cr.streetField).toBeVisible();
  await cr.streetField.fill(customerData.street)

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
  await b2b.fillField(page, cr, 'zipcodeField', customerData.zipcode);

  //Select Taxable Entrepreneur
  await expect(cr.pkpField).toBeVisible();
  await expect(cr.pkpField).toHaveValue(customerData.pkp);

  //Select WHT
  await b2b.selectDropdown(page, cr, 'whtField', customerData.wht);

  //Input Phone, Mobile, Email
  await b2b.fillField(page, cr, 'phoneField', customerData.phone);
  await b2b.fillField(page, cr, 'mobileField', customerData.mobile);
  
  const customerEmailSequence = 'af.auto' + getDate() + '+test' + getEmailSequenceNumber() + '@yopmail.com';
  console.log('Customer Email: ' + customerEmailSequence);
  await b2b.fillField(page, cr, 'emailField', customerEmailSequence);

  //Next Page
  await b2b.clickButton(page, cr, 'nextButton');

  //Page 2 - Sales Info Page
  //Select Sales Team
  await b2b.selectDropdown(page, cr, 'salesTeamField', customerData.salesTeam);

  //Selet Market Type
  await b2b.selectDropdown(page, cr, 'marketTypeField', customerData.marketTypeMT);

  //Select Business Type based on Sales Team
  // await b2b.selectDropdown(page, cr, 'businessTypeField', customerData.businessTypeGT);
  const businessTypefield = cr.businessTypeField;
  await expect(businessTypefield).toBeVisible();
  await businessTypefield.click({ force: true });
  await expect(page.getByRole('textbox', { name: 'Search something here...' })).toBeVisible({ timeout: 5000 });
  await page.getByRole('textbox', { name: 'Search something here...' }).fill(customerData.businessTypeMT);
  await page.getByText(customerData.businessTypeMT + ' (MT)', { exact: true }).click();  
  await expect(businessTypefield).toHaveValue(customerData.businessTypeMT);

  //Select Account Based on Business Type
  await b2b.selectDropdown(page, cr, 'accountField', customerData.accountMT);

  //Select Sales Person based on Sales Team
  await b2b.selectDropdown(page, cr, 'salesPersonField', customerData.salesPersonCode);

  //Fill Bank Name, Branch, Account Number, Account Name, Special Expiration Date
  await b2b.fillField(page, cr, 'bankNameField', customerData.bankName);
  await b2b.fillField(page, cr, 'branchField', customerData.branch);
  await b2b.fillField(page, cr, 'accountNumberField', customerData.accountNumber);
  await b2b.fillField(page, cr, 'accountNameField', customerData.accountName);
  await b2b.fillField(page, cr, 'specialExpDateField', customerData.specialExp);

  //Select Customer Type
  await b2b.selectDropdown(page, cr, 'customerTypeField', customerData.customerType);

  //Next Page
  await b2b.clickButton(page, cr, 'nextButton');

  //Page 3 - Customer Address
  // NPWP Address
  await b2b.addAddress(page, cr, 'addAddressField', {
    addressNameField: customerData.taxName,
    taxNumberField: customerData.taxNumber,
    state: state,
    city: city,
    zipcodeField: customerData.zipcode,
    streetField: customerData.street
  });

  // KTP Address
  await b2b.addAddress(page, cr, 'addAddressField', {
    addressNameField: customerData.idName,
    idNumberField: customerData.idNumber,
    state: state,
    city: city,
    zipcodeField: customerData.zipcode,
    streetField: customerData.street
  });

  // Delivery Address
  await b2b.addAddress(page, cr, 'addAddressField', {
    deliveryNameField: customerData.deliveryAddressName,
    picAddressField: customerData.addressPIC,
    state: state,
    city: city,
    zipcodeField: customerData.zipcode,
    streetField: customerData.street,
    mobileField: customerData.mobile
  });

  // Invoice Address
  await b2b.addAddress(page, cr, 'addInvoiceAddressField', {
    addressNameField: customerData.invoiceAddressName,
    state: state,
    city: city,
    zipcodeField: customerData.zipcode,
    streetField: customerData.street,
    mobileField: customerData.mobile,
    checkbox: true 
  });

  // Store Address
  await b2b.addAddress(page, cr, 'addStoreAddressField', {
    addressNameField: customerData.invoiceAddressName,
    storeCodeField: customerData.storeCode,
    state: state,
    city: city,
    streetField: customerData.street,
  });

  //Save Draft
  await b2b.clickButton(page, cr, 'saveDraftButton');
  await page.waitForTimeout(500);
});