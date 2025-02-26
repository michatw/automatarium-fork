import { create, SetState } from 'zustand'
import { ColourName } from '/src/config'

/**
 * Possible option for the background in the image
 */
export type Background = 'none' | 'solid' | 'grid'

interface Options {
  filename: string
  type: string
  margin: number
  color: ColourName | ''
  darkMode: boolean
  background: Background
}

interface ExportStore {
  exportVisible: boolean
  options: Options

  setExportVisible: (exportVisible: boolean) => void
  setOptions: (options: Partial<Options>) => void
  reset: () => void
}

const defaultOptions: Options = {
  filename: '',
  type: 'png',
  margin: 20,
  color: '',
  darkMode: false,
  background: 'solid'
}

const useExportStore = create<ExportStore>((set: SetState<ExportStore>) => ({
  exportVisible: false,
  options: { ...defaultOptions },

  setExportVisible: (exportVisible: boolean) => set({ exportVisible }),
  setOptions: (options: Partial<Options>) => set(state => ({ options: { ...state.options, ...options } })),
  reset: () => set({ options: { ...defaultOptions } })
}))

export default useExportStore
