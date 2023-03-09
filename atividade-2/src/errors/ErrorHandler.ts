import { MongoError } from 'mongodb'
import { Response } from 'express'

type JsonResponse = {
  name: String,
  [x: string]: any
}

export class ApplicationError extends Error {
  get statusCode() {
    return 400
  }

  get jsonError() {
    return {
      name: this.constructor.name,
      message: this.message
    } as JsonResponse
  }

  get isAxiosError() {
    return false
  }

  get response() {
    return undefined
  }
}

export class InternalError extends ApplicationError {
  get statusCode() {
    return 500
  }
}

export class DuplicateError extends ApplicationError {
  get statusCode() {
    return 409
  }

  get jsonError() {
    return {
      name: this.constructor.name,
      object: this.message
    }
  }
}

export class PermissionError extends ApplicationError {
  get statusCode() {
    return 403
  }

  get jsonError() {
    return {
      name: this.constructor.name,
      object: this.message
    }
  }
}

export class SpamError extends ApplicationError {
  get statusCode() {
    return 400
  }

  get jsonError() {
    return {
      name: this.constructor.name,
      object: this.message
    }
  }
}

export class NotFoundError extends ApplicationError {
  get statusCode() {
    return 404
  }

  get jsonError() {
    return {
      name: this.constructor.name,
      object: this.message
    }
  }
}

export class MissingError extends ApplicationError {
  get statusCode() {
    return 400
  }

  get jsonError() {
    return {
      name: this.constructor.name,
      field: this.message
    }
  }
}

export class UnauthorizedError extends ApplicationError {
  get statusCode() {
    return 401
  }
}

export class PreConditionError extends ApplicationError {
  get statusCode() {
    return 412
  }
}

export class NotAcceptableError extends ApplicationError {
  get statusCode() {
    return 406
  }
}

export default class ErrorHandler {

  private object: string

  constructor(obj: string) {
    this.object = obj
  }

  private verifyMongoError: (e: MongoError) => ApplicationError = (error) => {
    if (error.code === 11000)
      return new DuplicateError(this.object)

    if (error.code === 64)
      return new InternalError('timeout')

    return new InternalError(error.message)
  }

  private verifyAxiosError: (e: Error & { isAxiosError?: boolean, response?: any }) => ApplicationError = error => {
    if (!error.response) 
      return new InternalError('axios')
    
    return new ApplicationError(error.response.data)
  }

  public handleError = (error: Error & { isAxiosError?: boolean, response?: any }, res: Response) => {
    if (error instanceof MongoError) {
      error = this.verifyMongoError(error)
    }
    else if (error.isAxiosError) {
      error = this.verifyAxiosError(error)
    }
    else if (!(error instanceof ApplicationError)) {
      error = new ApplicationError(error.message)
    }

    return res.status((<ApplicationError>error).statusCode)
      .json((<ApplicationError>error).jsonError)
  }
}
