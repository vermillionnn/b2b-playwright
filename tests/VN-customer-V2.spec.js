// @ts-check
import { test, expect } from '@playwright/test';
import { join } from 'path';
import dotenv from 'dotenv';
import { CustomerRegPage } from './pages/CustomerReg-V2.page';
import loginData from './fixtures/loginData.json' assert { type: 'json' };
import customerDataVN from './fixtures/customerDataVN.json' assert { type: 'json' };
import * as b2b from '../helpers/helperFunctions';
import { getDate, getSequenceNumber, getEmailSequenceNumber } from '../helpers/helperFunctions';

dotenv.config({ path: 'env/UAT.env' });

// Test Data
const baseUrl = process.env.BASE_URL_VN;

// Avoid Chrome location permission prompt by pre-granting geolocation
test.use({ permissions: ['geolocation'], geolocation: { latitude: -6.200000, longitude: 106.816666 } });

// Create Customer
test.describe('[Test Set] Customer Registration - Superadmin', () => {
  // Login before each test
  test.beforeEach(async ({ page }) => {
    await b2b.loginVN(page, baseUrl, loginData.superadminUser.email, loginData.superadminUser.password);
  });
  test('[Test Case] Create Customer GT - No Pinpoint - Save Draft', async ({ page }) => {
    const customerRegPage = new CustomerRegPage(page);

    // File path and name sequences
    const photoFilePath = join(__dirname, customerDataVN.GT.photoPath);
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
        responseCountry.url().includes('uat-b2b-ms-accounts.sociolabs.io/states/all?filter[country_id]=67f4abf52888626f98ef5c43&sort=%7B%22name%22:1%7D') &&
        responseCountry.status() === 200,
        { timeout: 25000 }
    );

    // Get the API response for country states and GET State ID
    const responseCountry = await responsePromiseCountry;
    const responseDataCountry = await responseCountry.json();
    const city = responseDataCountry.data[0].name;
    console.log('City: ' + city);

    // Listen to State API to get City
    const responsePromiseState = page.waitForResponse(responseState =>
        responseState.url().includes('uat-b2b-ms-accounts.sociolabs.io/cities/all?filter[state_id]=67f4bd61dd59f9b911fb4ec4&sort=%7B%22type%22:1,%22name%22:1%7D') &&
        responseState.status() === 200,
        { timeout: 25000 }
    );

    // Trigger state selection to get city data
    await customerRegPage.selectDropdown(customerRegPage.cityField, city);

    // Wait for district response
    const responseDistrict = await responsePromiseState;
    const responseDataDistrict = await responseDistrict.json();
    const district = responseDataDistrict.data[0].name;
    console.log('District: ' + district);

    // Upload photo
    await page.waitForTimeout(500);
    await expect(customerRegPage.customerPhotoField).toBeVisible({ timeout: 10000});
    await customerRegPage.uploadCustomerPhoto(photoFilePath);
    await expect(page.locator('img[src*="soc-uat-uploads.s3.amazonaws.com"]')).toBeVisible({ timeout: 5000});

    await customerRegPage.fillCustomerInfo({
      name: customerNameSequence,
      street: customerDataVN.GT.street,
      // zipcode: customerDataVN.GT.zipcode,
      phone: customerDataVN.GT.phone,
      mobile: customerDataVN.GT.mobile,
      email: customerEmailSequence
    });

    // Select city
    await customerRegPage.selectDropdown(customerRegPage.districtAreaField, district);
    // Select WHT
    await customerRegPage.selectDropdown(customerRegPage.whtField, customerDataVN.GT.wht);

    // Go to next page
    await customerRegPage.goToNextPage();

    // Page 2 - Sales Info

    // Select Sales Team
    await customerRegPage.selectDropdown(customerRegPage.salesTeamField, customerDataVN.GT.salesTeam);
    // Select Market Type
    await customerRegPage.selectDropdown(customerRegPage.marketTypeField, customerDataVN.GT.marketType);
    // Select Business Type
    await expect(customerRegPage.businessTypeField).toBeVisible();
    await customerRegPage.businessTypeField.click({ force: true });
    await expect(page.getByRole('textbox', { name: 'Search something here...' })).toBeVisible({ timeout: 5000 });
    await page.getByRole('textbox', { name: 'Search something here...' }).fill(customerDataVN.GT.businessType);
    await page.getByText(customerDataVN.GT.businessType + ' (GT)', { exact: true }).click();
    await expect(customerRegPage.businessTypeField).toHaveValue(customerDataVN.GT.businessType);

    // Select Account
    await customerRegPage.selectDropdown(customerRegPage.accountField, customerDataVN.GT.account);
    // Select Sales Person
    await customerRegPage.selectDropdown(customerRegPage.salesPersonField, customerDataVN.GT.salesPersonCode);
    // Fill other sales info fields
    await customerRegPage.fillSalesInfo({
      bankName: customerDataVN.GT.bankName,
      branch: customerDataVN.GT.branch,
      accountNumber: customerDataVN.GT.accountNumber,
      accountName: customerDataVN.GT.accountName,
      specialExpDate: customerDataVN.GT.specialExp
    });
    // Select Customer Type
    await customerRegPage.selectDropdown(customerRegPage.customerTypeField, customerDataVN.GT.customerType);
    // Go to next page
    await customerRegPage.goToNextPage();

    // Page 3 - Addresses
    // Tax Address
    await customerRegPage.fillAddressInfo({
      name: customerDataVN.GT.taxName,
      taxNumberVN: customerDataVN.GT.taxNumber,
      city: city,
      district: district,
      // zipcode: customerDataVN.GT.zipcode,
      street: customerDataVN.GT.street
    });

    // KTP Address
    await customerRegPage.fillAddressInfo({
      name: customerDataVN.GT.idName,
      idNumberVN: customerDataVN.GT.idNumber,
      city: city,
      district: district,
      // zipcode: customerDataVN.GT.zipcode,
      street: customerDataVN.GT.street
    });

    // Delivery Address
    await customerRegPage.fillAddressInfo({
      deliveryName: customerDataVN.GT.deliveryAddressName,
      pic: customerDataVN.GT.addressPIC,
      city: city,
      district: district,
      // zipcode: customerDataVN.GT.zipcode,
      street: customerDataVN.GT.street,
      mobile: customerDataVN.GT.mobile
    });

    // Invoice Address
    await customerRegPage.fillAddressInfo({
      name: customerDataVN.GT.invoiceAddressName,
      city: city,
      district: district,
      // zipcode: customerDataVN.GT.zipcode,
      street: customerDataVN.GT.street,
      mobile: customerDataVN.GT.mobile,
      // checkbox: true
    }, 'invoice');

    // Store Address
    await customerRegPage.fillAddressInfo({
      name: customerDataVN.GT.invoiceAddressName,
      storeCode: customerDataVN.GT.storeCode,
      city: city,
      district: district,
      street: customerDataVN.GT.street,
    }, 'store');

    await customerRegPage.saveDraft();
    await page.waitForTimeout(500);
    // const cr = customerRegPage; // For compatibility with b2b.addAddress helper
    
    // await b2b.addAddress(page, cr, 'addAddressField', {
    //   addressNameField: customerDataVN.GT.taxName,
    //   taxNumberVNField: customerDataVN.GT.taxNumberVN,
    //   state: state,
    //   city: city,
    //   zipcodeField: customerDataVN.GT.zipcode,
    //   streetField: customerDataVN.GT.street
    // });

    // await b2b.addAddress(page, cr, 'addAddressField', {
    //   addressNameField: customerDataVN.GT.idName,
    //   idNumberVNField: customerDataVN.GT.idNumber,
    //   state: state,
    //   city: city,
    //   zipcodeField: customerDataVN.GT.zipcode,
    //   streetField: customerDataVN.GT.street
    // });

    // await b2b.addAddress(page, cr, 'addAddressField', {
    //   deliveryNameField: customerDataVN.GT.deliveryAddressName,
    //   picAddressField: customerDataVN.GT.addressPIC,
    //   state: state,
    //   city: city,
    //   zipcodeField: customerDataVN.GT.zipcode,
    //   streetField: customerDataVN.GT.street,
    //   mobileField: customerDataVN.GT.mobile
    // });

    // await b2b.addAddress(page, cr, 'addInvoiceAddressField', {
    //   addressNameField: customerDataVN.GT.invoiceAddressName,
    //   state: state,
    //   city: city,
    //   zipcodeField: customerDataVN.GT.zipcode,
    //   streetField: customerDataVN.GT.street,
    //   mobileField: customerDataVN.GT.mobile,
    //   checkbox: true 
    // });

    // await b2b.addAddress(page, cr, 'addStoreAddressField', {
    //   addressNameField: customerDataVN.GT.invoiceAddressName,
    //   storeCodeField: customerDataVN.GT.storeCode,
    //   state: state,
    //   city: city,
    //   streetField: customerDataVN.GT.street,
    // });

    // // Save Draft
    // await customerRegPage.saveDraft();
  });
});
