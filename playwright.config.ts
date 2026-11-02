import { defineConfig } from '@playwright/test'
import { SMOKE_WEBHOOK_SECRET } from './tests/smoke/secret'

const PORT = 3100

// Two specifications over one production build. Only `browser` needs Chromium.
export default defineConfig({
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: `http://localhost:${PORT}` },
  projects: [
    { name: 'http', testDir: './tests/smoke' },
    { name: 'browser', testDir: './tests/interaction', use: { browserName: 'chromium' } },
  ],
  webServer: {
    command: `npm run build && npm run start -- --port ${PORT}`,
    env: { CONTENTFUL_WEBHOOK_SECRET: SMOKE_WEBHOOK_SECRET },
    url: `http://localhost:${PORT}/policy`,
    timeout: 300_000,
    reuseExistingServer: !process.env.CI,
  },
})
