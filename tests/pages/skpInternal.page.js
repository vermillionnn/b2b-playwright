export class skpInternalPage {
  constructor(page) {
    this.page = page;
    
    // Form field selectors
    this.selectors = {
        // SKP Internal Form Fields
        skpNameField: page.locator('div').filter({ hasText: /^SKP Name\*$/ }).getByRole('textbox'),
        descriptionField: page.locator('div').filter({ hasText: /^Description\*$/ }).getByRole('textbox'),
        coaField: page.getByRole('textbox', { name: 'Select COA' }),
        taxIdCorporateField: page.locator('div').filter({ hasText: /^Tax ID Corporate\*$/ }).getByRole('textbox'),
        TaxIdPersonalField: page.locator('div').filter({ hasText: /^Tax ID Personal\*$/ }).getByRole('textbox'),
        skpTypeField: page.getByPlaceholder('Select Type'),
        fromDateField: page.locator('div').filter({ hasText: /^From Date$/ }).getByRole('textbox'),
        toDateField: page.locator('div').filter({ hasText: /^To Date$/ }).getByRole('textbox'),
        isActiveField: page.locator('div').filter({ hasText: /^Is Active\*$/ }).getByRole('textbox'),
        totalEstimateBudgetField: page.locator('div').filter({ hasText: /^Total Estimate Budget\*$/ }).getByRole('textbox'),
        notesField: page.locator('div').filter({ hasText: /^Notes$/ }).getByRole('textbox'),
        
        // Buttons
        addCustomerBrandButton: page.getByRole('button', { name: '+ Add', exact: true }),
        attachmentButton: page.getByText('Upload Files').first(),
        saveDraftButton: page.getByRole('button', { name: 'Save Draft', exact: true }),
        requestConfirmationButton: page.getByRole('button', { name: 'Request Confirmation', exact: true }),
        saveButton: page.getByRole('button', { name: 'Save', exact: true }),
        saveButton2: page.getByRole('button', { name: 'SAVE', exact: true }),
        cancelButton: page.getByRole('button', { name: 'Cancel', exact: true }),
        editButton: page.getByRole('button', { name: 'Edit', exact: true }),

        //Modal, Popups, etc.
        modal: page.getByRole('textbox', { name: 'Search something here...' }),
        customerBrandModal: page.getByText('Add Customer And Brand'),
        customerField: page.locator('div').filter({ hasText: /^Customer\*$/ }).getByRole('textbox'),
        brandField: page.locator('div').filter({ hasText: /^Brand\*$/ }).getByRole('textbox'),
        budgetSampleField: page.locator('div').filter({ hasText: /^Budget Sample\*$/ }).getByRole('textbox'),
    };
  }

  // Helper method to get OK button by index
  getOkButton(index) {
    return this.page.getByText('OK').nth(index);
  }

  // Helper method to get text by exact match
  getTextByExact(text, exact = true) {
    return this.page.getByText(text, { exact });
  }

  // Helper method to get SELECT button
  getSelectButton() {
    return this.page.getByText('SELECT', { exact: true });
  }
}