import { useExpressionStore, useProjectStore } from '/src/stores'

import useResourceDragging from './useResourceDragging'
import { AutomataState } from '/src/types/ProjectTypes'
import { EXPRESSION_TYPE, PROJECT_TYPE } from 'shared/constants'

// Setup state interactivity deps
const statesFromIDs = (IDs: number[]): AutomataState[] => {
  const states = useProjectStore.getState()?.project?.states ?? []
  return states.filter(state => IDs.includes(state.id))
}
const statesFromIDsExpression = (IDs: number[]): AutomataState[] => {
  const states = useExpressionStore.getState()?.getStates() ?? []
  return states.filter(state => IDs.includes(state.id))
}

const makeUpdateStates = () => useProjectStore(s => s.updateStates)

const makeUpdateStatesExpression = () => useExpressionStore(s => s.updateStates)

export default (type: string) => {
  if (type === PROJECT_TYPE) {
    return useResourceDragging(statesFromIDs, makeUpdateStates)
  } else if (type === EXPRESSION_TYPE) {
    return useResourceDragging(statesFromIDsExpression, makeUpdateStatesExpression)
  }
}
