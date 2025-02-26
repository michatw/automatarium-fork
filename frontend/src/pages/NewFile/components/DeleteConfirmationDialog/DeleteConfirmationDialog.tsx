import { EXPRESSION_TYPE, PROJECT_TYPE } from 'shared/constants'
import { Button, Modal } from '/src/components'
import { useEvent } from '/src/hooks'

const DeleteConfirmationDialog = ({ ...props }) => {
  useEvent(props.type === PROJECT_TYPE ? 'modal:deleteConfirm' : props.type === EXPRESSION_TYPE? 'modal:deleteExpressionConfirm': null, () => {
    props.isOpenReducer(true);
  }, [])

  return (
    <Modal
        title={'Delete ' + props.type + '?'}
        description={'This will permanently remove your ' + props.type + ' ' + props.projectName + ' from your computer.'}
        isOpen={props.isOpen}
        onClose={props.onClose}
        role='alertdialog'
        actions={<>
          <Button secondary onClick={() => props.isOpenReducer(false)}>Cancel</Button>
          <Button onClick={props.onConfirm}>Delete</Button>
        </>}
    />
  )
}

export default DeleteConfirmationDialog
