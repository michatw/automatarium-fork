import { StateCircle, TransitionSet, InitialStateArrow, CommentRect } from '/src/components'
import {  useSelectionStore, useSteppingStore } from '/src/stores'
import { getGroupedTransitions } from './utils'
import TransitionSetExpression from '../TransitionSetExpression/TransitionSetExpression'

const GraphContent = ({mode, states, transitions, comments, initialState, initialStateSolution}) => {
  const selectedStates = useSelectionStore(s => s.selectedStates)
  const steppedStateIDs = useSteppingStore(s => s.steppedStates)

  let initialSolutionArrow = null 
  if (initialStateSolution !== undefined) {
    initialSolutionArrow = <InitialStateArrow states={states} initialStateID={initialStateSolution} mode={mode}/>
  }
  
  const locatedTransitions = getGroupedTransitions(transitions, states)

  return <>
    {/* Render arrow on initial state */}
    <InitialStateArrow states={states} initialStateID={initialState} mode={mode}/>π
    {/* Render arrow on initial solution state if existing */}
    {initialSolutionArrow}

    {/* Render all sets of edges */}
    {locatedTransitions.map((transitions, i) => transitions[0].mode == mode && <TransitionSetExpression
      transitions={transitions}
      key={i}
    />)}

    {/* Render all states */}
    {states.map(s => s.mode == mode && <StateCircle
      key={s.id}
      id={s.id}
      modeID={s.modeID}
      name={s.name}
      label={s.label}
      cx={s.x}
      cy={s.y}
      isFinal={s.isFinal}
      selected={selectedStates.includes(s.id)}
      stepped={steppedStateIDs.includes(s.id)}
      blockID={s.blockID}
    />
    )}

    {/* Render all comments */}
    {comments.map(c => c.mode == mode && <CommentRect
      key={c.id}
      id={c.id}
      x={c.x}
      y={c.y}
      text={c.text}
    />)}
  </>
}

export default GraphContent
