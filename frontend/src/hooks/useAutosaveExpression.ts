import { useEffect } from 'react'

import dayjs from 'dayjs'
import { useExpressionStore } from '../stores'
import useExpressionsStore from '../stores/useExpressionsStore'

const SAVE_INTERVAL = 5 * 1000

/**
 * Use this to save the expression on an interval. The expression will only save if there are changes
 * and there are items in the expression.
 * @see SAVE_INTERVAL
 */
const useAutosaveExpression = () => {
    const upsertExpression = useExpressionsStore(s => s.upsertExpression)
    const lastChangeDate = useExpressionStore(s => s.lastChangeDate)
    const lastSaveDate = useExpressionStore(s => s.lastSaveDate)
    const setLastSaveDate = useExpressionStore(s => s.setLastSaveDate)
    const getComments = useExpressionStore(s => s.getComments)
    const getStates = useExpressionStore(s => s.getStates)
    const getTransitions = useExpressionStore(s => s.getTransitions)

    useEffect(() => {
        const timer = setInterval(() => {
            const currentExpression = useExpressionStore.getState().expression

            const totalItems = getComments().length + getStates().length + getTransitions().length
            // Only save if there has been a change and there is something in the project
            if ((!lastSaveDate || dayjs(lastChangeDate).isAfter(lastSaveDate)) && totalItems > 0) {
                const toSave = { ...currentExpression }
                upsertExpression(toSave)
                setLastSaveDate(new Date().getTime())
            }
        }, SAVE_INTERVAL)
        return () => clearInterval(timer)
    })
}

export default useAutosaveExpression
