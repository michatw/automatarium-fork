import { useState } from 'react'
import { ContextMenus, GraphViewExpression, InputTransitionGroupExpression, SelectionBox } from '/src/components'
import SelectedGraphContent from '/src/components/GraphContent/SelectedGraphContent'
import StateCircle from '/src/components/StateCircle/StateCircle'
import TemplateGhost from '/src/components/Template/TemplateGhost'
import {
  useCommentCreation,
  useCommentDragging,
  useCommentSelection,
  useContextMenus,
  useEvent,
  useStateCreation,
  useStateDragging,
  useStateSelection,
  useTemplateInsert,
  useTransitionCreation,
  useTransitionSelection
} from '/src/hooks'
import { CommentEventData, EdgeEventData, StateEventData, TransitionEventData } from '/src/hooks/useEvent'
import { SelectionEvent } from '/src/hooks/useResourceSelection'
import { useExpressionStore, useSelectionStore, useTemplateStore } from '/src/stores'
import { dispatchCustomEvent } from '/src/util/events'
import { EXPRESSION_TYPE } from 'shared/constants'
import InputDialogsExpression from '../InputDialogsExpression/InputDialogsExpression'
import GraphContentExpression from '../GraphContentExpression/GraphContentExpression'
import ErrorPopUp from '../ErrorPopUp/ErrorPopUp'
import TransitionSetExpression from '../TransitionSetExpression/TransitionSetExpression'
import { logger } from 'shared/logging'

