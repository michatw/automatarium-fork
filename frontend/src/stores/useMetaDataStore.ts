import { create, StoreApi } from "zustand"
import { persist } from "zustand/middleware"

interface MetaDataStore {
    selectedModelType: string | null // At the moments its either PROJECT_TYPE or EXPRESSION_TYPE
    setSelectedModelType: (type: string | null) => void
    selectedViewType: string | null // At the moment its either TASK_MODE or SOLUTION_MODE
    setSelectedViewType: (type: string | null) => void
}

// The MetaDataStore aims to store all data that is relevant but not directly related to any other store
const useMetaDataStore = create<MetaDataStore>()(persist((set: StoreApi<MetaDataStore>['setState']) => ({
    selectedModelType: null, // SelectedModelType should only be used after a project/ expression has been selected. Oterhwise its not helpful.
    setSelectedModelType: (type: string | null) => set({ selectedModelType: type }),
    selectedViewType: null,
    setSelectedViewType: (type: string | null) => set({ selectedViewType: type}),
}),
{
    name: 'automatarium-metadata'
}))

export default useMetaDataStore