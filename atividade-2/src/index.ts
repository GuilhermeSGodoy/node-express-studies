/* eslint no-console: ["error", { allow: ["log"] }] */
import app from './app'
import { logger } from './config'

app.listen('3000', () => {
  logger.info('[app] service up')
})