const EditorPanelExpression = ({ mode, isErrorPopUpVisible, setErrorPopUpVisibility, errorMessage }) => {

  const expression = useExpressionStore(s => s.expression)
  const expressionType = useExpressionStore(s => s.expression.type)
  const isTask = expressionType === 'TE'
  const type = EXPRESSION_TYPE
  const states = expression?.states ?? []
  const transitions = expression?.transitions ?? []
  const comments = expression?.comments ?? []
  const initialState = expression?.initialState
  const initialStateSolution = expression?.["initialStateSolution"]
  let initialShowGraph = false

  if (isTask) {
    initialShowGraph = true
  } 
  
  const [renderSelection, setRenderSelection] = useState(false)
  const [showGraph, setShowGraph] = useState(initialShowGraph)

  // Interactivity hooks
  const { select: selectState } = useStateSelection()
  const { select: selectTransition } = useTransitionSelection()
  const { select: selectComment } = useCommentSelection()
  const { startDrag: startStateDrag } = useStateDragging(EXPRESSION_TYPE)
  const { startDrag: startCommentDrag } = useCommentDragging(EXPRESSION_TYPE)
  const { createTransitionStart, createTransitionEnd } = useTransitionCreation(mode, EXPRESSION_TYPE)
  const { ghostState } = useStateCreation(mode, EXPRESSION_TYPE)
  const { ghostTemplate } = useTemplateInsert()

  let selectedStates = useSelectionStore(s => s.selectedStates)
  let selectedComments = useSelectionStore(s => s.selectedComments)

  const setStates = useSelectionStore(s => s.setStates)
  const setComments = useSelectionStore(s => s.setComments)
  const setTransitions = useSelectionStore(s => s.setTransitions)

  const template = useTemplateStore(s => s.template)

  useCommentCreation()
  useContextMenus()

  const handleDragging = (e: SelectionEvent) => {
    const isLeftClick = e.detail.originalEvent.button === 0
    // When the user isn't holding shift and is just clicking then we need to check if we
    // need to clear their selection.
    if (!e.detail.originalEvent.shiftKey && isLeftClick) {
      // Runs a test to see if the item being selected in the event is already selected.
      // If it isn't then we forget what we have selected before
      const testEvent = (eventKey: string, ids: number[]) => {
        if (eventKey in e.detail) {
          if (!ids.includes(e.detail[eventKey].id)) {
            selectedComments = []
            selectedStates = []
          }
        }
      }
      testEvent('comment', selectedComments)
      testEvent('state', selectedStates)
    }
    // Only try and check if the user is selecting a new resource if the event correlates with that.
    // Else just use the previous value from the store.
    const selStates = e.type === 'state:mousedown' ? selectState(e) : selectedStates
    const selComments = e.type === 'comment:mousedown' ? selectComment(e) : selectedComments
    if (isLeftClick) {
      // Only drag if a left click.
      // We still allow selecting via right click so the user can directly click + edit something
      startStateDrag(e, selStates)
      startCommentDrag(e, selComments)
    }
  }

  // If a new DFA was created from a regex then show the graph
  useEvent('createdDFAFromRegex', (e) => {
    logger.info(__filename, 'received createdDFAFromRegex event')
    setShowGraph(true)
  })

  // Setup dragging for comments and states
  useEvent('state:mousedown', handleDragging)
  useEvent('comment:mousedown', handleDragging)

  useEvent('transition:mousedown', selectTransition)

  const handleDoubleClick = (e: CustomEvent<StateEventData | TransitionEventData | CommentEventData>) => {
    // Return array of selected item. If event isn't for the key then just return empty so it unselects
    const getOrEmpty = (key: string): number[] => key in e.detail ? [e.detail[key].id] : []
    setStates(getOrEmpty('state'))
    setTransitions(getOrEmpty('transition'))
    setComments(getOrEmpty('comment'))
  }

  useEvent('state:dblclick', handleDoubleClick)
  useEvent('comment:dblclick', handleDoubleClick)
  useEvent('transition:dblclick', handleDoubleClick)

  useEvent('edge:mousedown', e => {
    // We want to call the selectTransition so that if holding shift and selecting two edges
    // the two sets of transitions will be selected (Instead of unselecting one and selecting the other)
    const newEvent = {
      ...e,
      detail: {
        ...e.detail,
        ids: e.detail.transitions.map(t => t.id)
      }
    }
    selectTransition(newEvent)
  })
  useEvent('edge:dblclick', (e: CustomEvent<EdgeEventData>) => {
    setStates([])
    setComments([])
    setTransitions(e.detail.transitions.map(t => t.id))
  })

  useEvent('createTemplateThumbnail', (e) => {
    setRenderSelection(true)
    dispatchCustomEvent('storeTemplateThumbnail', e.detail)
  })

  useEvent('selectionGraph:hide', () => {
    setRenderSelection(false)
  })
  return <>
    <ErrorPopUp isVisible={isErrorPopUpVisible} setVisibility={setErrorPopUpVisibility} errorMessage={errorMessage}/>
    <GraphViewExpression>
      {/* Render in-creation transition. Since we aren't rendering text it doesn't matter what the expression is */}
      {createTransitionStart && createTransitionEnd && <TransitionSetExpression.Transition
        fullWidth
        suppressEvents
        from={createTransitionStart}
        to={createTransitionEnd}
        count={1}
        projectType="FSA"
        id={-1}
        transitions={[]}
      />}

      {/* Ghost State */}
      {ghostState && <StateCircle.Ghost cx={ghostState.x} cy={ghostState.y} /> }

      {/* Ghost template */}
      {ghostTemplate && <TemplateGhost template={template} mousePos={{ x: ghostTemplate.x, y: ghostTemplate.y }} />}

      {/* Render states and transitions */}
      {showGraph && <GraphContentExpression mode={mode} states={states} transitions={transitions} comments={comments} initialState={initialState} initialStateSolution={initialStateSolution}/>}

      {/* Render selection marquee */}
      <SelectionBox />
    </GraphViewExpression>
    {/** Temporarily render selected for image export */}
    {renderSelection && <GraphViewExpression $selectedOnly={true}>
      <SelectedGraphContent />
      </GraphViewExpression>}
    <ContextMenus type={type}/>
    <InputDialogsExpression type={type} mode={mode}/>
    <InputTransitionGroupExpression />
  </>
}

export default EditorPanelExpression
