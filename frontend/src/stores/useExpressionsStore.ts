import { create, SetState } from 'zustand'
import { persist } from 'zustand/middleware'
import { StoredExpression } from './useExpressionStore'

interface ExpressionsStore {
  expressions: StoredExpression[],
  setExpressions: (projects: StoredExpression[]) => void,
  clearExpressions: () => void,
  upsertExpression: (project: StoredExpression) => void,
  deleteExpression: (pid: string) => void,
}

const useExpressionsStore = create<ExpressionsStore>()(persist((set: SetState<ExpressionsStore>) => ({
  expressions: [] as StoredExpression[],
  setExpressions: (expressions: StoredExpression[]) => set({ expressions }),
  clearExpressions: () => set({ expressions: [] }),
  upsertExpression: expression => set(s => ({
    expressions: s.expressions.find(e => e._id === expression._id)
      ? s.expressions.map(e => e._id === expression._id ? expression : e)
      : [...s.expressions, expression]
  })),
  deleteExpression: eid => set(s => ({ expressions: s.expressions.filter(e => e._id !== eid) }))
}), {
  name: 'automatarium-expressions'
}))

export default useExpressionsStore