import { body, validationResult } from 'express-validator'
import { MissingError } from '../errors/ErrorHandler'
import FIELDS from './fields'

export function createEvent() {
  return [body(FIELDS._ID).exists(), body(FIELDS.EVENTOS).exists()]
}

export function updateEvent() {
  return [
    body(FIELDS.FAVORITED).exists(),
    body(FIELDS.VISUALIZED).exists(),
    body(FIELDS._ID).exists(),
    body(FIELDS.LINK_BUCKET).exists(),
    body(FIELDS.TIMESTAMP).exists()
  ]
}

export function updateDay() {
  return [body(FIELDS._ID).exists(), body(FIELDS.EVENTOS).exists()]
}

export function validateChain(req: any) {
  const errors = validationResult(req)
  if (errors.isEmpty()) return true

  const [error] = errors.array({ onlyFirstError: true })
  throw new MissingError(error.param)
}

export function createEventObject(req: any) {
  return {
    _id: req.body._id,
    favorited: req.body.favorited,
    visualized: req.body.visualized,
    link_bucket: req.body.link_bucket,
    timestamp: req.body.timestamp
  }
}

export function createEventosObject(req: any) {
  return {
    _id: req.body._id,
    eventos: req.body.eventos
  }
}
