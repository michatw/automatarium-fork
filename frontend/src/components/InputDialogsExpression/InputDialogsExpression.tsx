import { useState, useRef, useCallback, KeyboardEvent } from 'react'
import { CornerDownLeft, MessageSquare } from 'lucide-react'

import { Dropdown, Input } from '/src/components'
import { useExpressionStore, useMetaDataStore, useViewStore } from '/src/stores'
import useEvent from '/src/hooks/useEvent'
import { locateTransition } from '/src/util/states'
import { lerpPoints } from '/src/util/points'
import { formatInput, formatOutput } from '/src/util/stringManipulations'

import {
  InputWrapper,
  SubmitButton,
  TransitionInputStyle,
  CheckButton
} from './inputDialogsExpressionStyle'

import {
  AutomataState,
  ProjectComment,
} from '/src/types/ProjectTypes'
import { SOLUTION_MODE, TASK_MODE } from 'shared'
import { logger } from 'shared/logging'
import _ from 'lodash'
import InputTextArea from '../TextArea/TextArea'

/**
 * All types that a dialog could be
 */
type DialogType = 'FSATransition' | 'comment' | 'stateName' | 'stateLabel' | 'state' | 'none'

/**
 * Represents a dialog modal that is shown on the page
 */
interface BaseDialog {
  visible: boolean
  x: number
  y: number
  id: number
  type: DialogType
}

/**
 * Any dialog that is making a transition
 */
interface TransitionDialog extends BaseDialog {
  type: 'FSATransition'
}

/**
 * Shown when creating a comment
 */
interface CommentDialog extends BaseDialog {
  type: 'comment'
  selectedComment: ProjectComment
}

/**
 * Used for creating and modifying states
 */
interface StateDialog extends BaseDialog {
  type: 'stateName' | 'stateLabel'
  selectedState: AutomataState
}

/**
 * All possible dialogs. This allows for a tagged union using `type` field
 */
type Dialog = TransitionDialog | CommentDialog | StateDialog

