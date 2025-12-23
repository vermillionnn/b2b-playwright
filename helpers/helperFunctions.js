import { expect } from '@playwright/test';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export const login = async (page, baseUrl, email, password) => {
    await page.goto(baseUrl);
    await page.getByTestId('RNE__Input__text-input').first().fill(email);
    await page.locator('input[type="password"]').fill(password);
    await page.getByRole('button', { name: 'LOGIN' }).click();
    await expect(page).toHaveURL('https://uat-b2b-apps.sociolabs.io/dashboard');
};

export const goToMenu = async (page, baseUrl, menu, subMenu) => {
    await expect(page.getByText(menu, { exact: true })).toBeVisible();
    await page.getByText(menu, { exact: true }).click();
    await page.getByRole('link', { name: subMenu, exact: true }).click();
    // await expect(page).toHaveURL(baseUrl + '/sales-order/form/page?id=&name=&titleScreen=&firstAdded=');
};

export const selectDropdown = async (page, selectors, fieldName, data) => {
  const field = selectors[fieldName];
  await expect(field).toBeVisible();
  await field.click({ force: true });
  await expect(selectors.modal).toBeVisible({ timeout: 5000 });
  await selectors.modal.fill(data);
  await page.getByText(data, { exact: true }).click();  
  // await expect(field).toHaveValue(data);
};

export const fillField = async (page, selectors, fieldName, data) => {
  const field = selectors[fieldName];
  await expect(field).toBeVisible();
  await field.fill(data);
  // await expect(field).toHaveValue(data);
};

export const drawSignature = async (page) => {
  await page.mouse.move(489, 284);
  await page.mouse.down();
  await page.mouse.move(714, 284);
  await page.mouse.up();
};

export const clickButton = async (page, selectors, buttonName) => {
  const button = selectors[buttonName];
  await expect(button).toBeVisible();
  await button.click({ force: true });
};

export const addAddress = async (page, selectors, addButtonSelector, fields) => {
  // Wait for and click the add button (handles both 'addAddressField' and 'addInvoiceAddressField')
  const addButton = selectors[addButtonSelector];
  await expect(addButton).toBeVisible();
  await addButton.click();

  // Fill fields dynamically
  for (const [fieldKey, value] of Object.entries(fields)) {
    if (fieldKey === 'state') {
      await selectDropdown(page, selectors, 'stateField', value); 
    } else if (fieldKey === 'city') {
      await selectDropdown(page, selectors, 'cityField', value);
    } else if (fieldKey === 'checkbox' && value) {
      await selectors.invoiceScheduleCheckbox.click();
    } else {
      await fillField(page, selectors, fieldKey, value);
    }
  }

  // Save the address
  await clickButton(page, selectors, 'saveAddressButton');
};

// Sequence file paths
const sequenceFilePath = join(__dirname, '../tests/fixtures/customerSequence.json');
const emailSequenceFilePath = join(__dirname, '../tests/fixtures/customerEmailSequence.json');

// Function to load sequence store from file
function loadSequenceStore() {
  try {
    const data = readFileSync(sequenceFilePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { lastDate: '', sequence: 0 };
  }
}

// Function to save sequence store to file
/** @param {Object} store - The sequence store object */
function saveSequenceStore(store) {
  writeFileSync(sequenceFilePath, JSON.stringify(store, null, 2));
}

// Function to load email sequence store from file
function loadEmailSequenceStore() {
  try {
    const data = readFileSync(emailSequenceFilePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { lastDate: '', sequence: 0 };
  }
}

// Function to save email sequence store to file
/** @param {Object} store - The email sequence store object */
function saveEmailSequenceStore(store) {
  writeFileSync(emailSequenceFilePath, JSON.stringify(store, null, 2));
}

// Function to get current date in ddmmyyyy format
export const getDate = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  return day + month + year;
};

// Function to get next sequence number. Resets to 1 if date has changed
export const getSequenceNumber = () => {
  let sequenceStore = loadSequenceStore();
  const currentDate = getDate();
  
  if (sequenceStore.lastDate !== currentDate) {
    sequenceStore.lastDate = currentDate;
    sequenceStore.sequence = 0;
  }
  
  sequenceStore.sequence++;
  saveSequenceStore(sequenceStore);
  return String(sequenceStore.sequence).padStart(4, '0');
};

// Function to get next email sequence number. Resets to 1 if date has changed
export const getEmailSequenceNumber = () => {
  let emailSequenceStore = loadEmailSequenceStore();
  const currentDate = getDate();
  
  if (emailSequenceStore.lastDate !== currentDate) {
    emailSequenceStore.lastDate = currentDate;
    emailSequenceStore.sequence = 0;
  }
  
  emailSequenceStore.sequence++;
  saveEmailSequenceStore(emailSequenceStore);
  return String(emailSequenceStore.sequence);
};