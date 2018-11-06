import { ById } from './by-id'

export function createReducer(initialState: any, handlers: any) {
  return function reducer(state = initialState, action: any) {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action.payload || {})
    } else {
      return state
    }
  }
}

export function reduceById<T>(array?: any[]): ById<T> {
  return (array || []).reduce((a: ById<T>, b: any) => {
    if (b == undefined || b.id == undefined) { return a }
    return { ...a, [b.id]: b }
  }, {})
}

export function toArray<T>(byId: ById<T>): T[] {
  return ids(byId).map(key => (byId || {})[key])
}

export function ids(object?: any) {
  return Object.keys(object || {})
}

export function setById<T>(state?: any, byId?: ById<T>): any {
  return {
    ...(state || {}),
    byId: {
      ...((state || {}).byId || {}),
      ...byId,
    },
  }
}

export function filterById<T>(byId?: ById<T>, itemIds?: string[]): ById<T> {
  return (itemIds || []).reduce((a: ById<T>, key: string) => {
    const item = (byId || {})[key]
    if (item == undefined) { return a }
    return { ...a, [key]: item }
  }, {})
}

export function filterToArrayById<T>(byId?: ById<T>, itemIds?: string[]): T[] {
  return (itemIds || []).map(key => (byId || {})[key])
}
