import { ProgressActionType } from './progress-action'
import { ProgressState } from './progress-state'
import { createReducer } from './reducer'

function startAction(state: ProgressState, { type }: { type: string }): ProgressState {
  if (type == undefined) { throw new Error('Invalid progress action: Missing "action" attribute') }
  return {
    ...state,
    [type]: { inProgress: true, error: undefined },
  }
}

function endAction(state: ProgressState, { type }: { type: string }): ProgressState {
  if (type == undefined) { throw new Error('Invalid progress action: Missing "action" attribute') }
  return {
    ...state,
    [type]: { inProgress: false, error: undefined },
  }
}

function failAction(state: ProgressState, { type, error }: { type: string, error: string }): ProgressState {
  if (type == undefined) { throw new Error('Invalid progress action: Missing "action" attribute') }
  return {
    ...state,
    [type]: { inProgress: false, error },
  }
}

function resetAction(state: ProgressState, { type }: { type: string }): ProgressState {
  if (type == undefined) { throw new Error('Invalid progress action: Missing "action" attribute') }
  return {
    ...state,
    [type]: undefined as any,
  }
}

export const progressReducer = createReducer({}, {
  [ProgressActionType.START_ACTION]: startAction,
  [ProgressActionType.END_ACTION]: endAction,
  [ProgressActionType.FAIL_ACTION]: failAction,
  [ProgressActionType.RESET_ACTION]: resetAction,
})
