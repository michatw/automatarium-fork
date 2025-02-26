import { useState } from 'react'

import { useProjectStore, useViewStore, useSelectionStore, useToolStore, useMetaDataStore, useExpressionStore } from '/src/stores'
import { useEvent } from '/src/hooks'
import { locateTransition } from '/src/util/states'
import { EXPRESSION_TYPE, PROJECT_TYPE } from 'shared/constants'

const SelectionBox = () => {
  const tool = useToolStore(s => s.tool)
  const toolActive = tool === 'cursor'

  let states, transitions, comments
  const type = useMetaDataStore(s => s.selectedModelType)
  const mode = useMetaDataStore(s => s.selectedViewType)
  const expression = useExpressionStore(s => s.expression)
  const project = useProjectStore(s => s.project)
  const isExpression = type === EXPRESSION_TYPE
  const isProject = type === PROJECT_TYPE
  if (isProject) {
    states = project.states
    transitions = project.transitions
    comments = project.comments
  } else if (isExpression) {
    states = expression['states']
    transitions = expression['transitions']
    comments = expression['comments']
  }

  const screenToViewSpace = useViewStore(s => s.screenToViewSpace)
  const svgElement = useViewStore(s => s.svgElement)

  const setSelectedStates = useSelectionStore(s => s.setStates)
  const setSelectedTransitions = useSelectionStore(s => s.setTransitions)
  const setSelectedComments = useSelectionStore(s => s.setComments)

  const prevSelectedStates = useSelectionStore(s => s.selectedStates)
  const prevSelectedTransitions = useSelectionStore(s => s.selectedTransitions)
  const prevSelectedComments = useSelectionStore(s => s.selectedComments)

  const [dragStart, setDragStart] = useState(null)
  const [mousePos, setMousePos] = useState(null)

  useEvent('mousemove', e => {
    setMousePos(screenToViewSpace(e.clientX, e.clientY))
  }, [])

  useEvent('svg:mousedown', e => {
    if (e.detail.originalEvent.button === 0 && e.detail.didTargetSVG && toolActive) {
      setDragStart([e.detail.viewX, e.detail.viewY])
    }
  }, [toolActive, svgElement])

  useEvent('svg:mouseup', e => {
    if (dragStart !== null && toolActive) {
      // Calculate drag bounds
      const startX = Math.min(dragStart[0], mousePos[0])
      const startY = Math.min(dragStart[1], mousePos[1])
      const endX = Math.max(dragStart[0], mousePos[0])
      const endY = Math.max(dragStart[1], mousePos[1])

      // Determine selected states. The filter is needed as all states exist all the time, but only states in the current mode are relevant
      const selectedStates = states
      .filter(state => state.mode === mode)
      .filter(state =>
        state.x >= startX &&
        state.x <= endX &&
        state.y >= startY &&
        state.y <= endY).map(s => s.id)

      // Determine selected transitions
      const selectedTransitions = transitions
        .filter(t => t.mode === mode) // Filter transitions by selected mode
        .map(t => locateTransition(t, states))
        .filter(transition =>
          transition.from.x >= startX &&
          transition.from.x <= endX &&
          transition.from.y >= startY &&
          transition.from.y <= endY &&
          transition.to.x >= startX &&
          transition.to.x <= endX &&
          transition.to.y >= startY &&
          transition.to.y <= endY)
        .map(t => t.id)

      // Determine selected comments
      const selectedComments = comments
      .filter(comment => comment.mode === mode)
      .filter(comment =>
        comment.x >= startX &&
        comment.y >= startY &&
        comment.x <= endX &&
        comment.y <= endY).map(c => c.id)

      // If the shift key is pressed then we need to append additional things
      if (e.detail.originalEvent.shiftKey) {
        selectedStates.push(...prevSelectedStates)
        selectedTransitions.push(...prevSelectedTransitions)
        selectedComments.push(...prevSelectedComments)
      }
      // Update state
      setSelectedStates(selectedStates)
      setSelectedTransitions(selectedTransitions)
      setSelectedComments(selectedComments)
      setDragStart(null)
    }
  }, [toolActive, dragStart, mousePos, states])

  if (!dragStart || !mousePos || !toolActive) { return null }

  const startX = Math.min(dragStart[0], mousePos[0])
  const startY = Math.min(dragStart[1], mousePos[1])
  const endX = Math.max(dragStart[0], mousePos[0])
  const endY = Math.max(dragStart[1], mousePos[1])

  return <rect
    x={startX}
    y={startY}
    width={endX - startX}
    height={endY - startY}
    fill='var(--selection-fill)'
    stroke='var(--stroke)'
    strokeWidth='1.75'
    rx={3}
    ry={3}
  />
}

export default SelectionBox
