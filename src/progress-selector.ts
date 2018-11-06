import { Progress } from './progress-state'

export function selectProgress(state: any, action: string): Progress {
  if (state == undefined || state.progress == undefined) {
    return { inProgress: false, error: undefined }
  }
  return state.progress[action]
}

export function didProgressComplete(progressNow?: Progress, progressBefore?: Progress) {
  if (progressNow == undefined || progressBefore == undefined) { return false }
  if (progressNow.inProgress === false && progressBefore.inProgress === true && progressNow.error == undefined) { return true }
  return false
}

export function didProgressFail(progressNow?: Progress, progressBefore?: Progress) {
  if (progressNow == undefined || progressBefore == undefined) { return false }
  if (progressNow.inProgress === false && progressBefore.inProgress === true && progressNow.error != undefined) { return true }
  return false
}
