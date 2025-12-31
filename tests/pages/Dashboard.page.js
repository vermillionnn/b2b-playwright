export class DashboardPage {
  constructor(page) {
    this.page = page;
    
    this.selectors = {
        //Sections
        sideMenu: "",
        assignedCustomersSection: page.getByText('Assigned Customer'),
        plannedActivitySection: page.getByText('Planned Activity'),
        totalSalesOrderSection: page.getByText('Total Sales Order'),
        totalSalesInvoiceSection: page.getByText('Total Sales Invoice'),
        upcomingActivitiesSection: page.getByText('Upcoming Activities'),
        taskSection: page.getByText('Task'),
        numberOfVisitSection: page.getByText('Number of Visit'),
        totalSellInSection: page.getByText('Total Sell In'),
        totalSellOutSection: page.getByText('Total Sell Out'),
        
        // Buttons
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