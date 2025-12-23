# B2B Playwright Automation

Automated testing suite for B2B applications using Playwright.

## Project Structure

- **tests/** - Test specifications (customer, sales order, etc.)
- **tests/pages/** - Page Object Model definitions
- **tests/fixtures/** - Test data in JSON format
- **helpers/** - Helper functions
- **env/** - Environment configuration files
- **playwright.config.js** - Playwright configuration
- **playwright-report/** - Test reports

## Installation

```bash
npm install
```

## Running Tests

### Run all tests
```bash
npx playwright test
```

### Run tests with UI
```bash
npx playwright test --ui
```

### Run specific test file
```bash
npx playwright test tests/customer.spec.js
```

### Run tests in headed mode
```bash
npx playwright test --headed
```

## Environment Configuration

Configure environment variables in `env/UAT.env` for your testing environment.

## Dependencies

- Playwright
- Node.js

## License

Sociolla
