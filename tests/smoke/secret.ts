/**
 * The webhook secret the smoke specification's server is started with.
 *
 * `@next/env` does not overwrite a variable already in the environment, so this
 * wins over any value in `.env` and the specification can exercise both a
 * refused call and an accepted one without depending on local configuration.
 */
export const SMOKE_WEBHOOK_SECRET = 'smoke-specification-secret'
