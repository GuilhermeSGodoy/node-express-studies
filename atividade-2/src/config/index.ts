import Logger from '../logs/Winston'
import RequestLogger from '../logs/requestLogger'
import ErrorHandler from '../errors/ErrorHandler'
import MongoEvent from '../utils/MongoEvent'

const logHostname = process.env.LOG_HOSTNAME || 'fluentd'
const logPort = +(process.env.LOG_PORT || '24224')
const logToFile = process.env.LOG_TO_FILE == 'true'
const logger = new Logger('gravacao_continuous_service', logHostname, logPort, logToFile)

const requestLogger = new RequestLogger(logger)

const eventErrors = new ErrorHandler('Event')

const dbAdress = process.env.MONGO_ADDRESS || ''
const dbEvents = new MongoEvent(dbAdress, logger)

export { logger, requestLogger, eventErrors, dbEvents }