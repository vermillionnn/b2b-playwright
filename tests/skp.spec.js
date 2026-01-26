// @ts-check
import { test, expect } from '@playwright/test';
import { join } from 'path';
import dotenv from 'dotenv';
import { skpInternalPage } from './pages/SkpInternal.page';
import loginData from './fixtures/loginData.json' assert { type: 'json' };
import skpData from './fixtures/skpData.json' assert { type: 'json' };
import * as b2b from '../helpers/helperFunctions';
import { getDate, getSequenceNumber, getEmailSequenceNumber } from '../helpers/helperFunctions';

dotenv.config({ path: 'env/UAT.env' });

// Test Data
const baseUrl = process.env.BASE_URL;
const attachmentFilePath = join(__dirname, './sample-file/sample-attachment.png');

// SKP Internal
test.describe('[Test Set] SKP Internal - Superadmin', () => {
  // Login before each test
  test.beforeEach(async ({ page }) => {
    await b2b.login(page, baseUrl, loginData.superadminUser.email, loginData.superadminUser.password);
  });
  // Test Case: Create SKP Internal GT - One Customer & Brand Manual - Save Draft
  test('[Test Case] Create SKP Internal GT - One Customer & Brand Manual - Save Draft', async ({ page }) => {
    const skpPage = new skpInternalPage(page);
    const skp = skpPage.selectors;
  
    const sequenceNum = await getSequenceNumber('skpInternal');
    const skpInternalNameSequence = 'AF-GT-SKP-INTERNAL-AUTO-' + getDate() + '-' + sequenceNum;
    console.log('SKP Name: ' + skpInternalNameSequence);
  
    //GoTo Add SKP Internal Menu
    await b2b.goToMenu(page, baseUrl, 'Promotion Agreement Form', 'Add SKP Internal');
    await page.waitForLoadState('networkidle');

    // Assert all fields are visible
    await expect(skp.skpNameField).toBeVisible();
    await expect(skp.descriptionField).toBeVisible();
    await expect(skp.coaField).toBeVisible();
    await expect(skp.skpTypeField).toBeVisible();
    await expect(skp.fromDateField).toBeVisible();
    await expect(skp.toDateField).toBeVisible();
    await expect(skp.isActiveField).toBeVisible();
    await expect(skp.totalEstimateBudgetField).toBeVisible();
    await expect(skp.addCustomerBrandButton).toBeVisible();
    await expect(skp.notesField).toBeVisible();
    // await expect(skp.attachmentButton).toBeVisible();
    await expect(skp.saveDraftButton).toBeVisible();
    await expect(skp.requestConfirmationButton).toBeVisible();

    // Fill SKP Name
    await b2b.fillField(page, skp, 'skpNameField', skpInternalNameSequence);

    // Fill Description
    await b2b.fillField(page, skp, 'descriptionField', skpData.GT.description);

    // Select COA
    await b2b.selectDropdown(page, skp, 'coaField', skpData.GT.coa.name);

    // Assert Tax ID Corporate and Personal are auto-filled and able to edit
    await expect(skp.taxIdCorporateField).toBeVisible();
    await expect(skp.TaxIdPersonalField).toBeVisible();

    // Select SKP Type
    await b2b.selectDropdown(page, skp, 'skpTypeField', skpData.GT.type);

    // Fill From and To Date
    await b2b.selectDate(page, skp, 'fromDateField', 0);
    await b2b.selectDate(page, skp, 'toDateField', 1);

    // Set Is Active
    await b2b.selectDropdown(page, skp, 'isActiveField', 'Active');

    // Fill Total Estimate Budget
    await b2b.fillField(page, skp, 'totalEstimateBudgetField', skpData.GT.totalEstimateBudget);

    // Add Customer Brand
    await skp.addCustomerBrandButton.click();
    await page.getByText('Add Manually', { exact: true }).click();

    // Assert Customer Brand Modal fields
    await expect(skp.customerBrandModal).toBeVisible();
    await expect(skp.customerField).toBeVisible();
    await expect(skp.brandField).toBeVisible();
    await expect(skp.budgetSampleField).toBeVisible();
    await expect(skp.saveButton).toBeVisible();
    await expect(skp.cancelButton).toBeVisible();

    await b2b.selectDropdown(page, skp, 'customerField', skpData.GT.customer.name);
    await b2b.selectDropdown(page, skp, 'brandField', skpData.GT.brand.name);
    await b2b.fillField(page, skp, 'budgetSampleField', skpData.GT.customer.budgetSample);

    await b2b.clickButton(page, skp, 'saveButton');
    await page.waitForLoadState('networkidle');
    // await expect(page.getByText(skpData.toastMsg.addCustomerBrand, { exact: true })).toBeVisible();

    // Edit and fill other fields
    await expect(skp.editButton).toBeVisible();
    await b2b.clickButton(page, skp, 'editButton');

    // Fill notes
    await expect(skp.notesField).toBeVisible();
    await b2b.fillField(page, skp, 'notesField', skpData.GT.notes);

    // Save Draft
    await b2b.clickButton(page, skp, 'saveButton2');
    await page.waitForLoadState('networkidle');
    
    // Upload attachment
    await skp.attachmentButton.scrollIntoViewIfNeeded();
    await expect(skp.attachmentButton).toBeVisible();
    await b2b.uploadAttachment(page, skp, 'attachmentButton', attachmentFilePath);  

    await page.waitForTimeout(500);
  });

  // Test Case: Create SKP Internal MT - One Customer & Brand Manual - Save Draft
  test('[Test Case] Create SKP Internal MT - One Customer & Brand Manual - Save Draft', async ({ page }) => {
    const skpPage = new skpInternalPage(page);
    const skp = skpPage.selectors;
  
    const sequenceNum = await getSequenceNumber('skpInternal');
    const skpInternalNameSequence = 'AF-MT-SKP-INTERNAL-AUTO-' + getDate() + '-' + sequenceNum;
    console.log('SKP Name: ' + skpInternalNameSequence);
  
    //GoTo Add SKP Internal Menu
    await b2b.goToMenu(page, baseUrl, 'Promotion Agreement Form', 'Add SKP Internal');
    await page.waitForLoadState('networkidle');

    // Assert all fields are visible
    await expect(skp.skpNameField).toBeVisible();
    await expect(skp.descriptionField).toBeVisible();
    await expect(skp.coaField).toBeVisible();
    await expect(skp.skpTypeField).toBeVisible();
    await expect(skp.fromDateField).toBeVisible();
    await expect(skp.toDateField).toBeVisible();
    await expect(skp.isActiveField).toBeVisible();
    await expect(skp.totalEstimateBudgetField).toBeVisible();
    await expect(skp.addCustomerBrandButton).toBeVisible();
    await expect(skp.notesField).toBeVisible();
    // await expect(skp.attachmentButton).toBeVisible();
    await expect(skp.saveDraftButton).toBeVisible();
    await expect(skp.requestConfirmationButton).toBeVisible();

    // Fill SKP Name
    await b2b.fillField(page, skp, 'skpNameField', skpInternalNameSequence);

    // Fill Description
    await b2b.fillField(page, skp, 'descriptionField', skpData.MT.description);

    // Select COA
    await b2b.selectDropdown(page, skp, 'coaField', skpData.MT.coa.name);

    // Assert Tax ID Corporate and Personal are auto-filled and able to edit
    await expect(skp.taxIdCorporateField).toBeVisible();
    await expect(skp.TaxIdPersonalField).toBeVisible();

    // Select SKP Type
    await b2b.selectDropdown(page, skp, 'skpTypeField', skpData.MT.type);

    // Fill From and To Date
    await b2b.selectDate(page, skp, 'fromDateField', 0);
    await b2b.selectDate(page, skp, 'toDateField', 1);

    // Set Is Active
    await b2b.selectDropdown(page, skp, 'isActiveField', 'Active');

    // Fill Total Estimate Budget
    await b2b.fillField(page, skp, 'totalEstimateBudgetField', skpData.MT.totalEstimateBudget);

    // Add Customer Brand
    await skp.addCustomerBrandButton.click();
    await page.getByText('Add Manually', { exact: true }).click();

    // Assert Customer Brand Modal fields
    await expect(skp.customerBrandModal).toBeVisible();
    await expect(skp.customerField).toBeVisible();
    await expect(skp.brandField).toBeVisible();
    await expect(skp.budgetSampleField).toBeVisible();
    await expect(skp.saveButton).toBeVisible();
    await expect(skp.cancelButton).toBeVisible();

    await b2b.selectDropdown(page, skp, 'customerField', skpData.MT.customer.name);
    await b2b.selectDropdown(page, skp, 'brandField', skpData.MT.brand.name);
    await b2b.fillField(page, skp, 'budgetSampleField', skpData.MT.customer.budgetSample);

    await b2b.clickButton(page, skp, 'saveButton');
    await page.waitForLoadState('networkidle');
    // await expect(page.getByText(skpData.toastMsg.addCustomerBrand, { exact: true })).toBeVisible();

    // Edit and fill other fields
    await expect(skp.editButton).toBeVisible();
    await b2b.clickButton(page, skp, 'editButton');

    // Fill notes
    await expect(skp.notesField).toBeVisible();
    await b2b.fillField(page, skp, 'notesField', skpData.MT.notes);

    // Save Draft
    await b2b.clickButton(page, skp, 'saveButton2');
    await page.waitForLoadState('networkidle');
    
    // Upload attachment
    await skp.attachmentButton.scrollIntoViewIfNeeded();
    await expect(skp.attachmentButton).toBeVisible();
    await b2b.uploadAttachment(page, skp, 'attachmentButton', attachmentFilePath);  

    await page.waitForTimeout(500);
  });

  // Test Case: Create SKP Internal SubDis GT - One Customer & Brand Manual - Save Draft
  test('[Test Case] Create SKP Internal SubDis GT - One Customer & Brand Manual - Save Draft', async ({ page }) => {
    const skpPage = new skpInternalPage(page);
    const skp = skpPage.selectors;
  
    const sequenceNum = await getSequenceNumber('skpInternal');
    const skpInternalNameSequence = 'AF-SUBDIS-GT-SKP-INTERNAL-AUTO-' + getDate() + '-' + sequenceNum;
    console.log('SKP Name: ' + skpInternalNameSequence);
  
    //GoTo Add SKP Internal Menu
    await b2b.goToMenu(page, baseUrl, 'Promotion Agreement Form', 'Add SKP Internal');
    await page.waitForLoadState('networkidle');

    // Assert all fields are visible
    await expect(skp.skpNameField).toBeVisible();
    await expect(skp.descriptionField).toBeVisible();
    await expect(skp.coaField).toBeVisible();
    await expect(skp.skpTypeField).toBeVisible();
    await expect(skp.fromDateField).toBeVisible();
    await expect(skp.toDateField).toBeVisible();
    await expect(skp.isActiveField).toBeVisible();
    await expect(skp.totalEstimateBudgetField).toBeVisible();
    await expect(skp.addCustomerBrandButton).toBeVisible();
    await expect(skp.notesField).toBeVisible();
    // await expect(skp.attachmentButton).toBeVisible();
    await expect(skp.saveDraftButton).toBeVisible();
    await expect(skp.requestConfirmationButton).toBeVisible();

    // Fill SKP Name
    await b2b.fillField(page, skp, 'skpNameField', skpInternalNameSequence);

    // Fill Description
    await b2b.fillField(page, skp, 'descriptionField', skpData.SubdisGT.description);

    // Select COA
    await b2b.selectDropdown(page, skp, 'coaField', skpData.SubdisGT.coa.name);

    // Assert Tax ID Corporate and Personal are auto-filled and able to edit
    await expect(skp.taxIdCorporateField).toBeVisible();
    await expect(skp.TaxIdPersonalField).toBeVisible();

    // Select SKP Type
    // await b2b.selectDropdown(page, skp, 'skpTypeField', skpData.SubdisGT.type);
    const subdisTypeField = page.getByText('Sub Distributor').nth(1)
    await expect(skp.skpTypeField).toBeVisible();
    await skp.skpTypeField.click({ force: true });
    await expect(skp.modal).toBeVisible({ timeout: 5000 });
    await skp.modal.fill(skpData.SubdisGT.type);
    await subdisTypeField.click();  

    // Fill From and To Date
    await b2b.selectDate(page, skp, 'fromDateField', 0);
    await b2b.selectDate(page, skp, 'toDateField', 1);

    // Set Is Active
    await b2b.selectDropdown(page, skp, 'isActiveField', 'Active');

    // Fill Total Estimate Budget
    await b2b.fillField(page, skp, 'totalEstimateBudgetField', skpData.SubdisGT.totalEstimateBudget);

    // Add Customer Brand
    await skp.addCustomerBrandButton.click();
    await page.getByText('Add Manually', { exact: true }).click();

    // Assert Customer Brand Modal fields
    await expect(skp.customerBrandModal).toBeVisible();
    await expect(skp.customerField).toBeVisible();
    await expect(skp.brandField).toBeVisible();
    await expect(skp.budgetSampleField).toBeVisible();
    await expect(skp.saveButton).toBeVisible();
    await expect(skp.cancelButton).toBeVisible();
    
    await b2b.selectDropdown(page, skp, 'customerField', skpData.SubdisGT.customer.name);
    await expect(skp.outletField).toBeVisible();
    // await page.waitForLoadState('networkidle');
    await b2b.selectDropdown(page, skp, 'outletField', skpData.SubdisGT.customer.outlet.name);
    await b2b.selectDropdown(page, skp, 'brandField', skpData.SubdisGT.brand.name);
    await b2b.fillField(page, skp, 'budgetSampleField', skpData.SubdisGT.customer.budgetSample);

    await b2b.clickButton(page, skp, 'saveButton');
    await page.waitForLoadState('networkidle');
    // await expect(page.getByText(skpData.toastMsg.addCustomerBrand, { exact: true })).toBeVisible();

    // Edit and fill other fields
    await expect(skp.editButton).toBeVisible();
    await b2b.clickButton(page, skp, 'editButton');

    // Fill notes
    await expect(skp.notesField).toBeVisible();
    await b2b.fillField(page, skp, 'notesField', skpData.SubdisGT.notes);

    // Save Draft
    await b2b.clickButton(page, skp, 'saveButton2');
    await page.waitForLoadState('networkidle');
    
    // Upload attachment
    await skp.attachmentButton.scrollIntoViewIfNeeded();
    await expect(skp.attachmentButton).toBeVisible();
    await b2b.uploadAttachment(page, skp, 'attachmentButton', attachmentFilePath);  

    await page.waitForTimeout(500);
  });

  // Test Case: Create SKP Internal SubDis MT- One Customer & Brand Manual - Save Draft
  test('[Test Case] Create SKP Internal SubDis MT - One Customer & Brand Manual - Save Draft', async ({ page }) => {
    const skpPage = new skpInternalPage(page);
    const skp = skpPage.selectors;
  
    const sequenceNum = await getSequenceNumber('skpInternal');
    const skpInternalNameSequence = 'AF-SUBDIS-MT-SKP-INTERNAL-AUTO-' + getDate() + '-' + sequenceNum;
    console.log('SKP Name: ' + skpInternalNameSequence);
  
    //GoTo Add SKP Internal Menu
    await b2b.goToMenu(page, baseUrl, 'Promotion Agreement Form', 'Add SKP Internal');
    await page.waitForLoadState('networkidle');

    // Assert all fields are visible
    await expect(skp.skpNameField).toBeVisible();
    await expect(skp.descriptionField).toBeVisible();
    await expect(skp.coaField).toBeVisible();
    await expect(skp.skpTypeField).toBeVisible();
    await expect(skp.fromDateField).toBeVisible();
    await expect(skp.toDateField).toBeVisible();
    await expect(skp.isActiveField).toBeVisible();
    await expect(skp.totalEstimateBudgetField).toBeVisible();
    await expect(skp.addCustomerBrandButton).toBeVisible();
    await expect(skp.notesField).toBeVisible();
    // await expect(skp.attachmentButton).toBeVisible();
    await expect(skp.saveDraftButton).toBeVisible();
    await expect(skp.requestConfirmationButton).toBeVisible();

    // Fill SKP Name
    await b2b.fillField(page, skp, 'skpNameField', skpInternalNameSequence);

    // Fill Description
    await b2b.fillField(page, skp, 'descriptionField', skpData.SubdisMT.description);

    // Select COA
    await b2b.selectDropdown(page, skp, 'coaField', skpData.SubdisMT.coa.name);

    // Assert Tax ID Corporate and Personal are auto-filled and able to edit
    await expect(skp.taxIdCorporateField).toBeVisible();
    await expect(skp.TaxIdPersonalField).toBeVisible();

    // Select SKP Type
    // await b2b.selectDropdown(page, skp, 'skpTypeField', skpData.SubdisGT.type);
    const subdisTypeField = page.getByText('Sub Distributor').nth(1)
    await expect(skp.skpTypeField).toBeVisible();
    await skp.skpTypeField.click({ force: true });
    await expect(skp.modal).toBeVisible({ timeout: 5000 });
    await skp.modal.fill(skpData.SubdisMT.type);
    await subdisTypeField.click();  

    // Fill From and To Date
    await b2b.selectDate(page, skp, 'fromDateField', 0);
    await b2b.selectDate(page, skp, 'toDateField', 1);

    // Set Is Active
    await b2b.selectDropdown(page, skp, 'isActiveField', 'Active');

    // Fill Total Estimate Budget
    await b2b.fillField(page, skp, 'totalEstimateBudgetField', skpData.SubdisMT.totalEstimateBudget);

    // Add Customer Brand
    await skp.addCustomerBrandButton.click();
    await page.getByText('Add Manually', { exact: true }).click();

    // Assert Customer Brand Modal fields
    await expect(skp.customerBrandModal).toBeVisible();
    await expect(skp.customerField).toBeVisible();
    await expect(skp.brandField).toBeVisible();
    await expect(skp.budgetSampleField).toBeVisible();
    await expect(skp.saveButton).toBeVisible();
    await expect(skp.cancelButton).toBeVisible();
    
    await b2b.selectDropdown(page, skp, 'customerField', skpData.SubdisMT.customer.name);
    await expect(skp.outletField).toBeVisible();
    // await page.waitForLoadState('networkidle');
    await b2b.selectDropdown(page, skp, 'outletField', skpData.SubdisMT.customer.outlet.name);
    await b2b.selectDropdown(page, skp, 'brandField', skpData.SubdisMT.brand.name);
    await b2b.fillField(page, skp, 'budgetSampleField', skpData.SubdisMT.customer.budgetSample);

    await b2b.clickButton(page, skp, 'saveButton');
    await page.waitForLoadState('networkidle');
    // await expect(page.getByText(skpData.toastMsg.addCustomerBrand, { exact: true })).toBeVisible();

    // Edit and fill other fields
    await expect(skp.editButton).toBeVisible();
    await b2b.clickButton(page, skp, 'editButton');

    // Fill notes
    await expect(skp.notesField).toBeVisible();
    await b2b.fillField(page, skp, 'notesField', skpData.SubdisMT.notes);

    // Save Draft
    await b2b.clickButton(page, skp, 'saveButton2');
    await page.waitForLoadState('networkidle');
    
    // Upload attachment
    await skp.attachmentButton.scrollIntoViewIfNeeded();
    await expect(skp.attachmentButton).toBeVisible();
    await b2b.uploadAttachment(page, skp, 'attachmentButton', attachmentFilePath);  

    await page.waitForTimeout(500);
  });
});


// // SKP External
// test.describe('[Test Set] SKP External MT - Superadmin', () => {
//   // Login before each test
//   test.beforeEach(async ({ page }) => {
//     await b2b.login(page, baseUrl, loginData.superadminUser.email, loginData.superadminUser.password);
//   });
// });