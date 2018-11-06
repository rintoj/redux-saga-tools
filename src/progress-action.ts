import { ActionsUnion, createAction } from './action'

export enum ProgressActionType {
  START_ACTION = '@Progress/START_ACTION',
  END_ACTION = '@Progress/END_ACTION',
  FAIL_ACTION = '@Progress/FAIL_ACTION',
  RESET_ACTION = '@Progress/RESET_ACTION',
}

export const ProgressActions = {
  startAction: (type: string) => createAction(ProgressActionType.START_ACTION, { type }),
  endAction: (type: string) => createAction(ProgressActionType.END_ACTION, { type }),
  failAction: (type: string, error: string) => createAction(ProgressActionType.FAIL_ACTION, { type, error }),
  resetAction: (type: string) => createAction(ProgressActionType.RESET_ACTION, { type }),
}

export type ProgressActions = ActionsUnion<typeof ProgressActions>
