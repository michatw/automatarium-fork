import { EXPRESSION_TYPE, PROJECT_TYPE } from 'shared/constants'
import Dropdown from '../Dropdown/Dropdown'
import kebabContextItemsExpression from './kebabDropdownItemsExpression'
import kebabContextItems from './kebabDropdownItemsProject'

type KebabProps = { x: number, y: number, isOpen: boolean, onClose: () => void, type: string }

const KebabMenu = (props: KebabProps) => {
  const isProject = props.type === PROJECT_TYPE
  const isExpression = props.type === EXPRESSION_TYPE

  return <Dropdown
    visible={props.isOpen}
    onClose={props.onClose}
    style={{
      position: 'absolute',
      top: `${props.y}px`,
      left: `${props.x}px`,
      borderStyle: 'solid',
      borderWidth: '0.15em',
      borderColor: 'hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.9)'
    }}
    items={isProject ? kebabContextItems : isExpression ? kebabContextItemsExpression : []}
    setErrorMessage={() => {}}
  />
}

export default KebabMenu
