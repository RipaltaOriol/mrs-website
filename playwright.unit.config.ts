import { defineConfig } from '@playwright/test'

// The unit specification runs in-process over fixtures: no server, no network,
// no browser. It is a separate project from the smoke specification, which
// needs a production build.
export default defineConfig({
  testDir: './tests/unit',
  fullyParallel: true,
  reporter: 'list',
})
