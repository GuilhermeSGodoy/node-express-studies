import { Request, Response, NextFunction } from 'express'
import * as cryptoRandomString from 'crypto-random-string'
import Logger from './Winston'

interface AuditingRequest extends Request {
  user?: any;
  requestId?: string;
}

export default class RequestLogger {

  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger
  }

  private static defaultUser = () => {
    return {
      _id: 'notAuthenticated'
    }
  }

  private maskBody = (body: object) => {
    let maskedBody: any = {...body}
    if (maskedBody.pwd) maskedBody.pwd = '********'

    return maskedBody
  }

  public logRequestStart = (req: AuditingRequest, res: Response, next: NextFunction) => {
    const user = req.user || RequestLogger.defaultUser()
  
    req.requestId = cryptoRandomString({length: 8})
    let maskedBody = this.maskBody(req.body)
  
    let startMessage = `[user.${user._id}.${req.requestId}] ${req.method} ${req.originalUrl}`;
    if (Object.keys(maskedBody).length) startMessage += `\n  Body: ${JSON.stringify(maskedBody)}`;
    if (Object.keys(req.query).length) startMessage += `\n  Query: ${JSON.stringify(req.query)}`;
    if (Object.keys(req.params).length) startMessage += `\n  Params: ${JSON.stringify(req.params)}`;
    
    this.logger.info(startMessage)
  
    res.on('finish', () => {
      const user = req.user || RequestLogger.defaultUser()
      
      let log = this.logger.info.bind(this.logger)
  
      if (res.statusCode >= 400) log = this.logger.warn.bind(this.logger)
      if (res.statusCode >= 500) log = this.logger.error.bind(this.logger)
  
      let responseMessage = `[user.${user._id}.${req.requestId}] ${res.statusCode} ${res.statusMessage}; ${res.get('Content-Length') || 0}b sent`
      // console.log(res)
      log(responseMessage)
    })
  
    next()
  }
}
