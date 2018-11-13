import { eventChannel } from 'redux-saga'
import { call, cancel, cancelled, fork, put, select, take, takeEvery, takeLatest } from 'redux-saga/effects'
import { ProgressActions } from './progress-action'

export interface SagaConfiguration {
  processor?: Function
  successActionType?: string
  failureActionType?: string
}

function* genericActionSaga(actionType: any, sagaConfig: SagaConfiguration, action: any) {
  try {
    yield put(ProgressActions.startAction(actionType))
    const state = yield select()
    if (sagaConfig.processor == undefined) { throw new Error(`Saga failed: no processor function found for ${actionType}`) }
    const response = yield call(sagaConfig.processor as any, action.payload || {}, state)
    if (sagaConfig.successActionType != undefined) {
      yield put({ type: sagaConfig.successActionType, payload: response })
    }
    yield put(ProgressActions.endAction(actionType))
  } catch (e) {
    if (sagaConfig.failureActionType != undefined) {
      yield put({ error: e.message, type: sagaConfig.failureActionType })
    }
    yield put(ProgressActions.failAction(actionType, e.message))
  }
}

export interface Handlers {
  [id: string]: Function | [Function, String] | [Function, String, String]
}

export function createSaga(actionType: any, processor: Function, successActionType?: any, failureActionType?: any) {
  return takeLatest(actionType, genericActionSaga, actionType, {
    processor,
    successActionType: successActionType || `${actionType}_SUCCESS`,
    failureActionType: failureActionType || `${actionType}_ERROR`,
  })
}

export function createSagaForEvery(actionType: any, processor: Function, successActionType?: any, failureActionType?: any) {
  return takeEvery(actionType, genericActionSaga, actionType, {
    processor,
    successActionType: successActionType || `${actionType}_SUCCESS`,
    failureActionType: failureActionType || `${actionType}_ERROR`,
  })
}

export function* createSagaStream(callback: Function, saga: any, action?: any) {
  let channel: any
  const actionType = (typeof saga === 'string') ? saga : undefined
  try {
    if (actionType != undefined) { yield put(ProgressActions.startAction(actionType)) }
    channel = eventChannel(emit => callback(emit, (action ? action.payload : undefined) || {}))
    while (true) {
      const update = yield take(channel)
      if (typeof saga === 'string') {
        try {

          yield put({ type: saga, payload: update })
          if (actionType != undefined) { yield put(ProgressActions.endAction(actionType)) }
        } catch (e) {
          if (actionType != undefined) { yield put(ProgressActions.failAction(actionType, e.message)) }
        }
      } else {
        yield call(saga, update)
      }
    }
  } catch (e) {
    if (actionType != undefined) { yield put(ProgressActions.failAction(actionType, e.message)) }
    channel && channel.close()
    console.error(e)
  } finally {
    if (yield cancelled()) {
      channel && channel.close()
    }
  }
}

export function* createSagaChannel(actionType: string | string[], callback: Function, saga: any) {
  let task
  while (true) {
    const action = yield take(actionType)
    const stopAction = actionType instanceof Array && actionType[1] === (action && action.type)
    if (!stopAction) {
      if (task) { yield cancel(task) }
      task = yield fork(createSagaStream, callback, saga, action)
    } else if (task != undefined) {
      yield cancel(task)
    }
  }
}
