import packageConfig from '../../package.json'
import { ColourName } from './colors'
import { ProjectType } from '../types/ProjectTypes'

export const SCHEMA_VERSION = packageConfig.schemaVersion
export const APP_VERSION = packageConfig.version
export const DEFAULT_PROJECT_TYPE = 'FSA'
export const DEFAULT_STATE_PREFIX_TASK_PROJECT = 'q'
export const DEFAULT_STATE_PREFIX_SOLUTION_PROJECT = 'z'
export const DEFAULT_OR_OPERATOR = '|'
export const DEFAULT_ACCEPTANCE_CRITERIA = 'both'
export const DEFAULT_PROJECT_COLOR: Record<ProjectType, ColourName> = {
  FSA: 'orange',
  PDA: 'red',
  TM: 'purple',
  T: 'blue'
}
