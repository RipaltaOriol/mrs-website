import { defineConfig } from '@playwright/test'

const PORT = 3100

// The smoke specification runs over HTTP against a production build, so it
// needs no browser binaries: every assertion is about what the server sends.
export default defineConfig({
  testDir: './tests/smoke',
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: `http://localhost:${PORT}` },
  webServer: {
    command: `npm run build && npm run start -- --port ${PORT}`,
    url: `http://localhost:${PORT}/policy`,
    timeout: 300_000,
    reuseExistingServer: !process.env.CI,
  },
})
