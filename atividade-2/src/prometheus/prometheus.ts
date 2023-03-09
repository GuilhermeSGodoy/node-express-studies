import * as prometheus from 'prom-client'
import * as express from 'express'

const collectDefaultMetrics = prometheus.collectDefaultMetrics

export const setServicePrefix = (serviceName: string) => {
  collectDefaultMetrics({ prefix: `${serviceName}_` })
}

export function prometheuMiddleware (): express.RequestHandler {
  return async (_req, res) => {
    try {
      res.set('Content-Type', prometheus.register.contentType)
      return res.end(await prometheus.register.metrics())
    } catch (error) {
      return handleError(error, res)
    }
  }
}

function handleError (err: any, res: any) {
  return res.status(400).send(err.message)
}