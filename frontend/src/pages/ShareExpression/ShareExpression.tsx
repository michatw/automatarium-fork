import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { useExpressionStore} from '/src/stores'

import { useParseFileExpression } from '/src/hooks/useActions'
import { showWarning } from '/src/components/Warning/Warning'
import { decodeExpressionData } from '/src/util/encoding'
import useExpressionsStore from '/src/stores/useExpressionsStore'
import { StoredExpression } from '/src/stores/useExpressionStore'
import {v4 as uuidv4} from 'uuid'
import Landing from '../Landing/Landing'

const ShareExpression = () => {
  const { type, data } = useParams()
  const navigate = useNavigate()
  const setExpression = useExpressionStore(s => s.set)
  const addExpression = useExpressionsStore(s => s.upsertExpression)
  const expressions = useExpressionsStore(s => s.expressions)
  const expression = useExpressionStore(s => s.expression)

  useEffect(() => {
    switch (type) {
      case 'raw': {
        decodeExpressionData(data).then((decodedJson) => {
          const dataJson = new File([JSON.stringify(decodedJson)], 'Shared Project')
          useParseFileExpression(onData, 'Failed to load file.', dataJson, handleLoadSuccess, handleLoadFail)
        })
        break
      }
      default: {
        showWarning(`Unknown share type ${type}`)
        handleLoadFail()
        break
      }
    }
  }, [data])

  const onData = (newExpression: StoredExpression) => {
    const existingExpression = expressions.find(e => e._id === e._id) || newExpression._id == expression._id || false

    if (existingExpression) {
      window.alert('A project with the same ID already exists. A copy will be created.');
      newExpression._id = uuidv4();
      newExpression.meta.name = `${newExpression.meta.name} (copy)`;
    }
    setExpression(newExpression)
    addExpression(newExpression)
  }

  const handleLoadSuccess = () => {
    navigate('/editorExpression')
  }

  const handleLoadFail = () => {
    navigate('/new')
  }

  return (
    <Landing></Landing>
  )
}

export default ShareExpression
