// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000,
    // Screenshot comparison tolerance — allows minor anti-aliasing differences
    toHaveScreenshot: { maxDiffPixelRatio: 0.02 },
  },
  fullyParallel: false,
  retries: 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
      testMatch: ['**/regression.spec.js', '**/visual.spec.js'],
    },
    {
      name: 'webkit-desktop',
      use: { ...devices['Desktop Safari'] },
      testMatch: ['**/regression.spec.js', '**/visual.spec.js'],
    },
    {
      name: 'chromium-mobile',
      use: { ...devices['Pixel 5'] },
      testMatch: ['**/regression.spec.js', '**/visual.spec.js'],
    },
    {
      name: 'webkit-mobile',
      use: { ...devices['iPhone 13'] },
      testMatch: ['**/regression.spec.js', '**/visual.spec.js'],
    },
  ],
  // No webServer here — start python3 -m http.server 8080 manually from Amayaa_site/
});
