export class skpExternalPage {
  constructor(page) {
    this.page = page;
    
    // Form field selectors
    this.selectors = {
        // SKP Internal Form Fields
        skpReferenceField: page.getByPlaceholder('Select Skp Reference'),
        skpReferenceNameField: page.locator('div').filter({ hasText: /^SKP Reference Name\*$/ }).getByRole('textbox'),
        toDateField: page.locator('div').filter({ hasText: /^To Date$/ }).getByRole('textbox'),
        notesField: page.locator('div').filter({ hasText: /^Notes$/ }).getByRole('textbox'),
        
        // Buttons
        addCustomerBrandButton: page.getByRole('button', { name: '+ Add', exact: true }),
        attachmentButton: page.getByRole('button', { name: 'Upload Files', exact: true }),
        saveDraftButton: page.getByRole('button', { name: 'Save Draft', exact: true }),
        requestConfirmationButton: page.getByRole('button', { name: 'Request Confirmation', exact: true }),
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