const InputDialogsExpression = ({ type, mode }) => {
  const showTask = mode === TASK_MODE
  const showSolution = mode === SOLUTION_MODE
  logger.debug(__filename, "show task: ", showTask, "show solution: ", showSolution)

  const [dialog, setDialog] = useState<Dialog | undefined>()
  const inputRef = useRef<HTMLInputElement>()

  const [value, setValue] = useState('')

  const inputWriteRef = useRef()
  const inputDirectionRef = useRef()
  const editTransition = useExpressionStore(s => s.editTransition)
  const removeTransitions = useExpressionStore(s => s.removeTransitions)
  const getTransitions = useExpressionStore(s => s.getTransitions)
  const getStates = useExpressionStore(s => s.getStates)
  const getComments = useExpressionStore(s => s.getComments)
  const commit = useExpressionStore(s => s.commit)
  const viewToScreenSpace = useViewStore(s => s.viewToScreenSpace)
  const screenToViewSpace = useViewStore(s => s.screenToViewSpace)
  const statePrefix = showTask ?  useExpressionStore(s => s.expression.config.statePrefixTask) : showSolution ? useExpressionStore(s => s.expression.config.statePrefixSolution) : undefined
  const projectType = useExpressionStore(s => s.expression.type)
  const orOperator = useExpressionStore(s => s.expression.config.orOperator) ?? '|'
  const hideDialog = useCallback(() => setDialog({ ...dialog, visible: false }), [dialog])
  const focusInput = useCallback(() => setTimeout(() => inputRef.current?.focus(), 100), [inputRef.current])
  const [isNew, setIsNew] = useState(true)
  const arr = [inputWriteRef.current, inputDirectionRef.current, inputRef.current]

  useEvent('editTransition', ({ detail: { id, new: isNewTransition } }) => {
    const transitions = getTransitions()
    const states = getStates()
    const transition = transitions.find(t => t.id === id)
    // Find midpoint of transition in screen space
    const pos = locateTransition(transition, states)
    const midPoint = lerpPoints(pos.from, pos.to, 0.5)
    const screenMidPoint = viewToScreenSpace(midPoint.x, midPoint.y)
    setIsNew(isNewTransition ?? true) // Default a.k.a. previous functionality assumes new
    switch (projectType) {
      case 'TE':
        setValue(formatOutput(transition?.read, orOperator) ?? '')
        setDialog({
          visible: true,
          x: screenMidPoint[0],
          y: screenMidPoint[1],
          id,
          type: 'FSATransition'
        })
    }

    focusInput()
  }, [arr, orOperator])

  const saveTransition = () => {
    editTransition({
      id: dialog.id,
      read: formatInput(value, orOperator)
    })
    commit()
    hideDialog()
  }

  useEvent('editComment', ({ detail: { id, x, y } }) => {
    const selectedComment = getComments().find(cm => cm.id === id)
    setValue(selectedComment?.text ?? '')

    setDialog({
      visible: true,
      selectedComment,
      x,
      y,
      type: 'comment'
    } as CommentDialog)
    focusInput()
  }, [inputRef.current])

  const saveComment = () => {
    if (value && !/^\s*$/.test(value) && dialog.type === 'comment') {
      if (dialog.selectedComment === undefined) {
        const pos = screenToViewSpace(dialog.x, dialog.y)
        useExpressionStore.getState().createComment({ x: pos[0], y: pos[1], text: value.trim(), mode: mode})
      } else {
        useExpressionStore.getState().updateComment({ ...dialog.selectedComment, text: value.trim() })
      }
      commit()
    }
    hideDialog()
  }

  useEvent('editStateName', ({ detail: { id } }) => {
    const selectedState = getStates().find(s => s.id === id)
    setValue(selectedState.name ?? '')
    const pos = viewToScreenSpace(selectedState.x, selectedState.y)

    setDialog({
      visible: true,
      selectedState,
      x: pos[0],
      y: pos[1],
      type: 'stateName'
    } as StateDialog)
    focusInput()
  }, [inputRef.current])

  const saveStateName = () => {
    useExpressionStore.getState().updateState({
      ...(dialog as StateDialog).selectedState,
      name: (!value || /^\s*$/.test(value)) ? undefined : value
    })
    commit()
    hideDialog()
  }

  useEvent('editStateLabel', ({ detail: { id } }) => {
    const selectedState = getStates().find(s => s.id === id)
    setValue(selectedState.label ?? '')
    const pos = viewToScreenSpace(selectedState.x, selectedState.y)

    setDialog({
      visible: true,
      selectedState,
      x: pos[0],
      y: pos[1],
      type: 'stateLabel'
    } as StateDialog)
    focusInput()
  }, [inputRef.current])

  const saveStateLabel = () => {
    useExpressionStore.getState().updateState({
      ...(dialog as StateDialog).selectedState,
      label: (!value || /^\s*$/.test(value)) ? undefined : value
    })
    commit()
    hideDialog()
  }

  const save = ({
    FSATransition: saveTransition,
    stateName: saveStateName,
    stateLabel: saveStateLabel,
    comment: saveComment,
  } as Record<DialogType, () => void>)[dialog?.type]

  if (!dialog) return null

  /**
   * Common properties of the parent dropdown
   */
  const DROPDOWN_PROPS = {
    type: type,
    visible: dialog.visible,
    onClose: () => {
      hideDialog()
      if (isNew && ['FSATransition', 'PDATransition', 'TMTransition'].includes(dialog.type)) {
        removeTransitions([dialog.id])
      }
    },
    style: {
      top: `${dialog.y}px`,
      left: `${dialog.x}px`
    },
    setErrorMessage: () => {}
  }

  /**
   * Calls `save` if the enter key is hit
   * @param e
   */
  const handleSave = (e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && save()

  // Show the dialog depending on the type created
  switch (dialog.type) {
    case 'FSATransition':
      return (
        <Dropdown {...DROPDOWN_PROPS}>
          <InputWrapper>
            <Input
              ref={inputRef}
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyUp={handleSave}
              placeholder={'λ'}
              style={TransitionInputStyle}
            />
            <SubmitButton onClick={save}>
              <CornerDownLeft size="18px" />
            </SubmitButton>
          </InputWrapper>
        </Dropdown>
      )
    case 'stateName':
    case 'stateLabel':
      // Both comment and state altering modals are basically the same so we can stick
      // them in the same branch
      return (
        <Dropdown {...DROPDOWN_PROPS}>
         <InputWrapper>
            <Input
              ref={inputRef}
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyUp={handleSave}
              placeholder={{
                stateName: `${statePrefix ?? 'q'}${(dialog as StateDialog).selectedState?.modeID ?? '0'}`,
                stateLabel: 'State label...',
                comment: 'Comment text...'
              }[dialog.type]}
              style={{
                width: 'calc(20ch + 3.5em)',
                margin: '0 .4em',
                paddingRight: '2.5em'
              }}
            />
            <SubmitButton onClick={save}>
              <CornerDownLeft size="18px" />
            </SubmitButton>
          </InputWrapper>
        </Dropdown>
      )
    case 'comment':
      return (
        <Dropdown {...DROPDOWN_PROPS}>
          <InputWrapper>
            <MessageSquare style={{ marginInline: '1em .6em' }}/>
            <InputTextArea
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder={'Comment text...'}
              style={{
                width: 'calc(50ch + 3.5em)',
                margin: '0 .4em',
                paddingRight: '2.5em'
              }}
            />
            <CheckButton onClick={save}>
              <CornerDownLeft size="18px" />
            </CheckButton>
          </InputWrapper>
        </Dropdown>
      )
    default:
      return null
  }
}

export default InputDialogsExpression
