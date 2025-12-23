export class SalesOrderPage {
  constructor(page) {
    this.page = page;
    
    // Form field selectors
    this.selectors = {
      customerField: page.getByPlaceholder('Select Customer'),
      modal: page.getByRole('textbox', { name: 'Search something here...' }),
      invoiceAddressField: page.getByRole('textbox', { name: 'Select Invoice Address' }),
      deliveryAddressField: page.getByRole('textbox', { name: 'Select Delivery Address' }),
      salesTeamField: page.getByPlaceholder('Select Sales Team'),
      salesPersonField: page.getByPlaceholder('Select Sales Person'),
      warehouseField: page.getByPlaceholder('Select Warehouse'),
      expirationDateField: page.locator('div').filter({ hasText: /^Expiration Date\*$/ }).getByRole('textbox'),
      pricelistField: page.getByPlaceholder('Select Pricelist'),
      customerPONumberField: page.locator('div').filter({ hasText: /^Customer PO Number\*$/ }).getByRole('textbox'),
      customerPODateField: page.locator('div').filter({ hasText: /^Customer PO Date\*$/ }).getByRole('textbox'),
      
      // Buttons
      attachmentButton: page.getByRole('button', { name: 'Add Attachment' }),
      addProductButton: page.getByRole('button', { name: 'Add Product' }),
      saveButton: page.getByRole('button', { name: 'Save', exact: true }),
      saveFormButton: page.getByRole('button', { name: 'SAVE', exact: true }),
      editButton: page.getByRole('button', { name: 'Edit', exact: true }),
      requestConfirmationButton: page.getByRole('button', { name: 'Request Confirmation', exact: true }),
      
      // Product fields
      productNameField: page.locator('div').filter({ hasText: /^Product Name \/ Brand\*$/ }).first().getByRole('textbox'),
      quantityField: page.locator('div').filter({ hasText: /^Quantity\*$/ }).first().getByRole('textbox'),
      
      // Signature fields
      salesmanSignatureField: page.getByText('ADD E-SIGNATURE').first(),
      customerSignatureField: page.getByText('ADD E-SIGNATURE').nth(1),
      signatureField: page.getByRole('img'),
      nameSignatureField: page.getByRole('textbox'),
      addSignatureButton: page.getByRole('button', { name: 'Add' }),
    };
  }

  // Helper method to get OK button by index
  getOkButton(index) {
    return this.page.getByText('OK').nth(index);
  }

  // Helper method to get success message by index
  getSalesOrderSubmittedMessage(index) {
    return this.page.getByText('Sales Order Submitted').nth(index);
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