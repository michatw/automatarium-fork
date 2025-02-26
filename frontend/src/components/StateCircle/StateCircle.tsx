import { useRef, useEffect, useState, MouseEvent, HTMLAttributes } from 'react'

import { dispatchCustomEvent } from '/src/util/events'
import { useMetaDataStore, useProjectStore } from '/src/stores'
import { STATE_CIRCLE_RADIUS } from '/src/config/rendering'

import { validColours, circleStyles, customColourCircle, stepGlowStyle, circleSelectedClass, textStyles } from './stateCircleStyle'
import { CustomEvents } from '/src/hooks/useEvent'
import { EXPRESSION_TYPE, PROJECT_TYPE, SOLUTION_MODE, TASK_MODE } from 'shared'

const FINAL_OUTLINE_OFFSET = 5

type StateCircleProps = {
  id: number
  modeID : number
  name: string
  label: string
  isFinal: boolean
  cx: number
  cy: number
  selected: boolean
  stepped: boolean
  blockID: number
} & Omit<HTMLAttributes<SVGElement>, 'id'> // Need to remove `id` or else it will be never type

const StateCircle = ({ id, modeID, name, label, isFinal, cx, cy, selected, stepped, blockID, ...props }: StateCircleProps) => {
  const type = useMetaDataStore(s => s.selectedModelType)
  const mode = useMetaDataStore(s => s.selectedViewType)

  const showTask = mode === TASK_MODE
  const showSolution = mode === SOLUTION_MODE
 
  const stateTaskPrefix = type === PROJECT_TYPE ? useProjectStore(s => s.project?.config?.statePrefixTask) : type === EXPRESSION_TYPE ? useProjectStore(s => s.project?.config?.statePrefixTask) : undefined
  const stateSolutionPrefix = type === PROJECT_TYPE ? useProjectStore(s => s.project?.config?.statePrefixSolution) : type === EXPRESSION_TYPE ? useProjectStore(s => s.project?.config?.statePrefixSolution) : undefined

  const statePrefix = showTask? stateTaskPrefix : showSolution? stateSolutionPrefix : undefined
  
  const displayName = name != null? name : statePrefix != undefined && modeID != undefined ? `${statePrefix}${modeID}` : `q${id}` // This is needed as some legacy project might not have a prefix and modeID set. In that case, we default to q{id}

  const labelRef = useRef<SVGTextElement>()
  const [labelBox, setLabelBox] = useState({ x: 0, y: 0, width: 0, height: 0 })

  useEffect(() => {
    const { x, y, width, height } = labelRef.current?.getBBox() ?? { x: 0, y: 0, width: 0, height: 0 }
    setLabelBox({ x, y: y - 3, width: width + 14, height: height + 6 })
  }, [labelRef.current, label])

  // TODO: use Callback
  const handleEvent = (eventName: keyof CustomEvents) => (e: MouseEvent) => {
    dispatchCustomEvent(eventName, {
      originalEvent: e,
      state: { id, name, cx, cy },
      ctx: id
    })
  }

  return <g transform={`translate(${cx}, ${cy})`}
            onMouseDown={handleEvent('state:mousedown')}
            onMouseUp={handleEvent('state:mouseup')}
            onDoubleClick={handleEvent('state:dblclick')}
            {...props}>
    {/* Filled Circle */}
    { blockID == null &&
        <circle r={STATE_CIRCLE_RADIUS} style={{ ...circleStyles, ...(stepped ? stepGlowStyle : {}) }} className={(selected && circleSelectedClass) || undefined} />
    }
    {
      blockID != null &&
        <circle r={STATE_CIRCLE_RADIUS} style={{ ...customColourCircle(validColours[blockID]), ...(stepped ? stepGlowStyle : {}) }} className={(selected && circleSelectedClass) || undefined} />
    }
    {/* Extra outline for final states */}
    {isFinal && <circle r={STATE_CIRCLE_RADIUS - FINAL_OUTLINE_OFFSET} style={circleStyles} className={(selected && circleSelectedClass) || undefined} />}

    {/* Name */}
    <text textAnchor="middle" alignmentBaseline="central" style={textStyles}>
      {displayName}
    </text>

    {/* State label */}
    {label && <g transform={`translate(0, ${STATE_CIRCLE_RADIUS})`}>
      <rect
        x={-(labelBox?.width ?? 0) / 2}
        y={labelBox?.y}
        width={labelBox?.width}
        height={labelBox?.height}
        style={circleStyles}
        className={(selected && circleSelectedClass) || undefined}
        ry="5" rx="5"
      />
      <text ref={labelRef} textAnchor="middle" alignmentBaseline="central" style={textStyles}>{label}</text>
    </g>}
  </g>
}

StateCircle.Ghost = ({ cx, cy }: {cx: number, cy: number}) =>
  <circle cx={cx} cy={cy} r={STATE_CIRCLE_RADIUS} style={{ ...circleStyles, opacity: 0.3, pointerEvents: 'none' }} />

export default StateCircle
