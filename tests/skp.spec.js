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
    const skpInternalNameSequence = 'AF-GT-SKP-' + getDate() + '-' + sequenceNum;
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
    const skpInternalNameSequence = 'AF-MT-SKP-' + getDate() + '-' + sequenceNum;
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
    const skpInternalNameSequence = 'AF-SUB-GT-SKP-' + getDate() + '-' + sequenceNum;
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
    const skpInternalNameSequence = 'AF-SUB-MT-SKP-' + getDate() + '-' + sequenceNum;
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

  // Test Case: Create SKP Internal GT - Multiple Customer & Brand Manual - Full Flow Approved
  test('[Test Case] Create SKP Internal GT - Multiple Customer & Brand Manual - Full Flow Approved', async ({ page }) => {
    const skpPage = new skpInternalPage(page);
    const skp = skpPage.selectors;
    const customerBrandFilePath = join(__dirname, './sample-file/GT-Import-Customer-Brand-SKP-Internal.csv')
  
    const sequenceNum = await getSequenceNumber('skpInternal');
    const skpInternalNameSequence = 'AF-GT-SKP-' + getDate() + '-' + sequenceNum;
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
    await page.getByText('Import CSV', { exact: true }).click();
    await expect(skp.importModal).toBeVisible();
    await expect(skp.uploadFileButton).toBeVisible();
    await b2b.uploadAttachment(page, skp, 'uploadFileButton', customerBrandFilePath);
    await expect(skp.proceedButton).toBeVisible();
    await skp.proceedButton.click();
    await expect(skp.uploadSuccessPopUp).toBeVisible();
    await expect(skp.OkButton).toBeVisible();
    await skp.OkButton.click();

    // await b2b.clickButton(page, skp, 'editButton');
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

    await skp.requestConfirmationButton.scrollIntoViewIfNeeded();
    await expect(skp.requestConfirmationButton).toBeVisible();
    await skp.requestConfirmationButton.click();
    await page.waitForLoadState('networkidle');
    await expect(skp.submittedPopUp).toBeVisible();
    await expect(skp.OkButton).toBeVisible();
    await skp.OkButton.click();

    // Logout
    await b2b.logout(page, loginData.superadminUser.name);

    // Relogin
    await b2b.login(page, baseUrl, loginData.approverUser.email, loginData.approverUser.password);
    await b2b.goToMenu(page, baseUrl, 'Promotion Agreement Form', 'SKP Internal');
    // await page.waitForLoadState('networkidle');
    // await page.waitForTimeout(1000);
    // await page.reload();
    // await page.waitForTimeout(5000);

    // Search for the SKP by SKP Name
    // await b2b.search(page, skp, skpInternalNameSequence);
    // await page.waitForLoadState('networkidle');

    // Open the SKP
    await page.getByText(skpInternalNameSequence, { exact: true }).first().click();
    await page.waitForLoadState('networkidle');

    // Approve the SKP
    await expect(skp.approveButton).toBeVisible();
    await skp.approveButton.click();
    await expect(skp.confirmedPopUp).toBeVisible();
    await expect(skp.OkButton).toBeVisible();
    await skp.OkButton.click();

    await page.waitForTimeout(500);
  });

  // Test Case: Create SKP Internal MT - Multiple Customer & Brand Manual - Full Flow Approved
  test('[Test Case] Create SKP Internal MT - Multiple Customer & Brand Manual - Full Flow Approved', async ({ page }) => {
    const skpPage = new skpInternalPage(page);
    const skp = skpPage.selectors;
    const customerBrandFilePath = join(__dirname, './sample-file/MT-Import-Customer-Brand-SKP-Internal.csv')
  
    const sequenceNum = await getSequenceNumber('skpInternal');
    const skpInternalNameSequence = 'AF-MT-SKP-' + getDate() + '-' + sequenceNum;
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
    await page.getByText('Import CSV', { exact: true }).click();
    await expect(skp.importModal).toBeVisible();
    await expect(skp.uploadFileButton).toBeVisible();
    await b2b.uploadAttachment(page, skp, 'uploadFileButton', customerBrandFilePath);
    await expect(skp.proceedButton).toBeVisible();
    await skp.proceedButton.click();
    await expect(skp.uploadSuccessPopUp).toBeVisible();
    await expect(skp.OkButton).toBeVisible();
    await skp.OkButton.click();

    // await b2b.clickButton(page, skp, 'editButton');
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

    await skp.requestConfirmationButton.scrollIntoViewIfNeeded();
    await expect(skp.requestConfirmationButton).toBeVisible();
    await skp.requestConfirmationButton.click();
    await page.waitForLoadState('networkidle');
    await expect(skp.submittedPopUp).toBeVisible();
    await expect(skp.OkButton).toBeVisible();
    await skp.OkButton.click();

    // Logout
    await b2b.logout(page, loginData.superadminUser.name);

    // Relogin
    await b2b.login(page, baseUrl, loginData.approverUser.email, loginData.approverUser.password);
    await b2b.goToMenu(page, baseUrl, 'Promotion Agreement Form', 'SKP Internal');
    await page.waitForLoadState('networkidle');
    // await page.waitForTimeout(1000);
    // await page.reload();
    // await page.waitForTimeout(5000);

    // Search for the SKP by SKP Name
    // await b2b.search(page, skp, skpInternalNameSequence);
    // await page.waitForTimeout(5000);
    // await page.waitForLoadState('networkidle');

    // Open the SKP
    await expect(page.getByText(skpInternalNameSequence)).toBeVisible();
    await page.getByText(skpInternalNameSequence, { exact: true }).first().click();
    await page.waitForLoadState('networkidle');

    // Approve the SKP
    await expect(skp.approveButton).toBeVisible();
    await skp.approveButton.click();
    await expect(skp.confirmedPopUp).toBeVisible();
    await expect(skp.OkButton).toBeVisible();
    await skp.OkButton.click();

    await page.waitForTimeout(500);
  });

  // Test Case: Create SKP Internal GT - Multiple Customer & Brand Manual - Full Flow Rejected
  test('[Test Case] Create SKP Internal GT - Multiple Customer & Brand Manual - Full Flow Rejected', async ({ page }) => {
    const skpPage = new skpInternalPage(page);
    const skp = skpPage.selectors;
    const customerBrandFilePath = join(__dirname, './sample-file/GT-Import-Customer-Brand-SKP-Internal.csv')
  
    const sequenceNum = await getSequenceNumber('skpInternal');
    const skpInternalNameSequence = 'AF-GT-SKP-' + getDate() + '-' + sequenceNum;
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
    await page.getByText('Import CSV', { exact: true }).click();
    await expect(skp.importModal).toBeVisible();
    await expect(skp.uploadFileButton).toBeVisible();
    await b2b.uploadAttachment(page, skp, 'uploadFileButton', customerBrandFilePath);
    await expect(skp.proceedButton).toBeVisible();
    await skp.proceedButton.click();
    await expect(skp.uploadSuccessPopUp).toBeVisible();
    await expect(skp.OkButton).toBeVisible();
    await skp.OkButton.click();

    // await b2b.clickButton(page, skp, 'editButton');
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

    await skp.requestConfirmationButton.scrollIntoViewIfNeeded();
    await expect(skp.requestConfirmationButton).toBeVisible();
    await skp.requestConfirmationButton.click();
    await page.waitForLoadState('networkidle');
    await expect(skp.submittedPopUp).toBeVisible();
    await expect(skp.OkButton).toBeVisible();
    await skp.OkButton.click();

    // Logout
    await b2b.logout(page, loginData.superadminUser.name);

    // Relogin
    await b2b.login(page, baseUrl, loginData.approverUser.email, loginData.approverUser.password);
    await b2b.goToMenu(page, baseUrl, 'Promotion Agreement Form', 'SKP Internal');
    // await page.waitForLoadState('networkidle');
    // await page.waitForTimeout(1000);
    // await page.reload();
    // await page.waitForTimeout(5000);

    // Search for the SKP by SKP Name
    // await b2b.search(page, skp, skpInternalNameSequence);
    // await page.waitForLoadState('networkidle');

    // Open the SKP
    await page.getByText(skpInternalNameSequence, { exact: true }).first().click();
    await page.waitForLoadState('networkidle');

    // Reject the SKP
    await expect(skp.rejectButton).toBeVisible();
    await skp.rejectButton.click();
    await expect(skp.rejectedPopUp).toBeVisible();
    await expect(skp.OkButton).toBeVisible();
    await skp.OkButton.click();

    await page.waitForTimeout(500);
  });

  // Test Case: Create SKP Internal MT - Multiple Customer & Brand Manual - Full Flow Rejected
  test('[Test Case] Create SKP Internal MT - Multiple Customer & Brand Manual - Full Flow Rejected', async ({ page }) => {
    const skpPage = new skpInternalPage(page);
    const skp = skpPage.selectors;
    const customerBrandFilePath = join(__dirname, './sample-file/MT-Import-Customer-Brand-SKP-Internal.csv')
  
    const sequenceNum = await getSequenceNumber('skpInternal');
    const skpInternalNameSequence = 'AF-MT-SKP-' + getDate() + '-' + sequenceNum;
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
    await page.getByText('Import CSV', { exact: true }).click();
    await expect(skp.importModal).toBeVisible();
    await expect(skp.uploadFileButton).toBeVisible();
    await b2b.uploadAttachment(page, skp, 'uploadFileButton', customerBrandFilePath);
    await expect(skp.proceedButton).toBeVisible();
    await skp.proceedButton.click();
    await expect(skp.uploadSuccessPopUp).toBeVisible();
    await expect(skp.OkButton).toBeVisible();
    await skp.OkButton.click();

    // await b2b.clickButton(page, skp, 'editButton');
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

    await skp.requestConfirmationButton.scrollIntoViewIfNeeded();
    await expect(skp.requestConfirmationButton).toBeVisible();
    await skp.requestConfirmationButton.click();
    await page.waitForLoadState('networkidle');
    await expect(skp.submittedPopUp).toBeVisible();
    await expect(skp.OkButton).toBeVisible();
    await skp.OkButton.click();

    // Logout
    await b2b.logout(page, loginData.superadminUser.name);

    // Relogin
    await b2b.login(page, baseUrl, loginData.approverUser.email, loginData.approverUser.password);
    await b2b.goToMenu(page, baseUrl, 'Promotion Agreement Form', 'SKP Internal');
    // await page.waitForLoadState('networkidle');
    // await page.waitForTimeout(1000);
    // await page.reload();
    // await page.waitForTimeout(5000);

    // Search for the SKP by SKP Name
    // await b2b.search(page, skp, skpInternalNameSequence);
    // await page.waitForLoadState('networkidle');

    // Open the SKP
    await page.getByText(skpInternalNameSequence, { exact: true }).first().click();
    await page.waitForLoadState('networkidle');

    // Reject the SKP
    await expect(skp.rejectButton).toBeVisible();
    await skp.rejectButton.click();
    await expect(skp.rejectedPopUp).toBeVisible();
    await expect(skp.OkButton).toBeVisible();
    await skp.OkButton.click();

    await page.waitForTimeout(500);
  });

  // Test Case: Create SKP Internal Subdis GT - Multiple Customer & Brand Manual - Full Flow Approved
  test('[Test Case] Create SKP Internal Subdis GT - Multiple Customer & Brand Manual - Full Flow Approved', async ({ page }) => {
    const skpPage = new skpInternalPage(page);
    const skp = skpPage.selectors;
    const customerBrandFilePath = join(__dirname, './sample-file/SUBDIS-GT-Import-Customer-Brand-SKP-Internal.csv')
  
    const sequenceNum = await getSequenceNumber('skpInternal');
    const skpInternalNameSequence = 'AF-SUB-GT-SKP-' + getDate() + '-' + sequenceNum;
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
    await page.getByText('Import CSV', { exact: true }).click();
    await expect(skp.importModal).toBeVisible();
    await expect(skp.uploadFileButton).toBeVisible();
    await b2b.uploadAttachment(page, skp, 'uploadFileButton', customerBrandFilePath);
    await expect(skp.proceedButton).toBeVisible();
    await skp.proceedButton.click();
    await expect(skp.uploadSuccessPopUp).toBeVisible();
    await expect(skp.OkButton).toBeVisible();
    await skp.OkButton.click();

    // await b2b.clickButton(page, skp, 'editButton');
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

    await skp.requestConfirmationButton.scrollIntoViewIfNeeded();
    await expect(skp.requestConfirmationButton).toBeVisible();
    await skp.requestConfirmationButton.click();
    await page.waitForLoadState('networkidle');
    await expect(skp.submittedPopUp).toBeVisible();
    await expect(skp.OkButton).toBeVisible();
    await skp.OkButton.click();

    // Logout
    await b2b.logout(page, loginData.superadminUser.name);

    // Relogin
    await b2b.login(page, baseUrl, loginData.approverUser.email, loginData.approverUser.password);
    await b2b.goToMenu(page, baseUrl, 'Promotion Agreement Form', 'SKP Internal');
    await page.waitForLoadState('networkidle');
    // await page.waitForTimeout(1000);
    // await page.reload();
    // await page.waitForTimeout(5000);

    // Search for the SKP by SKP Name
    // await b2b.search(page, skp, skpInternalNameSequence);
    // await page.waitForTimeout(5000);
    // await page.waitForLoadState('networkidle');

    // Open the SKP
    await expect(page.getByText(skpInternalNameSequence)).toBeVisible();
    await page.getByText(skpInternalNameSequence, { exact: true }).first().click();
    await page.waitForLoadState('networkidle');

    // Approve the SKP
    await expect(skp.approveButton).toBeVisible();
    await skp.approveButton.click();
    await expect(skp.confirmedPopUp).toBeVisible();
    await expect(skp.OkButton).toBeVisible();
    await skp.OkButton.click();

    await page.waitForTimeout(500);
  });

  // Test Case: Create SKP Internal Subdis MT - Multiple Customer & Brand Manual - Full Flow Approved
  test('[Test Case] Create SKP Internal Subdis MT - Multiple Customer & Brand Manual - Full Flow Approved', async ({ page }) => {
    const skpPage = new skpInternalPage(page);
    const skp = skpPage.selectors;
    const customerBrandFilePath = join(__dirname, './sample-file/SUBDIS-MT-Import-Customer-Brand-SKP-Internal.csv')
  
    const sequenceNum = await getSequenceNumber('skpInternal');
    const skpInternalNameSequence = 'AF-SUB-MT-SKP-' + getDate() + '-' + sequenceNum;
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
    // await b2b.selectDropdown(page, skp, 'skpTypeField', skpData.SubdisMT.type);
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
    await page.getByText('Import CSV', { exact: true }).click();
    await expect(skp.importModal).toBeVisible();
    await expect(skp.uploadFileButton).toBeVisible();
    await b2b.uploadAttachment(page, skp, 'uploadFileButton', customerBrandFilePath);
    await expect(skp.proceedButton).toBeVisible();
    await skp.proceedButton.click();
    await expect(skp.uploadSuccessPopUp).toBeVisible();
    await expect(skp.OkButton).toBeVisible();
    await skp.OkButton.click();

    // await b2b.clickButton(page, skp, 'editButton');
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

    await skp.requestConfirmationButton.scrollIntoViewIfNeeded();
    await expect(skp.requestConfirmationButton).toBeVisible();
    await skp.requestConfirmationButton.click();
    await page.waitForLoadState('networkidle');
    await expect(skp.submittedPopUp).toBeVisible();
    await expect(skp.OkButton).toBeVisible();
    await skp.OkButton.click();

    // Logout
    await b2b.logout(page, loginData.superadminUser.name);

    // Relogin
    await b2b.login(page, baseUrl, loginData.approverUser.email, loginData.approverUser.password);
    await b2b.goToMenu(page, baseUrl, 'Promotion Agreement Form', 'SKP Internal');
    await page.waitForLoadState('networkidle');
    // await page.waitForTimeout(1000);
    // await page.reload();
    // await page.waitForTimeout(5000);

    // Search for the SKP by SKP Name
    // await b2b.search(page, skp, skpInternalNameSequence);
    // await page.waitForTimeout(5000);
    // await page.waitForLoadState('networkidle');

    // Open the SKP
    await expect(page.getByText(skpInternalNameSequence)).toBeVisible();
    await page.getByText(skpInternalNameSequence, { exact: true }).first().click();
    await page.waitForLoadState('networkidle');

    // Approve the SKP
    await expect(skp.approveButton).toBeVisible();
    await skp.approveButton.click();
    await expect(skp.confirmedPopUp).toBeVisible();
    await expect(skp.OkButton).toBeVisible();
    await skp.OkButton.click();

    await page.waitForTimeout(500);
  });

  // Test Case: Create SKP Internal Subdis GT - Multiple Customer & Brand Manual - Full Flow Rejected
  test('[Test Case] Create SKP Internal Subdis GT - Multiple Customer & Brand Manual - Full Flow Rejected', async ({ page }) => {
    const skpPage = new skpInternalPage(page);
    const skp = skpPage.selectors;
    const customerBrandFilePath = join(__dirname, './sample-file/SUBDIS-GT-Import-Customer-Brand-SKP-Internal.csv')
  
    const sequenceNum = await getSequenceNumber('skpInternal');
    const skpInternalNameSequence = 'AF-SUB-GT-SKP-' + getDate() + '-' + sequenceNum;
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
    await page.getByText('Import CSV', { exact: true }).click();
    await expect(skp.importModal).toBeVisible();
    await expect(skp.uploadFileButton).toBeVisible();
    await b2b.uploadAttachment(page, skp, 'uploadFileButton', customerBrandFilePath);
    await expect(skp.proceedButton).toBeVisible();
    await skp.proceedButton.click();
    await expect(skp.uploadSuccessPopUp).toBeVisible();
    await expect(skp.OkButton).toBeVisible();
    await skp.OkButton.click();

    // await b2b.clickButton(page, skp, 'editButton');
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

    await skp.requestConfirmationButton.scrollIntoViewIfNeeded();
    await expect(skp.requestConfirmationButton).toBeVisible();
    await skp.requestConfirmationButton.click();
    await page.waitForLoadState('networkidle');
    await expect(skp.submittedPopUp).toBeVisible();
    await expect(skp.OkButton).toBeVisible();
    await skp.OkButton.click();

    // Logout
    await b2b.logout(page, loginData.superadminUser.name);

    // Relogin
    await b2b.login(page, baseUrl, loginData.approverUser.email, loginData.approverUser.password);
    await b2b.goToMenu(page, baseUrl, 'Promotion Agreement Form', 'SKP Internal');
    await page.waitForLoadState('networkidle');
    // await page.waitForTimeout(1000);
    // await page.reload();
    // await page.waitForTimeout(5000);

    // Search for the SKP by SKP Name
    // await b2b.search(page, skp, skpInternalNameSequence);
    // await page.waitForTimeout(5000);
    // await page.waitForLoadState('networkidle');

    // Open the SKP
    await expect(page.getByText(skpInternalNameSequence)).toBeVisible();
    await page.getByText(skpInternalNameSequence, { exact: true }).first().click();
    await page.waitForLoadState('networkidle');

    // Rejected the SKP
    await expect(skp.rejectButton).toBeVisible();
    await skp.rejectButton.click();
    await expect(skp.rejectedPopUp).toBeVisible();
    await expect(skp.OkButton).toBeVisible();
    await skp.OkButton.click();

    await page.waitForTimeout(500);
  });

   // Test Case: Create SKP Internal Subdis MT - Multiple Customer & Brand Manual - Full Flow Rejected
  test('[Test Case] Create SKP Internal Subdis MT - Multiple Customer & Brand Manual - Full Flow Rejected', async ({ page }) => {
    const skpPage = new skpInternalPage(page);
    const skp = skpPage.selectors;
    const customerBrandFilePath = join(__dirname, './sample-file/SUBDIS-MT-Import-Customer-Brand-SKP-Internal.csv')
  
    const sequenceNum = await getSequenceNumber('skpInternal');
    const skpInternalNameSequence = 'AF-SUB-MT-SKP-' + getDate() + '-' + sequenceNum;
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
    // await b2b.selectDropdown(page, skp, 'skpTypeField', skpData.SubdisMT.type);
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
    await page.getByText('Import CSV', { exact: true }).click();
    await expect(skp.importModal).toBeVisible();
    await expect(skp.uploadFileButton).toBeVisible();
    await b2b.uploadAttachment(page, skp, 'uploadFileButton', customerBrandFilePath);
    await expect(skp.proceedButton).toBeVisible();
    await skp.proceedButton.click();
    await expect(skp.uploadSuccessPopUp).toBeVisible();
    await expect(skp.OkButton).toBeVisible();
    await skp.OkButton.click();

    // await b2b.clickButton(page, skp, 'editButton');
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

    await skp.requestConfirmationButton.scrollIntoViewIfNeeded();
    await expect(skp.requestConfirmationButton).toBeVisible();
    await skp.requestConfirmationButton.click();
    await page.waitForLoadState('networkidle');
    await expect(skp.submittedPopUp).toBeVisible();
    await expect(skp.OkButton).toBeVisible();
    await skp.OkButton.click();

    // Logout
    await b2b.logout(page, loginData.superadminUser.name);

    // Relogin
    await b2b.login(page, baseUrl, loginData.approverUser.email, loginData.approverUser.password);
    await b2b.goToMenu(page, baseUrl, 'Promotion Agreement Form', 'SKP Internal');
    await page.waitForLoadState('networkidle');
    // await page.waitForTimeout(1000);
    // await page.reload();
    // await page.waitForTimeout(5000);

    // Search for the SKP by SKP Name
    // await b2b.search(page, skp, skpInternalNameSequence);
    // await page.waitForTimeout(5000);
    // await page.waitForLoadState('networkidle');

    // Open the SKP
    await expect(page.getByText(skpInternalNameSequence)).toBeVisible();
    await page.getByText(skpInternalNameSequence, { exact: true }).first().click();
    await page.waitForLoadState('networkidle');

    // Rejected the SKP
    await expect(skp.rejectButton).toBeVisible();
    await skp.rejectButton.click();
    await expect(skp.rejectedPopUp).toBeVisible();
    await expect(skp.OkButton).toBeVisible();
    await skp.OkButton.click();

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