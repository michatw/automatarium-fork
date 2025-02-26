import { useExpressionStore, useProjectStore } from '/src/stores'

import useResourceDragging from './useResourceDragging'
import { ProjectComment } from '/src/types/ProjectTypes'
import { EXPRESSION_TYPE, PROJECT_TYPE } from 'shared/constants'

/**
 * Comment that doesn't have an optional ID (it is guaranteed to be set).
 * Since the filter only allows set IDs we can safely know this
 */
type CommentWithID = Omit<ProjectComment, 'id'> & {id: number}

const commentsFromIDsProject = (IDs: number[]): CommentWithID[] => {
  const comments = useProjectStore.getState()?.project?.comments ?? []
  return comments.filter(comment => IDs.includes(comment.id)) as CommentWithID[]
}

const commentsFromIDsExpression = (IDs: number[]): CommentWithID[] => {
  const comments = useExpressionStore.getState()?.getComments() ?? []
  return comments.filter(comment => IDs.includes(comment.id)) as CommentWithID[]
}

const makeUpdateCommentsProject = () => useProjectStore(s => s.updateComments)

const makeUpdateCommentsExpression = () => useExpressionStore(s => s.updateComments)

export default (type: string) => {
  if (type === PROJECT_TYPE) {
    return useResourceDragging(commentsFromIDsProject, makeUpdateCommentsProject)
  } else if (type === EXPRESSION_TYPE) {
    return useResourceDragging(commentsFromIDsExpression, makeUpdateCommentsExpression)
  }
}
