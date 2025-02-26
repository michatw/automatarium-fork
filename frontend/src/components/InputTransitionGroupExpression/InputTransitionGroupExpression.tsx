import { CornerDownLeft, X } from 'lucide-react'
import {
  KeyboardEvent,
  Ref,
  RefObject,
  createRef,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import Button from '/src/components/Button/Button'
import Input from '/src/components/Input/Input'
import {
  InputWrapper,
  SubmitButton,
} from '../InputDialogsExpression/inputDialogsExpressionStyle'
import Modal from '/src/components/Modal/Modal'
import { useEvent } from '/src/hooks'
import { useExpressionStore, useMetaDataStore } from '/src/stores'
import {
  BaseAutomataTransition,
  FSAAutomataTransition,
  assertType
} from '/src/types/ProjectTypes'
import { formatOutput, formatInput } from '/src/util/stringManipulations'
import { SOLUTION_MODE, TASK_MODE } from 'shared'
import { logger } from 'shared/logging'

const InputTransitionGroupExpression = () => {
  const mode = useMetaDataStore((s) => s.selectedViewType)
  const showTask = mode === TASK_MODE
  const showSolution = mode === SOLUTION_MODE
  logger.debug(__filename, "show task: ", showTask, "show solution: ", showSolution)

  const inputRef = useRef<HTMLInputElement>()
  const [transitionListRef, setTransitionListRef] =
    useState<Array<Ref<HTMLInputElement>>>()
  // selectIndex === -1 is the new transition field, others is the index
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const [fromState, setFromState] = useState<number>()
  const [toState, setToState] = useState<number>()
  const [transitionsList, setTransitionsList] = useState<BaseAutomataTransition[]>()
  const [readList, setReadList] = useState<string[]>()

  const [fromName, setFromName] = useState<string>()
  const [toName, setToName] = useState<string>()

  const [modalOpen, setModalOpen] = useState(false)

  const [idList, setIdList] = useState([])

  // For the new transition
  const [readValue, setReadValue] = useState('')

  const statePrefix = showTask? useExpressionStore((s) => s.expression.config.statePrefixTask) : showSolution? useExpressionStore((s) => s.expression.config.statePrefixSolution) : undefined
  const expressionType = useExpressionStore((s) => s.expression.type)
  const orOperator = useExpressionStore((s) => s.expression.config.orOperator) ?? '|'

  const editTransition = useExpressionStore((s) => s.editTransition)
  const createTransition = useExpressionStore((s) => s.createTransition)
  const removeTransitions = useExpressionStore((s) => s.removeTransitions)
  const commit = useExpressionStore((s) => s.commit)

  // Get data from event dispatch
  useEvent(
    'editTransitionGroup',
    ({ detail: { ctx } }) => {
      const { transitions, states } = useExpressionStore.getState()?.expression ?? {transitions: [], states: []} 
      // Get one transition from the set to get the from and to state Ids
      const scopedTransition = transitions.find((t) => ctx === t.id)
      // Get state connection information for the modal
      const scopeFrom = scopedTransition.from
      const scopeTo = scopedTransition.to
      const fName = states.find((s) => s.id === scopeFrom).name ?? '' + statePrefix + scopeFrom
      const tName = states.find((s) => s.id === scopeTo).name ?? '' + statePrefix + scopeTo
      setFromState(scopeFrom)
      setToState(scopeTo)
      setFromName(fName)
      setToName(tName)
      // Update ID list to include *ALL* transitions on this edge, including unselected
      // This will run the side effect of re-retrieving the updated id list when done
      const allIdList = transitions
        .filter((t) =>
          t.from === scopeFrom &&
          t.to === scopeTo)
        .map((t) => t.id)
      setIdList([...allIdList])
      setModalOpen(true)
    }, []
  )

  const retrieveTransitions = useCallback(() => {
    const { transitions } = useExpressionStore.getState()?.expression ?? {transitions: [], states: []}
    const transitionsScope = transitions.filter((t) => idList.includes(t.id))
    setTransitionsList([...transitionsScope])
    setReadList(transitionsScope.map(t => formatOutput(t.read, orOperator)))
  }, [idList, expressionType])

  useEffect(() => {
    setTransitionListRef(
      Array.from({ length: transitionsList?.length ?? 0 }, () =>
        createRef<HTMLInputElement>()
      ))
  }, [transitionsList])

  // Re-retrieve transitions when the id list changes (i.e. on new transition)
  useEffect(() => {
    retrieveTransitions()
  }, [idList])

  const resetInputFields = () => {
    setReadValue('')
  }

  const createNewTransition = () => {
    const newId = createTransition({ from: fromState, to: toState })
    setIdList([...idList, newId])
    return newId
  }

  const deleteTransition = (index: number) => {
    const delId = idList[index]
    removeTransitions([delId])
    setIdList(idList.filter((_, i) => i !== index))
  }

  const handleIndexDown = () => {
    const nextIndex = selectedIndex < 0 ? -1 : selectedIndex - 1
    const nextInputRef = nextIndex >= 0 ? transitionListRef[nextIndex] : inputRef
    const ro = nextInputRef as RefObject<HTMLInputElement>
    setSelectedIndex(nextIndex)
    ro?.current.focus()
  }

  const handleIndexUp = () => {
    if (selectedIndex < transitionListRef?.length - 1) {
      const prevIndex = selectedIndex === transitionListRef?.length - 1 ?? 0
        ? transitionListRef?.length - 1 ?? 0
        : selectedIndex + 1
      const prevInputRef = transitionListRef[prevIndex]
      const ro = prevInputRef as RefObject<HTMLInputElement>
      setSelectedIndex(prevIndex)
      ro?.current.focus()
    }
  }

  const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Enter':
        if (selectedIndex === -1) {
          saveNewTransition()
        } else {
          handleIndexDown()
        }
        break
      case 'ArrowDown':
        handleIndexDown()
        break
      case 'ArrowUp':
        handleIndexUp()
        break
    }
  }

  /** Helper function to simplify slicing lists.
   *  Slices a new copy of the the list and sets it using the setter function
   */
  const sliceListState = <T, >(state: T[], setter: (newList: T[]) => void, v: T, i: number) => {
    setter([...state.slice(0, i), v, ...state.slice(i + 1)])
  }

  /**
   * Functions for FSAs
   */
  const saveFSATransition = ({ id, read }) => {
    editTransition({ id, read })
    retrieveTransitions()
  }

  const saveNewFSATransition = () => {
    const newId = createNewTransition()
    editTransition({
      id: newId,
      read: formatInput(readValue, orOperator)
    } as FSAAutomataTransition)
    resetInputFields()
  }

  const blankFSAInput = () => (
    <InputWrapper>
      <Input
        ref={inputRef}
        value={readValue}
        onChange={(e) => setReadValue(e.target.value)}
        onClick={() => setSelectedIndex(-1)}
        onKeyUp={handleKeyUp}
        onFocus={(e) => {
          e.target.select()
          setSelectedIndex(-1)
        }}
        placeholder={'λ (New transition)'}
      />
      <SubmitButton onClick={saveNewTransition} tabIndex={-1}>
        <CornerDownLeft size="18px" />
      </SubmitButton>
    </InputWrapper>
  )

  const fsaInputField = (t: FSAAutomataTransition, i: number) => {
    return <InputWrapper key={i}>
      <Input
        ref={transitionListRef[i] ?? null}
        value={readList[i]}
        onChange={e => {
          sliceListState(readList, setReadList, e.target.value, i)
        }}
        onClick={() => setSelectedIndex(i)}
        onKeyUp={handleKeyUp}
        onFocus={(e) => {
          e.target.select()
          setSelectedIndex(i)
        }}
        onBlur={() => saveFSATransition({
          id: t.id,
          read: formatInput(readList[i], orOperator)
        })}
        placeholder={'λ'}
      />
      <SubmitButton onClick={() => deleteTransition(i)} tabIndex={-1}>
        <X size="18px" />
      </SubmitButton>
    </InputWrapper>
  }
  
  const saveNewTransition = () => {
      saveNewFSATransition()
    inputRef.current.focus()
  }

  /**
   * Modal contents
   */

  if (!transitionsList) return null

  const contents = () => {
    assertType<Array<FSAAutomataTransition>>(transitionsList)
    return (
      <>
        {transitionsList.map((t, i) => fsaInputField(t, i)).reverse()}
        <hr />
        Add a new transition?
        {blankFSAInput()}
      </>
    )
  }

  return (
    <Modal
      title="Transition Edge Editor"
      description={
        'Editing transition from ' + fromName + ' to ' + toName + '.'
      }
      isOpen={modalOpen}
      onClose={() => {
        commit()
        setModalOpen(false)
        resetInputFields()
      }}
      actions={
        <Button
          onClick={() => {
            commit()
            setModalOpen(false)
            resetInputFields()
          }}
        >
          Done
        </Button>
      }
    >
      {contents()}
    </Modal>
  )
}

export default InputTransitionGroupExpression
