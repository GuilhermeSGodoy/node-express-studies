import * as express from 'express'
import * as validator from '../utils/validator'

import SUCCESS from '../utils/success'
import { dbEvents, eventErrors } from '../config'
import FIELDS from '../utils/fields'
import { MissingError } from '../errors/ErrorHandler'

export function handleGravacaoContinuousService(): express.Router {
  const router = express.Router()

  router.get('/:estabelecimento/:camera', handleGetCamera())
  router.get('/:estabelecimento/:camera/:dia', handleGetCameraDia())
  router.get('/:estabelecimento/:camera/:dia/query', handleGetCameraDiaQuery())
  router.post('/:estabelecimento/:camera/:dia', validator.createEvent(), handlePost())
  router.put('/:estabelecimento/:camera/:dia', validator.updateDay(), handlePutCameraDia())
  router.put('/:estabelecimento/:camera/:dia/:id', validator.updateEvent(), handlePutCameraDiaId())
  router.delete('/:estabelecimento/:camera/:dia/:id', handleDeleteCameraDiaId())
  router.delete('/:estabelecimento/:camera/:dia', handleDeleteCameraDia())
  return router
}

function handleGetCamera(): express.RequestHandler {
  return async (req, res, next) => {
    try {
      let events = await dbEvents.getAll(req.params.estabelecimento, req.params.camera)
      return res.status(200).send(events)
    } catch (e) {
      const error = e as Error
      eventErrors.handleError(error, res)
    }
  }
}

function handleGetCameraDia(): express.RequestHandler {
  return async (req, res, next) => {
    try {
      let dia = await dbEvents.getEventByID(req.params.dia, req.params.estabelecimento, req.params.camera)
      return res.status(200).send(dia)
    } catch (e) {
      const error = e as Error
      eventErrors.handleError(error, res)
    }
  }
}

function handleGetCameraDiaQuery(): express.RequestHandler {
  return async (req, res, next) => {
    try {
      let query = { _id: req.params.dia }
      let elements = []
      if (req.query._id) {
        elements.push({
          $eq: ['$$event._id', req.query._id]
        })

        let [resp] = await dbEvents.queryEventsByID(query, elements, req.params.estabelecimento, req.params.camera)
        return res.status(200).send(resp)
      }

      if (req.query.favorited) {
        elements.push({
          $eq: ['$$event.favorited', req.query.favorited == 'true']
        })
      }
      if (req.query.visualized && req.query.visualized != 'undefined') {
        elements.push({
          $eq: ['$$event.visualized', req.query.visualized == 'true']
        })
      }

      if (req.query.hour_init && req.query.hour_init != 'undefined' && req.query.hour_final && req.query.hour_final != 'undefined') {
        elements.push({
          $gte: ['$$event.timestamp', parseFloat(<string>req.query.hour_init)]
        })
        elements.push({
          $lte: ['$$event.timestamp', parseFloat(<string>req.query.hour_final)]
        })
      }

      if (req.query.count == '1') {
        let resp = await dbEvents.countEvents(query, elements, req.params.estabelecimento, req.params.camera)
        if (!resp.length) return res.status(200).send([{ length: 0 }])
        return res.status(200).send(resp)
      }

      if (req.query.skip == undefined) throw new MissingError(FIELDS.SKIP)
      if (req.query.limit == undefined) throw new MissingError(FIELDS.LIMIT)

      let [resp] = await dbEvents.queryEvents(
        query,
        elements,
        parseInt(<string>req.query.skip),
        parseInt(<string>req.query.limit),
        req.params.estabelecimento,
        req.params.camera
      )
      if (!resp) return res.status(200).send({})
      res.status(200).send(resp)
    } catch (e) {
      const error = e as Error
      eventErrors.handleError(error, res)
    }
  }
}

function handlePost(): express.RequestHandler {
  return async (req, res, next) => {
    try {
      await validator.validateChain(req)
      let objetoDia = validator.createEventosObject(req)

      let diaRecovered = await dbEvents.getEventByID(req.params.dia, req.params.estabelecimento, req.params.camera)
      if (diaRecovered.length == 0) {
        await dbEvents.createEvent(objetoDia, req.params.estabelecimento, req.params.camera)
      }
      return res.status(201).send(SUCCESS.OPERATIONS.CREATE_EVENT)
    } catch (e) {
      const error = e as Error
      eventErrors.handleError(error, res)
    }
  }
}

function handlePutCameraDia(): express.RequestHandler {
  return async (req, res, next) => {
    try {
      await validator.validateChain(req)
      await dbEvents.updateEvent(req.params.dia, req.body, req.params.estabelecimento, req.params.camera)
      res.status(200).send(SUCCESS.OPERATIONS.UPDATE_EVENT)
    } catch (e) {
      const error = e as Error
      eventErrors.handleError(error, res)
    }
  }
}

function handlePutCameraDiaId(): express.RequestHandler {
  return async (req, res, next) => {
    try {
      await validator.validateChain(req)
      let evento = validator.createEventObject(req)

      let [eventRecovered] = await dbEvents.getEventByID(req.params.dia, req.params.estabelecimento, req.params.camera)
      if (!eventRecovered) return res.status(200).send(SUCCESS.OPERATIONS.UPDATE_EVENT)

      let eventToBeModifiedIndex = eventRecovered.eventos.findIndex((e: any) => e._id == req.params.id)

      if (eventToBeModifiedIndex == -1) return res.status(200).send(SUCCESS.OPERATIONS.UPDATE_EVENT)

      eventRecovered.eventos[eventToBeModifiedIndex] = evento
      await dbEvents.updateEvent(
        req.params.dia,
        {
          eventos: eventRecovered.eventos
        },
        req.params.estabelecimento,
        req.params.camera
      )
      return res.status(200).send(SUCCESS.OPERATIONS.UPDATE_EVENT)
    } catch (e) {
      const error = e as Error
      eventErrors.handleError(error, res)
    }
  }
}

function handleDeleteCameraDiaId(): express.RequestHandler {
  return async (req, res, next) => {
    try {
      let [eventRecovered] = await dbEvents.getEventByID(req.params.dia, req.params.estabelecimento, req.params.camera)
      if (eventRecovered) {
        let indexToBeDeleted = eventRecovered.eventos.findIndex((e: any) => e._id == req.params.id)
        if (indexToBeDeleted >= 0) {
          eventRecovered.eventos.splice(indexToBeDeleted, 1)
        } else {
          return res.status(204).send()
        }

        await dbEvents.updateEvent(
          req.params.dia,
          {
            eventos: eventRecovered.eventos
          },
          req.params.estabelecimento,
          req.params.camera
        )
      }
      return res.status(204).send()
    } catch (e) {
      const error = e as Error
      eventErrors.handleError(error, res)
    }
  }
}

function handleDeleteCameraDia(): express.RequestHandler {
  return async (req, res, next) => {
    try {
      await dbEvents.deleteEvent(req.params.dia, req.params.estabelecimento, req.params.camera)
      res.status(204).send()
    } catch (e) {
      const error = e as Error
      eventErrors.handleError(error, res)
    }
  }
}
