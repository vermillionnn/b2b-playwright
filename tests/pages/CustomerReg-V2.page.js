// GROK's Approach - Traditional POM with Actions in Page Class
export class CustomerRegPage {
  constructor(page) {
    this.page = page;
    
    // Page 1 - Customer Information (Direct properties, no selectors object)
    this.customerPhotoField = page.locator('img[src*="add-image-grey"]');
    this.customerNameField = page.locator('div').filter({ hasText: /^Name\*$/ }).first().getByRole('textbox');
    this.streetField = page.locator('div').filter({ hasText: /^Street\*$/ }).first().getByRole('textbox');
    this.stateField = page.locator('div').filter({ hasText: /^State ID\*$/ }).first().getByRole('textbox');
    this.cityField = page.locator('div').filter({ hasText: /^City ID\*$/ }).first().getByRole('textbox');
    this.modal = page.getByRole('textbox', { name: 'Search something here...' });
    this.zipcodeField = page.locator('div').filter({ hasText: /^ZIP Code\*$/ }).first().getByRole('textbox');
    this.pkpField = page.locator('div').filter({ hasText: /^Taxable Entrepreneur\*$/ }).first().getByRole('textbox');
    this.whtField = page.locator('div').filter({ hasText: /^WHT \(Corporate\/Personal\)\*$/ }).first().getByRole('textbox');
    this.phoneField = page.locator('div').filter({ hasText: /^Phone$/ }).first().getByRole('textbox');
    this.mobileField = page.locator('div').filter({ hasText: /^Mobile\*?$/ }).first().getByRole('textbox');
    this.emailField = page.locator('div').filter({ hasText: /^Email$/ }).first().getByRole('textbox');
    this.picField = page.locator('div').filter({ hasText: /^Person in Charge \(PIC\) Name$/ }).first().getByRole('textbox');
    this.jobTitleField = page.locator('div').filter({ hasText: /^Job Title$/ }).first().getByRole('textbox');
    //Additional for VN
    this.districtAreaField = page.locator('div').filter({ hasText: /^District Area\*$/ }).first().getByRole('textbox');
    this.zipcodeVNField = page.locator('div').filter({ hasText: /^ZIP Code$/ }).first().getByRole('textbox');
    
    // Page 2 - Sales Information
    this.salesTeamField = page.locator('div').filter({ hasText: /^Sales Team\*$/ }).first().getByRole('textbox');
    this.marketTypeField = page.locator('div').filter({ hasText: /^Market Type\*$/ }).first().getByRole('textbox');
    this.businessTypeField = page.locator('div').filter({ hasText: /^Business Type\*$/ }).first().getByRole('textbox');
    this.accountField = page.locator('div').filter({ hasText: /^Account\*$/ }).first().getByRole('textbox');
    this.salesPersonField = page.locator('div').filter({ hasText: /^Sales Person\*$/ }).first().getByRole('textbox');
    this.beautyAdvisorField = page.locator('div').filter({ hasText: /^Beauty Advisor$/ }).first().getByRole('textbox');
    this.bankNameField = page.locator('div').filter({ hasText: /^Bank Name\*?$/ }).first().getByRole('textbox');
    this.branchField = page.locator('div').filter({ hasText: /^Branch\*?$/ }).first().getByRole('textbox');
    this.accountNumberField = page.locator('div').filter({ hasText: /^Account Number\*?$/ }).first().getByRole('textbox');
    this.accountNameField = page.locator('div').filter({ hasText: /^Account Name\*?$/ }).first().getByRole('textbox');
    this.specialExpDateField = page.locator('div').filter({ hasText: /^Special Expirate Date\*$/ }).first().getByRole('textbox');
    this.customerTypeField = page.locator('div').filter({ hasText: /^Customer Type\*$/ }).first().getByRole('textbox');

    // Page 3 - Address Information
    this.addressNameField = page.locator('div').filter({ hasText: /^Name\*$/ }).first().getByRole('textbox');
    this.taxNumberField = page.locator('div').filter({ hasText: /^Tax Identification Number \(NPWP\)\*$/ }).first().getByRole('textbox');
    this.idNumberField = page.locator('div').filter({ hasText: /^Identification Number \(KTP\)\*$/ }).first().getByRole('textbox');
    this.deliveryNameField = page.locator('div').filter({ hasText: /^Delivery Name\*$/ }).first().getByRole('textbox');
    this.addInvoiceAddressField = page.locator('div').filter({ hasText: /^Invoice Address$/ }).locator('..').locator('div[tabindex="0"]');
    this.picAddressField = page.locator('div').filter({ hasText: /^Person in Charge \(PIC\)\*$/ }).first().getByRole('textbox');
    this.invoiceScheduleCheckbox = page.locator('div').filter({ hasText: /^Anytime$/ }).first();
    this.storeCodeField = page.locator('div').filter({ hasText: /^Store Code\*$/ }).first().getByRole('textbox');
    this.addStoreAddressField = page.locator('div').filter({ hasText: /^Store Address$/ }).locator('..').locator('div[tabindex="0"]');
    this.addAddressField = page.getByText('+ Add Address').first();
    //Additional for VN
    this.taxNumberFieldVN = page.locator('div').filter({ hasText: /^Tax Identification Number\*$/ }).first().getByRole('textbox');
    this.idNumberFieldVN = page.locator('div').filter({ hasText: /^Identification Number\*$/ }).first().getByRole('textbox');

    // Navigation & Action Buttons
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.previousButton = page.getByRole('button', { name: 'Previous' });
    this.saveDraftButton = page.getByRole('button', { name: 'Save Draft' });
    this.saveAddressButton = page.getByRole('button', { name: 'Save Address' });
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    
    // Search & List
    this.searchBox = page.getByPlaceholder('Search...');
  }

