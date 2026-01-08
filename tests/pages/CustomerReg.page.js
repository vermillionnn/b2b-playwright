export class CustomerRegPage {
  constructor(page) {
    this.page = page;
    
    this.selectors = {
      // Page 1 - Customer Information
      customerPhotoField: page.locator('img[src*="add-image-grey"]'),
      customerNameField: page.locator('div').filter({ hasText: /^Name\*$/ }).first().getByRole('textbox'),
      streetField: page.locator('div').filter({ hasText: /^Street\*$/ }).first().getByRole('textbox'),
      stateField: page.locator('div').filter({ hasText: /^State ID\*$/ }).first().getByRole('textbox'),
      cityField: page.locator('div').filter({ hasText: /^City ID\*$/ }).first().getByRole('textbox'),
      modal: page.getByRole('textbox', { name: 'Search something here...' }),
      zipcodeField: page.locator('div').filter({ hasText: /^ZIP Code\*$/ }).first().getByRole('textbox'),
      pkpField: page.locator('div').filter({ hasText: /^Taxable Entrepreneur\*$/ }).first().getByRole('textbox'),
      whtField: page.locator('div').filter({ hasText: /^WHT \(Corporate\/Personal\)\*$/ }).first().getByRole('textbox'),
      phoneField: page.locator('div').filter({ hasText: /^Phone$/ }).first().getByRole('textbox'),
      mobileField: page.locator('div').filter({ hasText: /^Mobile\*?$/ }).first().getByRole('textbox'),
      emailField: page.locator('div').filter({ hasText: /^Email$/ }).first().getByRole('textbox'),
      picField: page.locator('div').filter({ hasText: /^Person in Charge \(PIC\) Name$/ }).first().getByRole('textbox'),
      jobTitleField: page.locator('div').filter({ hasText: /^Job Title$/ }).first().getByRole('textbox'),
      
      // Page 2 - Sales Information
      salesTeamField: page.locator('div').filter({ hasText: /^Sales Team\*$/ }).first().getByRole('textbox'),
      marketTypeField: page.locator('div').filter({ hasText: /^Market Type\*$/ }).first().getByRole('textbox'),
      businessTypeField: page.locator('div').filter({ hasText: /^Business Type\*$/ }).first().getByRole('textbox'),
      accountField: page.locator('div').filter({ hasText: /^Account\*$/ }).first().getByRole('textbox'),
      salesPersonField: page.locator('div').filter({ hasText: /^Sales Person\*$/ }).first().getByRole('textbox'),
      beautyAdvisorField: page.locator('div').filter({ hasText: /^Beauty Advisor$/ }).first().getByRole('textbox'),
      bankNameField: page.locator('div').filter({ hasText: /^Bank Name\*?$/ }).first().getByRole('textbox'),
      branchField: page.locator('div').filter({ hasText: /^Branch\*?$/ }).first().getByRole('textbox'),
      accountNumberField: page.locator('div').filter({ hasText: /^Account Number\*?$/ }).first().getByRole('textbox'),
      accountNameField: page.locator('div').filter({ hasText: /^Account Name\*?$/ }).first().getByRole('textbox'),
      specialExpDateField: page.locator('div').filter({ hasText: /^Special Expirate Date\*$/ }).first().getByRole('textbox'),
      customerTypeField: page.locator('div').filter({ hasText: /^Customer Type\*$/ }).first().getByRole('textbox'),

      // Page 3 - Address Information
      addressNameField: page.locator('div').filter({ hasText: /^Name\*$/ }).first().getByRole('textbox'),
      taxNumberField: page.locator('div').filter({ hasText: /^Tax Identification Number \(NPWP\)\*$/ }).first().getByRole('textbox'),
      idNumberField: page.locator('div').filter({ hasText: /^Identification Number \(KTP\)\*$/ }).first().getByRole('textbox'),
      deliveryNameField: page.locator('div').filter({ hasText: /^Delivery Name\*$/ }).first().getByRole('textbox'),
      addInvoiceAddressField: page.locator('div').filter({ hasText: /^Invoice Address$/ }).locator('..').locator('div[tabindex="0"]'),
      picAddressField: page.locator('div').filter({ hasText: /^Person in Charge \(PIC\)\*$/ }).first().getByRole('textbox'),
      invoiceScheduleCheckbox: page.locator('div').filter({ hasText: /^Anytime$/ }).first(),
      storeCodeField: page.locator('div').filter({ hasText: /^Store Code\*$/ }).first().getByRole('textbox'),
      addStoreAddressField: page.locator('div').filter({ hasText: /^Store Address$/ }).locator('..').locator('div[tabindex="0"]'),
      addAddressField: page.getByText('+ Add Address').first(),

      // Navigation & Action Buttons
      nextButton: page.getByRole('button', { name: 'Next' }),
      previousButton: page.getByRole('button', { name: 'Previous' }),
      saveDraftButton: page.getByRole('button', { name: 'Save Draft' }),
      saveAddressButton: page.getByRole('button', { name: 'Save Address' }),
      submitButton: page.getByRole('button', { name: 'Submit' }),
      
      // Search & List
      searchBox: page.getByPlaceholder('Search...'),
    };
  }
}