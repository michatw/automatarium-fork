import { create, SetState, GetState } from 'zustand'
import { persist } from 'zustand/middleware'
import produce, { current } from 'immer'
import clone from 'lodash.clonedeep'
import isEqual from 'lodash.isequal'
import {v4 as uuidv4} from 'uuid';

import { randomProjectName } from '../util/projectName'

import {
  Project,
  BaseAutomataTransition,
  AutomataState,
  ProjectConfig,
  ProjectComment,
  Template,
  CopyDataProject,
  ProjectType,
  ProjectGraph
} from '../types/ProjectTypes'

import {
  APP_VERSION,
  SCHEMA_VERSION,
  DEFAULT_STATE_PREFIX_TASK_PROJECT,
  DEFAULT_OR_OPERATOR,
  DEFAULT_PROJECT_TYPE,
  DEFAULT_ACCEPTANCE_CRITERIA,
  DEFAULT_PROJECT_COLOR,
  DEFAULT_STATE_PREFIX_SOLUTION_PROJECT
} from '/src/config'
import { expandTransitions } from '@automatarium/simulation/src/utils'

import { PASTE_POSITION_OFFSET } from 'frontend/src/config/rendering'
import { logger } from 'shared/logging'

/**
 * Normal project, except it has extra information to identify it
 */
export type StoredProject = Project & {_id: string, userid?: string}

export enum InsertGroupResponseTypeProject {
  FAIL = 1,
  SUCCESS
}

type InsertGroupResponse = {
  type: InsertGroupResponseTypeProject.FAIL,
  body: string
} | {
  type: InsertGroupResponseTypeProject.SUCCESS,
  body: Template | CopyDataProject
}

export const createNewProject = (projectType: ProjectType = DEFAULT_PROJECT_TYPE): StoredProject => ({
  projectType,
  _id: uuidv4(),
  states: [],
  transitions: [],
  comments: [],
  simResult: [],
  tests: {
    single: '',
    batch: ['']
  },
  initialState: null,
  initialStateSolution: null,
  isSolutionVisible: true,
  grade: null,
  meta: {
    name: randomProjectName(),
    dateCreated: new Date().getTime(),
    dateEdited: new Date().getTime(),
    version: SCHEMA_VERSION,
    automatariumVersion: APP_VERSION
  },
  config: {
    type: projectType,
    statePrefixTask: DEFAULT_STATE_PREFIX_TASK_PROJECT,
    statePrefixSolution: DEFAULT_STATE_PREFIX_SOLUTION_PROJECT,
    orOperator: DEFAULT_OR_OPERATOR,
    acceptanceCriteria: DEFAULT_ACCEPTANCE_CRITERIA,
    color: DEFAULT_PROJECT_COLOR[projectType]
  }
})

/**
 * Returns the next ID for a list of items. This doesn't get the next available ID
 * but instead returns the number of the highest
 * e.g. [1, 4, 7] next ID would be 8
 */
const nextIDFor= (elementArr: {id: number}[]): number => {
  // We can't do elementArr.length + 1 since that might reuse an ID from a deleted item.
  // Order also is guaranteed so we can't just get the last element.
  return 1 + Math.max(-1, ...elementArr.map(e => e.id))
}

const nextModeIDFor = (elementArr: {modeID: number}[]): number => {
  return 1 + Math.max(-1, ...elementArr.map(e => e.modeID))
}

