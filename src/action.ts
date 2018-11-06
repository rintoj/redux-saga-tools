
export interface Action { type: string }
export interface ActionWithPayload<P> extends Action { payload: P }

export interface AsyncAction<P, S> extends ActionWithPayload<P> {
  onSuccess: (payload: S) => ActionWithPayload<S>
  onFail: (payload: string) => ActionWithPayload<string>
}

export function createAction(type: string): Action
export function createAction<P>(type: string, payload: P): ActionWithPayload<P>
export function createAction<T extends string, P>(type: T, payload?: P) {
  return payload === undefined ? { type } : { type, payload }
}

export function createAsyncAction<P, S>(type: string, payload: P): AsyncAction<P, S>
export function createAsyncAction<P, S>(type: string, payload: P) {
  return {
    type,
    payload,
    onSuccess: (successPayload: S) => createAction(`${type}_SUCCESS` as any, successPayload),
    onFail: (failurePayload: string) => createAction(`${type}_FAIL`, failurePayload),
  }
}

export interface SuccessType<T> {
  payload: T
}

type FunctionType = (...args: any[]) => any
interface ActionCreatorsMapObject { [actionCreator: string]: FunctionType }

export type ActionsUnion<A extends ActionCreatorsMapObject> = ReturnType<A[keyof A]>
