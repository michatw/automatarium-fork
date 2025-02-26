import { useState, useEffect, useCallback, useRef, ReactNode, HTMLAttributes } from 'react'
import { ChevronRight } from 'lucide-react'

import { useActions } from '/src/hooks'

import {
  Wrapper,
  ItemWrapper,
  Shortcut,
  Divider
} from './dropdownStyle'
import { ContextItem, ContextItems } from '/src/components/ContextMenus/contextItem'
import { useMetaDataStore } from '/src/stores'

const ItemWithItems = ({ item, onClose, setErrorMessage }: { item: ContextItem, onClose: () => void, setErrorMessage: (string) => void}) => {
  const [active, setActive] = useState(false)
  const type = useMetaDataStore(s => s.selectedModelType)

  return (
    <div
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onBlur={e => !e.currentTarget.contains(e.relatedTarget) && setActive(false)}
    >
      <Item type={type} active={active} item={item} onClose={onClose} setActive={() => setActive(true)} setErrorMessage={setErrorMessage} />
      <Dropdown
        items={item.items}
        subMenu
        visible={active}
        onClose={onClose}
        setErrorMessage={setErrorMessage}
      />
    </div>
  )
}

interface ItemProps {
  type: string
  item: ContextItem
  active?: boolean
  setActive?: () => void
  onClose?: () => void
  setErrorMessage: (string) => void
}

const Item = ({item, active, setActive, onClose, setErrorMessage}: ItemProps) => {
  const actions = useActions()
  const actionHandler = item.action ? (e) => {
    try {
      actions[item.action]?.handler(e)
    } catch (error) {
      setErrorMessage(error.message)
    }
  } : null
  const hotKeyLabel = item.action ? actions[item.action]?.label : null
  const actionDisabled = actions[item.action]?.disabled?.()

  return (
    <ItemWrapper
      onClick={actionHandler ? e => {actionHandler(e); onClose()} : (item.items?.length > 0 ? setActive : undefined)}
      disabled={(!actionHandler && !item.items) || item.items?.length === 0 || actionDisabled}
      type="button"
      $active={active}
    >
      <label>{item.label}</label>
      {item.shortcut && <Shortcut aria-hidden="true">{item.shortcut}</Shortcut>}
      {!item.shortcut && hotKeyLabel && <Shortcut aria-hidden="true">{hotKeyLabel}</Shortcut>}
      {item.items && <ChevronRight size="1em" />}
    </ItemWrapper>
  )
}

interface DropdownProps extends HTMLAttributes<HTMLDivElement> {
  subMenu?: ReactNode
  visible?: boolean
  items?: ContextItems
  onClose?: () => void
  getRef?: (ref: HTMLDivElement) => void
  setErrorMessage: (string) => void
}

const Dropdown = ({
  subMenu,
  visible = true,
  items,
  onClose,
  getRef,
  setErrorMessage,
  ...props
}: DropdownProps) => {
  const type = useMetaDataStore(s => s.selectedModelType)
  const dropdownRef = useRef<HTMLDivElement>()

  // Close dropdown if click outside
  const handleClick = useCallback((e: MouseEvent) => !dropdownRef.current?.contains(e.target as Element) && onClose(), [dropdownRef.current, onClose])

  // Close dropdown if escape pressed
  const handleKey = useCallback((e: KeyboardEvent) => e.key === 'Escape' && onClose(), [onClose])

  useEffect(() => {
    if (!subMenu && visible) {
      document.addEventListener('click', handleClick)
      document.addEventListener('keydown', handleKey)
    }
    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [visible, subMenu, onClose, handleClick, handleKey])

  useEffect(() => dropdownRef.current && getRef && getRef(dropdownRef.current), [dropdownRef.current])
  if (!visible) return null
  return (
    <Wrapper
      onContextMenu={e => e.preventDefault()}
      $subMenu={subMenu}
      $visible={visible}
      ref={dropdownRef}
      // Close dropdown if focus leaves
      onBlur={e => !subMenu && visible && !e.currentTarget.contains(e.relatedTarget)}
      {...props}
    >
      {items?.map((item, i) => {
        if (item === 'hr') {
          return <Divider key={`hr-${i}`} />
        } else if (item.items) {
          return <ItemWithItems key={item.label} item={item} onClose={onClose} setErrorMessage={setErrorMessage}/>
        } else {
          return <Item type={type} key={item.label} item={item} onClose={onClose} setErrorMessage={setErrorMessage} />
        }
      })}
      {props.children}
    </Wrapper>
  )
}

export default Dropdown
