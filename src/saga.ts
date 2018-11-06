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

export function createSagas(handlers: Handlers) {
  return Object.keys(handlers).reduce((sagas: any[], actionType: any) => {
    const config: any = handlers[actionType] instanceof Array ? handlers[actionType] : [handlers[actionType]]
    const [processor, successActionType, failureActionType] = config
    return [...sagas, takeLatest(actionType, genericActionSaga, actionType, { processor, successActionType, failureActionType })]
  }, [])
}

export function createSaga(actionType: any, processor: Function, successActionType?: any, failureActionType?: any) {
  return takeLatest(actionType, genericActionSaga, actionType, { processor, successActionType, failureActionType })
}

export function createAsyncSaga(actionType: any, processor: Function) {
  return takeLatest(actionType, genericActionSaga, actionType, {
    processor, successActionType: `${actionType}_SUCCESS`, failureActionType: `${actionType}_SUCCESS`,
  })
}

export function createAsyncSagaForEvery(actionType: any, processor: Function) {
  return takeEvery(actionType, genericActionSaga, actionType, {
    processor, successActionType: `${actionType}_SUCCESS`, failureActionType: `${actionType}_SUCCESS`,
  })
}

export function* createSagaStream(callback: Function, saga: any, action?: any) {
  let channel: any
  try {
    channel = eventChannel(emit => callback(emit, (action ? action.payload : undefined) || {}))
    console.log('channel opened!')
    while (true) {
      const update = yield take(channel)
      if (typeof saga === 'string') {
        yield put({ type: saga, payload: update })
      } else {
        yield call(saga, update)
      }
    }
  } catch (e) {
    console.log(`channel failed: ${e.message}`)
    channel && channel.close()
  } finally {
    if (yield cancelled()) {
      channel && channel.close()
      console.log('channel closed!')
    }
  }
}

export function* createSagaChannel(actionType: string | string[], callback: Function, saga: any) {
  let task
  while (true) {
    const action = yield take(actionType)
    const stopAction = actionType instanceof Array && action[1] === (action && action.type)
    if (!stopAction) {
      if (task) { yield cancel(task) }
      task = yield fork(createSagaStream, callback, saga, action)
    } else if (task != undefined) {
      yield cancel(task)
    }
  }
}
