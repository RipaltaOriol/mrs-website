// `@next/env` never overwrites a variable already in the environment, so this wins over `.env`.
/** The webhook secret the smoke specification's server is started with. */
export const SMOKE_WEBHOOK_SECRET = 'smoke-specification-secret'
