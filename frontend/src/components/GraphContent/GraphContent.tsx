import { StateCircle, TransitionSet, InitialStateArrow, CommentRect } from '/src/components'
import {  useSelectionStore, useSteppingStore } from '/src/stores'
import { getGroupedTransitions } from './utils'

const GraphContent = ({mode, project}) => {
  const selectedStates = useSelectionStore(s => s.selectedStates)
  const steppedStateIDs = useSteppingStore(s => s.steppedStates)
  // Destructure project to get state
  const states = project?.states ?? []
  const transitions = project?.transitions ?? []
  const comments = project?.comments ?? []
  const initialState = project?.initialState

  let initialSolutionArrow = null 
  if (project && (project["initialStateSolution"] !== undefined)) {
    initialSolutionArrow = <InitialStateArrow states={states} initialStateID={project["initialStateSolution"]} mode={mode}/> // Initial state solution arrow
  }
  
  const locatedTransitions = getGroupedTransitions(transitions, states)

  return <>
    {/* Render arrow on initial state */}
    <InitialStateArrow states={states} initialStateID={initialState} mode={mode}/>
    {/* Render arrow on initial solution state if existing */}
    {initialSolutionArrow}

    {/* Render all sets of edges */}
    {locatedTransitions.map((transitions, i) => transitions[0].mode == mode && <TransitionSet
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