interface ProjectStore {
  project: StoredProject,
  // Can't work this one out
  history: StoredProject[],
  historyPointer: number,
  lastChangeDate: number,
  lastSaveDate: number,
  set: (project: StoredProject) => void,
  /**
   * Updates the current project. This doesn't reset the history like `set`
   * @param project
   */
  update: (project: StoredProject) => void,
  commit: () => void,
  undo: () => void,
  redo: () => void,
  setLastSaveDate: (lastSaveDate: number) => void,
  setName: (name: string) => void,
  setGrade: (grade: boolean) => void,
  createTransition: (transition: Omit<BaseAutomataTransition, 'id' | 'read'>) => number,
  editTransition: (transition: Omit<BaseAutomataTransition, 'from' | 'to'>) => void,
  moveTransition: (transition: Omit<BaseAutomataTransition, 'read'>) => void,
  createComment: (comment: Omit<ProjectComment, 'id'>) => number,
  updateComment: (comment: Partial<ProjectComment>) => void,
  updateComments: (comments: Partial<ProjectComment>[]) => void,
  removeComment: (comment: ProjectComment) => void,
  createState: (state: Omit<AutomataState, 'isFinal' | 'id' | "modeID"> & {isFinal?: boolean}) => number,
  updateState: (state: Partial<AutomataState>) => void,
  updateStates: (states: Partial<AutomataState>[]) => void,
  insertGroup: (createData: Template | CopyDataProject, isTemplate?: boolean) => InsertGroupResponse,
  setSingleTest: (value: string) => void,
  addBatchTest: (value?: string) => void,
  updateBatchTest: (index: number, value: string) => void,
  removeBatchTest: (index: number) => void,
  setStateInitial: (stateID: number) => void,
  setSolutionInitial: (stateID: number) => void,
  toggleStatesFinal: (stateIDs: number[]) => void,
  flipTransitions: (transitionIDs: number[]) => void,
  removeStates: (stateIDs: number[]) => void,
  removeTransitions: (transitionIDs: number[]) => void,
  removeComments: (commentIDs: number[]) => void,
  updateConfig: (newConfig: Partial<ProjectConfig>) => void,
  /**
   * Returns just a copy of the project graph.
   * This expands transitions if needed
   */
  getGraph: () => ProjectGraph,
  /**
   * Updates the current project graph with the graph passed
   */
  updateGraph: (graph: ProjectGraph) => void,
  reset: () => void,
  setBlockID: (stateID: number, blockID: number) => void,
  resetBlockID: () => void
}

/**
 * Updates an item with the same ID from a list of items.
 * Expects the item to exist in items
 */
const updateById = <T extends {id: number}>(items: T[], item: Partial<T>) => {
  const index = items.findIndex(x => x.id === item.id)
  items[index] = { ...items[index], ...item }
}

