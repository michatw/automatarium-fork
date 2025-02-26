import { useState, useEffect, useRef, useMemo, HTMLAttributes } from 'react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { Button, Logo, Dropdown } from '/src/components'
import { useEvent } from '/src/hooks'
import { useExpressionStore, useProjectStore } from '/src/stores'
import { dispatchCustomEvent } from '/src/util/events'

import {
  Wrapper,
  Menu,
  Name,
  NameRow,
  SaveStatus,
  DropdownMenus,
  Actions,
  DropdownButtonWrapper,
  NameInput
} from './menubarStyle'

import menusExpression from './menusExpression'
import { ContextItem } from '/src/components/ContextMenus/contextItem'
import useExpressionsStore from '/src/stores/useExpressionsStore'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import ToggleButton from 'react-bootstrap/ToggleButton'
import { SOLUTION_MODE, TASK_MODE } from 'shared/constants'

// Extend dayjs
dayjs.extend(relativeTime)

interface DropdownButton extends HTMLAttributes<HTMLButtonElement> {
  item: ContextItem
  dropdown: string
  setDropdown: (x: undefined) => void
  setErrorMessage: (string) => void
}

const DropdownButton = ({ item, dropdown, setDropdown, setErrorMessage, ...props }: DropdownButton) => {
  const buttonRef = useRef<HTMLButtonElement>()
  const [rect, setRect] = useState<DOMRect>()

  useEffect(() => {
    buttonRef.current && setRect(buttonRef.current.getBoundingClientRect())
  }, [buttonRef.current])

  return (
    <>
      <DropdownButtonWrapper
        type="button"
        ref={buttonRef}
        $active={dropdown === item.label}
        {...props}
      >{item.label}</DropdownButtonWrapper>

      <Dropdown
        style={{
          top: `${rect?.y + rect?.height + 10}px`,
          left: `${rect?.x}px`
        }}
        items={item.items}
        visible={dropdown === item.label}
        onClose={() => setDropdown(undefined)}
        setErrorMessage={setErrorMessage}
      />
    </>
  )
}

const MenubarExpression = ({mode, setMode, isTask, grade, setErrorMessage}) => {
  let backgroundColor = '#6c757d'
  if (grade == false){
    backgroundColor = 'red'
  } else if (grade == true){
    backgroundColor = 'green'
  }
  
  const navigate = useNavigate()
  const [dropdown, setDropdown] = useState<string>()

  const titleRef = useRef<HTMLInputElement>()
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState('')

  const expression = useExpressionStore(s => s.expression)
  const expressionName = useExpressionStore(s => s.expression.meta.name)
  const setExpressionName = useExpressionStore(s => s.setName)
  const setLastSaveDate = useExpressionStore(s => s.setLastSaveDate)
  const upsertExpression = useExpressionsStore(s => s.upsertExpression)

  const lastSaveDate = useProjectStore(s => s.lastSaveDate)
  const lastChangeDate = useProjectStore(s => s.lastChangeDate)
  // Determine whether saving
  const isSaving = useMemo(() => !(!lastChangeDate || dayjs(lastSaveDate).isAfter(lastChangeDate)), [lastChangeDate, lastSaveDate])

  const handleEditExpressionName = () => {
    setTitleValue(expressionName ?? '')
    setEditingTitle(true)
    window.setTimeout(() => titleRef.current?.select(), 50)
  }

  const saveExpression = () => {
    const expression = useExpressionStore.getState().expression
    upsertExpression({ ...expression, meta: { ...expression.meta, dateEdited: new Date().getTime() } })
    setLastSaveDate(new Date().getTime())
  }

  const handleSaveExpressionName = () => {
    if (titleValue && !/^\s*$/.test(titleValue)) {
      setExpressionName(titleValue)
      saveExpression()
    }
    setEditingTitle(false)
  }

  useEvent('beforeunload', e => {
    if (!isSaving) return
    e.preventDefault()
    return 'Your expression isn\'t saved yet, are you sure you want to leave?'
  }, [isSaving], { options: { capture: true }, target: window })

  const radios = [
    { name: 'Task', value: TASK_MODE },
    { name: 'Solution', value: SOLUTION_MODE }
  ];

  return (
    <>
      <Wrapper>
        <Menu>
          <a href="/new" onClick={e => {
            e.preventDefault()
            if (isSaving) {
              // If there are unsaved changes, save and then navigate
              saveExpression()
            }
            navigate('/new')
          }}>
            <Logo />
          </a>

          <div>
            <NameRow>
              {editingTitle
                ? (
                <NameInput
                  value={titleValue}
                  onChange={e => setTitleValue(e.target.value)}
                  onBlur={handleSaveExpressionName}
                  onKeyDown={e => e.code === 'Enter' && handleSaveExpressionName()}
                  ref={titleRef}
                />
                  )
                : (
                <Name onClick={handleEditExpressionName} title="Edit title">{expressionName ?? 'Untitled Project'}</Name>
                  )}
              <SaveStatus $show={isSaving}>Saving...</SaveStatus>
            </NameRow>
            <DropdownMenus>
              {menusExpression.map((item: ContextItem) => (
                <DropdownButton
                  key={item.label}
                  item={item}
                  dropdown={dropdown}
                  setDropdown={setDropdown}
                  onClick={e => { setDropdown(dropdown === item.label ? undefined : item.label); e.stopPropagation() }}
                  onMouseEnter={() => dropdown !== undefined && setDropdown(item.label)}
                  setErrorMessage={setErrorMessage}
                />
              ))}
            </DropdownMenus>
          </div>
        </Menu>
        {isTask && <div style={{ backgroundColor: backgroundColor, borderRadius: '50%', width: '20px', height: '20px', display: 'inline-block', marginRight: '10px', border: '1px solid white'}}/>}
        <ButtonGroup>
        {isTask && radios.map((radio, idx) => (
          <ToggleButton
            key={idx}
            id={`radio-${idx}`}
            type="radio"
            name="radio"
            variant="secondary"
            value={radio.value}
            checked={mode == radio.value}
            onChange={(e) => setMode(e.currentTarget.value)}
            disabled={radio.value === SOLUTION_MODE && !expression['isSolutionVisible']}
          >
            {radio.name}
          </ToggleButton>
        ))}
      </ButtonGroup>
        <Actions>
          {<Button onClick={() => dispatchCustomEvent('showSharingExpression', null)}>Share</Button>}
        </Actions>
      </Wrapper>
    </>
  )
}

export default MenubarExpression
