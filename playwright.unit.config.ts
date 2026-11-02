import { defineConfig } from '@playwright/test'

// Runs in-process over fixtures with no server, network or browser.
export default defineConfig({
  testDir: './tests/unit',
  fullyParallel: true,
  reporter: 'list',
})