const useProjectStore = create<ProjectStore>()(persist((set: SetState<ProjectStore>, get: GetState<ProjectStore>) => ({
  project: null as StoredProject,
  history: [],
  historyPointer: null,
  lastChangeDate: null,
  lastSaveDate: null,

  set: (project: StoredProject) => { set({ project, history: [clone(project)], historyPointer: 0 }) },

  update: (project: StoredProject) => set(produce((state: ProjectStore) => {
    state.project = project
  })),

  /* Add current project state to stored history of project states */
  commit: () => set(produce((state: ProjectStore) => {
    // Check whether anything changed before committing
    const didChange = !isEqual(current(state.history[state.historyPointer]), current(state.project))
    if (!didChange) { return }
    // Delete the future
    state.history = state.history.slice(0, state.historyPointer + 1)

    // Add new history
    state.history.push(clone(state.project))

    // Reset pointer
    state.historyPointer = state.history.length - 1

    // Update edited date
    state.lastChangeDate = new Date().getTime()
  })),

  undo: () => set(produce((state: ProjectStore) => {
    // Can we undo?
    if (state.historyPointer === 0) { return }
    // Move pointer
    state.historyPointer--

    // Update project
    state.project = state.history[state.historyPointer]

    // Update edited date
    state.lastChangeDate = new Date().getTime()
  })),

  redo: () => set(produce((state: ProjectStore) => {
    // Can we redo?
    if (state.historyPointer === state.history.length - 1) { return }

    // Move pointer
    state.historyPointer++

    // Update project
    state.project = state.history[state.historyPointer]

    // Update edited date
    state.lastChangeDate = new Date().getTime()
  })),

  /* Change the date the project was last saved */
  setLastSaveDate: (lastSaveDate: number) => set({ lastSaveDate }),

  /* Change the projects name */
  setName: (name: string) => set((s: ProjectStore) => ({
    project: { ...s.project, meta: { ...s.project.meta, name } },
    lastChangeDate: new Date().getTime()
  })),

  /* Change the projects grade */
  setGrade: (grade: boolean) => set((s: ProjectStore) => ({
    project: { ...s.project, grade },
    lastChangeDate: new Date().getTime()
  })),

  /* Create a new transition */
  createTransition: transition => {
    const id = nextIDFor(get().project.transitions)
    set(produce(({ project }) => {
      project.transitions.push({ ...transition, id })
    }))
    return id
  },

  editTransition: newTransition => set(produce(({ project }: { project: StoredProject }) => {
    // Refactor types to enums later
    const ti = project.transitions.findIndex(t => t.id === newTransition.id)
    // Merge the new transition info with existing transition info
    project.transitions[ti] = { ...project.transitions[ti], ...newTransition }
  })),

  // Same as edit but restricted to from/to edits. Should they be the same function?
  moveTransition: newTransition => set(produce(({ project }: { project: StoredProject }) => {
    // Refactor types to enums later
    const ti = project.transitions.findIndex(t => t.id === newTransition.id)
    // Merge the new transition info with existing transition info
    project.transitions[ti] = { ...project.transitions[ti], ...newTransition }
  })),

  /* Create a new comment */
  createComment: comment => {
    const id = nextIDFor(get().project.comments)
    set(produce(({ project }: { project: StoredProject }) => {
      project.comments.push({ ...comment, id })
    }))
    return id
  },

  /* Update a comment by id */
  updateComment: comment => set(produce(({ project }: { project: StoredProject }) => {
    updateById(project.comments, comment)
  })),

  updateComments: comments => set(produce(({ project }: { project: StoredProject }) => {
    for (const comment of comments) {
      updateById(project.comments, comment)
    }
  })),

  /* Remove a comment by id */
  removeComment: (comment: ProjectComment) => set(produce(({ project }: { project: StoredProject }) => {
    project.comments = project.comments.filter((cm: ProjectComment) => cm.id !== comment.id)
  })),

  /* Create a new state */
  createState: state => {
    const id = nextIDFor(get().project.states)
    const modeID = nextModeIDFor(get().project.states.filter(s => s.mode === state.mode))
    logger.debug(__filename, "id = ", id, "modeID = ", modeID, "state = ", state, "filterd states = ", get().project.states.filter(s => s.mode === state.mode))
    set(produce(({ project }: { project: StoredProject }) => {
      project.states.push({ ...state, id, modeID, isFinal: state.isFinal ?? false })
    }))
    return id
  },

  /* Update a state by id */
  updateState: state => set(produce(({ project }: { project: StoredProject }) => {
    updateById(project.states, state)
  })),

  updateStates: states => set(produce(({ project }: { project: StoredProject }) => {
    for (const state of states) {
      updateById(project.states, state)
    }
  })),

  /* Remove a state by id */
  removeState: (state: AutomataState) => set(produce(({ project }: { project: StoredProject }) => {
    project.states = project.states.filter((st: AutomataState) => st.id !== state.id)
  })),

  insertGroup: (createData, isTemplate = false) => {
    // Check that we are inserting into same project type
    if (createData.projectType !== get().project.projectType) {
      return { type: InsertGroupResponseTypeProject.FAIL, body: `You cannot insert elements from a ${createData.projectType} project into a ${get().project.projectType} project.` }
    }
    // Check that for transitions being inserted, to and from states are also inserted
    const stateIDs = new Set(createData.states.map(it => it.id))
    for (const transition of createData.transitions) {
      const hasTo = stateIDs.has(transition.to)
      const hasFrom = stateIDs.has(transition.from)
      // If either `to` or `from` is missing then return an error
      if (!(hasTo && hasFrom)) {
        return { type: InsertGroupResponseTypeProject.FAIL, body: 'Sorry, there was an error.' }
      }
    }
    set(produce(({ project }: { project }) => {
      let isInitialStateUpdated = false
      const isNewProject = createData.projectSource !== project._id
      const positionOffset = isTemplate ? 0 : PASTE_POSITION_OFFSET
      const newTransitions = structuredClone(createData.transitions)
      newTransitions.forEach(transition => {
        transition.from = null
        transition.to = null
      })

      const nextStateId = nextIDFor(project.states)
      createData.states.forEach((state, i) => {
        // TODO: ensure position isn't out of window
        // Probably will have to take adjusting position out of this function
        [state.x, state.y] = [state.x + positionOffset, state.y + positionOffset]
        const newId = nextStateId+ i
        // Update transitions to new state id
        createData.transitions.forEach((transition, i) => {
          if (transition.from === state.id && newTransitions[i].from === null) {
            newTransitions[i].from = newId
          }
          if (transition.to === state.id && newTransitions[i].to === null) {
            newTransitions[i].to = newId
          }
        })
        // Update initial state id if applicable
        if (createData.initialStateId === state.id && !isInitialStateUpdated) {
          createData.initialStateId = newId
          isInitialStateUpdated = true
        }
        state.id = newId
        // createState
        project.states.push({ ...state })
      })
      createData.transitions = newTransitions

      const nextCommentId = nextIDFor(project.comments)
      createData.comments.forEach((comment, i) => {
        // TODO: ensure position isn't out of window
        [comment.x, comment.y] = [comment.x + positionOffset, comment.y + positionOffset]
        comment.id = nextCommentId + i
        // createComment
        project.comments.push({ ...comment })
      })

      const nextTransitionId = nextIDFor(project.transitions)
      createData.transitions.forEach((transition, i) => {
        transition.id = nextTransitionId + i
        // createTransition
        project.transitions.push({ ...transition })
      })

      if (isNewProject && createData.initialStateId !== null && project.initialState === null) {
        project.initialState = createData.initialStateId
      }
    }))
    return { type: InsertGroupResponseTypeProject.SUCCESS, body: createData }
  },

  /* Update tests */
  setSingleTest: (value: string) => set(produce((state: ProjectStore) => {
    state.project.tests.single = value
    state.lastChangeDate = new Date().getTime()
  })),

  addBatchTest: value => set(produce((state: ProjectStore) => {
    value = value ?? ''
    state.project.tests.batch.push(value)
    state.lastChangeDate = new Date().getTime()
  })),

  updateBatchTest: (index: number, value: string) => set(produce((state: ProjectStore) => {
    state.project.tests.batch[index] = value
    state.lastChangeDate = new Date().getTime()
  })),

  removeBatchTest: index => set(produce((state: ProjectStore) => {
    state.project.tests.batch.splice(index, 1)
    state.lastChangeDate = new Date().getTime()
  })),

  /* Set given state to be the initial state */
  setStateInitial: (stateID: number) => set((s: ProjectStore) => ({ project: { ...s.project, initialState: stateID } })),

  /* Set a given state to be the solutions initial state*/
  setSolutionInitial: (stateID: number) => set((s: ProjectStore) => ({ project: { ...s.project, initialStateSolution: stateID } })),

  /* Set all provided states as final */
  toggleStatesFinal: (stateIDs: number[]) => set(produce(({ project }: {project: StoredProject}) => {
    project.states = project.states.map(state => ({ ...state, isFinal: stateIDs.includes(state.id) ? !state.isFinal : state.isFinal }))
  })),

  /* Toggle direction of transitions */
  flipTransitions: (transitionIDs: number[]) => set(produce(({ project }: {project: StoredProject}) => {
    project.transitions = project.transitions.map(t => transitionIDs.includes(t.id)
      ? ({
          ...t,
          from: t.to,
          to: t.from
        })
      : t)
  })),

  /* Remove states by id */
  removeStates: (stateIDs: number[]) => set(produce(({ project }: {project: StoredProject}) => {
    // Remove states
    project.states = project.states.filter((st: AutomataState) => !stateIDs.includes(st.id))

    // Remove associated transitions
    project.transitions = project.transitions.filter((t: BaseAutomataTransition) => !stateIDs.includes(t.from) && !stateIDs.includes(t.to))

    // Remove initial state if deleted
    if (stateIDs.includes(project.initialState)) {
      project.initialState = null
    }

    // Remove initial state solution if deleted
    if (stateIDs.includes(project["initialStateSolution"])) {
      project["initialStateSolution"] = null
    }
  })),

  /* Remove transitions by id */
  removeTransitions: (transitionIDs: number[]) => set(produce(({ project }: {project: StoredProject}) => {
    project.transitions = project.transitions.filter((t: BaseAutomataTransition) => !transitionIDs.includes(t.id))
  })),

  /* Remove comments by id */
  removeComments: (commentIDs: number[]) => set(produce(({ project }: {project: StoredProject}) => {
    project.comments = project.comments.filter(c => !commentIDs.includes(c.id))
  })),

  // Change the config
  updateConfig: newConfig => set(produce((state: ProjectStore) => {
    state.project.config = { ...state.project.config, ...newConfig }
    state.lastChangeDate = new Date().getTime()
  })),

  getGraph: () => {
    const project = get().project
    return {
      initialState: project.initialState,
      projectType: project.projectType,
      states: project.states,
      transitions: expandTransitions(project.transitions)
    } as ProjectGraph
  },

  updateGraph: graph => set(produce(({ project }: { project: StoredProject}) => {
    project.transitions = graph.transitions
    project.states = graph.states
    project.initialState = graph.initialState
    project["initialStateSolution"] = graph["initialStateSolution"]
  })),

  setBlockID: (stateID: number, blockID: number) => set(produce((state: ProjectStore) => {
    state.project.states.find(s => s.id === stateID).blockID = blockID
  })),

  resetBlockID: () => set(produce((state: ProjectStore) => {
    state.project.states.forEach(state => {
      state.blockID = null
    })
  })),

  reset: () => set({ project: createNewProject(), history: [], historyPointer: 0, lastChangeDate: -1, lastSaveDate: -1 })
}), {
  name: 'automatarium-project'
}))

export default useProjectStore
