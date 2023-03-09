import * as express from 'express'
import * as helmet from 'helmet'
import { requestLogger } from './config'
import * as prometheus from './prometheus/prometheus'
import { handleGravacaoContinuousService } from './routes/plataform.route'

const app = express()
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

prometheus.setServicePrefix('gravacao_continuous_service')
app.get('/metrics', prometheus.prometheuMiddleware())

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Origin', req.headers.origin)
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept')
  if ('OPTIONS' == req.method) {
    res.send()
  } else {
    next()
  }
})

app.use(requestLogger.logRequestStart)

app.use('/', handleGravacaoContinuousService())

export default app
