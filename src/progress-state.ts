export interface ProgressState {
  [id: string]: Progress
}

export interface Progress {
  inProgress?: boolean
  error?: string
}