  // Navigation Methods
  async navigate(baseUrl) {
    await this.page.goto(`${baseUrl}/customer/registration`);
    await this.page.waitForLoadState('networkidle');
  }

  async goToNextPage() {
    await this.nextButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async goToPreviousPage() {
    await this.previousButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  // Generic dropdown select method to reduce repetition
  async selectDropdown(field, value) {
    await field.click({ force: true });
    await this.page.waitForLoadState('networkidle');
    await this.modal.fill(value);
    await this.page.getByText(value, { exact: true }).click();
    await this.page.waitForLoadState('networkidle');
  }

  // Customer Info Methods
  async fillCustomerInfo(data) {
    if (data.name) await this.customerNameField.fill(data.name);
    if (data.street) await this.streetField.fill(data.street);
    if (data.zipcode) await this.zipcodeField.fill(data.zipcode);
    if (data.phone) await this.phoneField.fill(data.phone);
    if (data.mobile) await this.mobileField.fill(data.mobile);
    if (data.email) await this.emailField.fill(data.email);
    if (data.pic) await this.picField.fill(data.pic);
    if (data.jobTitle) await this.jobTitleField.fill(data.jobTitle);
  }

  async uploadCustomerPhoto(filePath) {
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.customerPhotoField.click({ timeout: 10000 });
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
  }

  // Sales Info Methods
  async fillSalesInfo(data) {
    if (data.beautyAdvisor) await this.beautyAdvisorField.fill(data.beautyAdvisor);
    if (data.bankName) await this.bankNameField.fill(data.bankName);
    if (data.branch) await this.branchField.fill(data.branch);
    if (data.accountNumber) await this.accountNumberField.fill(data.accountNumber);
    if (data.accountName) await this.accountNameField.fill(data.accountName);
    if (data.specialExpDate) await this.specialExpDateField.fill(data.specialExpDate);
  }

  // Address Methods
  async fillAddressInfo(data, type = 'default') {
    // Click add address first
    if (type === 'invoice') {
      await this.addInvoiceAddressField.click();
    } else if (type === 'store') {
      await this.addStoreAddressField.click();
    } else {
      await this.addAddressField.click();
    }
    await this.page.waitForLoadState('networkidle');

    // Fill common address fields
    if (data.name) await this.addressNameField.fill(data.name);
    if (data.taxNumber) await this.taxNumberField.fill(data.taxNumber);
    if (data.idNumber) await this.idNumberField.fill(data.idNumber);
    if (data.deliveryName) await this.deliveryNameField.fill(data.deliveryName);
    if (data.pic) await this.picAddressField.fill(data.pic);
    if (data.storeCode) await this.storeCodeField.fill(data.storeCode);
    
    // Fill location/contact fields
    if (data.state) await this.selectDropdown(this.stateField, data.state);
    if (data.city) await this.selectDropdown(this.cityField, data.city);
    if (data.zipcode) await this.zipcodeField.fill(data.zipcode);
    if (data.street) await this.streetField.fill(data.street);
    if (data.mobile) await this.mobileField.fill(data.mobile);

    // Optional invoice schedule checkbox
    if (data.checkbox) await this.invoiceScheduleCheckbox.click();

    // Additional VN field
    if (data.district) await this.selectDropdown(this.districtAreaField, data.district);
    if (data.taxNumberVN) await this.taxNumberFieldVN.fill(data.taxNumberVN);
    if (data.idNumberVN) await this.idNumberFieldVN.fill(data.idNumberVN);

    // Save address
    await this.saveAddressButton.scrollIntoViewIfNeeded();
    await this.saveAddressButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async addNewAddress() {
    await this.addAddressField.click();
    await this.page.waitForLoadState('networkidle');
  }

  async saveAddress() {
    await this.saveAddressButton.scrollIntoViewIfNeeded();
    await this.saveAddressButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  // Form Actions
  async saveDraft() {
    await this.saveDraftButton.scrollIntoViewIfNeeded();
    await this.saveDraftButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async submit() {
    await this.submitButton.scrollIntoViewIfNeeded();
    await this.submitButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  // Search & Verification
  async searchCustomer(searchTerm) {
    await this.searchBox.fill(searchTerm);
    await this.page.waitForLoadState('networkidle');
  }

  // High-level workflow method - Complete customer creation
  async createCustomer(customerData, salesData) {
    // Page 1 - Customer Info
    await this.uploadCustomerPhoto(customerData.photoPath);
    await this.fillCustomerInfo(customerData);
    await this.selectDropdown(this.stateField, customerData.state);
    await this.selectDropdown(this.cityField, customerData.city);
    await this.selectDropdown(this.whtField, customerData.wht);
    await this.goToNextPage();

    // Page 2 - Sales Info
    await this.selectDropdown(this.salesTeamField, salesData.salesTeam);
    await this.selectDropdown(this.marketTypeField, salesData.marketType);
    await this.selectDropdown(this.businessTypeField, salesData.businessType);
    await this.selectDropdown(this.accountField, salesData.account);
    await this.selectDropdown(this.salesPersonField, salesData.salesPerson);
    await this.fillSalesInfo(salesData);
    await this.selectDropdown(this.customerTypeField, salesData.customerType);
    await this.goToNextPage();

    // Return to allow test to add addresses
    // (Address logic varies too much to encapsulate here)
  }
}
