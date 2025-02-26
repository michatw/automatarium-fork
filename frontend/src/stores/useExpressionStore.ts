import { create, SetState, GetState } from 'zustand'
import { persist } from 'zustand/middleware'
import produce, { current } from "immer";
import clone from 'lodash.clonedeep'
import isEqual from 'lodash.isequal'
import { CopyDataExpression, Expression, ExpressionType, TaskRegularExpression, TemplateExpression } from "../types/ExpressionTypes";
import { randomProjectName } from '../util/projectName';
import { APP_VERSION, DEFAULT_EXPRESSION_TYPE, DEFAULT_OR_OPERATOR_EXPRESSION, DEFAULT_STATE_PREFIX_SOLUTION_EXPRESSION, DEFAULT_STATE_PREFIX_TASK_EXPRESSION, SCHEMA_VERSION } from '../config';
import { AutomataState, BaseAutomataTransition, ProjectComment } from '../types/ProjectTypes';
import {v4 as uuidv4} from 'uuid';
import { PASTE_POSITION_OFFSET } from '../config/rendering';
import { SOLUTION_MODE, TASK_MODE } from 'shared';

/**
 * Normal expression, except it has extra information to identify it
 */
export type StoredExpression = Expression & {_id: string, userid?: string}

export enum InsertGroupResponseTypeExpression {
  FAIL = 1,
  SUCCESS
}

type InsertGroupResponseExpression = {
  type: InsertGroupResponseTypeExpression.FAIL,
  body: string
} | {
  type: InsertGroupResponseTypeExpression.SUCCESS,
  body: TemplateExpression | CopyDataExpression
}

export const createNewExpression = (expressionType: ExpressionType = DEFAULT_EXPRESSION_TYPE): StoredExpression => ({
    type: expressionType,
    _id: uuidv4(),
    expression: "",
    meta: {
      name: randomProjectName(),
      dateCreated: new Date().getTime(),
      dateEdited: new Date().getTime(),
      version: SCHEMA_VERSION,
      automatariumVersion: APP_VERSION
    },
    states: [],
    transitions: [],
    comments: [],
    initialState: null,
    initialStateSolution: null,
    isSolutionVisible: true,
    grade: null,
    config: {
      statePrefixTask: DEFAULT_STATE_PREFIX_TASK_EXPRESSION,
      statePrefixSolution: DEFAULT_STATE_PREFIX_SOLUTION_EXPRESSION,
      orOperator: DEFAULT_OR_OPERATOR_EXPRESSION
    }
  })

/**
 * Returns the next ID for a list of items. This doesn't get the next available ID
 * but instead returns the number of the highest
 * e.g. [1, 4, 7] next ID would be 8
 */
const nextIDFor = (elementArr: {id: number}[]): number => {
  // We can't do elementArr.length + 1 since that might reuse an ID from a deleted item.
  // Order also is guaranteed so we can't just get the last element.
  return 1 + Math.max(-1, ...elementArr.map(e => e.id))
}

const nextModeIDFor = (elementArr: {modeID: number}[]): number => {
  return 1 + Math.max(-1, ...elementArr.map(e => e.modeID))
}

interface ExpressionStore {
    expression: StoredExpression,
    // Can't work this one out
    history: StoredExpression[],
    historyPointer: number,
    lastChangeDate: number,
    lastSaveDate: number,
    set: (project: StoredExpression) => void,
    /**
     * Updates the current project. This doesn't reset the history like `set`
     * @param project
     */
    update: (project: StoredExpression) => void,
    commit: () => void,
    undo: () => void,
    redo: () => void,
    insertGroup: (createData: TemplateExpression | CopyDataExpression, isTemplate?: boolean) => InsertGroupResponseExpression,
    setLastSaveDate: (lastSaveDate: number) => void,
    setName: (name: string) => void,
    setGrade: (grade: boolean) => void,
    // Modify transitions
    setTransitions: (transitions: BaseAutomataTransition[]) => void,
    createTransition: (transition: Omit<BaseAutomataTransition, 'id' | 'read'>) => number,
    editTransition: (transition: Omit<BaseAutomataTransition, 'from' | 'to'>) => void,
    moveTransition: (transition: Omit<BaseAutomataTransition, 'read'>) => void,
    removeTransitions: (transitionIDs: number[]) => void,
    getTransitions: () => BaseAutomataTransition[],
    // Modify Comments
    setComments: (comments: ProjectComment[]) => void,
    createComment: (comment: Omit<ProjectComment, 'id'>) => number,
    updateComment: (comment: Partial<ProjectComment>) => void,
    updateComments: (comments: Partial<ProjectComment>[]) => void,
    removeComments: (commentIDs: number[]) => void,
    getComments: () => ProjectComment[],
    // Modify States
    setStates: (states: AutomataState[]) => void,
    createState: (state: Omit<AutomataState, 'isFinal' | 'id'> & {isFinal?: boolean}) => number,
    updateState: (state: Partial<AutomataState>) => void,
    updateStates: (states: Partial<AutomataState>[]) => void,
    removeStates: (stateIDs: number[]) => void,
    setStateInitial: (stateID: number) => void,
    setSolutionInitial: (stateID: number) => void,
    toggleStatesFinal: (stateIDs: number[]) => void,
    getStates: () => AutomataState[],
}

/**
 * Updates an item with the same ID from a list of items.
 * Expects the item to exist in items
 */
const updateById = <T extends {id: number}>(items: T[], item: Partial<T>) => {
  const index = items.findIndex(x => x.id === item.id)
  items[index] = { ...items[index], ...item }
}

const useExpressionStore = create<ExpressionStore>()(persist((set: SetState<ExpressionStore>, get: GetState<ExpressionStore>) => ({
    expression: null as StoredExpression,
    history: [],
    historyPointer: null,
    lastChangeDate: null,
    lastSaveDate: null,
     
    set: (expression: StoredExpression) => { set({ expression, history: [clone(expression)], historyPointer: 0 }) },

    update: (expression: StoredExpression) => set(produce((state: ExpressionStore) => {
      state.expression = expression
      state.expression.meta.dateEdited = new Date().getTime()
    })),

    commit: () => set(produce((state: ExpressionStore) => {
       // Check whether anything changed before committing
      const didChange = !isEqual(current(state.history[state.historyPointer]), current(state.expression))
      if (!didChange) { return }
      // Delete the future
      state.history = state.history.slice(0, state.historyPointer + 1)

      // Add new history
      state.history.push(clone(state.expression))

      // Reset pointer
      state.historyPointer = state.history.length - 1

      // Update edited date
      state.lastChangeDate = new Date().getTime()
    })),
    undo: () => set(produce((state: ExpressionStore) => {
      // Can we undo?
      if (state.historyPointer === 0) { return }
      // Move pointer
      state.historyPointer--
  
      // Update project
      state.expression = state.history[state.historyPointer]
  
      // Update edited date
      state.lastChangeDate = new Date().getTime()
    })),
  
    redo: () => set(produce((state: ExpressionStore) => {
      // Can we redo?
      if (state.historyPointer === state.history.length - 1) { return }
  
      // Move pointer
      state.historyPointer++
  
      // Update project
      state.expression = state.history[state.historyPointer]
  
      // Update edited date
      state.lastChangeDate = new Date().getTime()
    })),
    /* Change the date the project was last saved */
    setLastSaveDate: (lastSaveDate: number) => set({ lastSaveDate }),

    /* Change the projects name */
    setName: (name: string) => set((s: ExpressionStore) => ({
      expression: { ...s.expression, meta: { ...s.expression.meta, name }},
      lastChangeDate: new Date().getTime()
    })),

    /* Change the projects grade */
    setGrade: (grade: boolean) => set((s: ExpressionStore) => ({
      expression: { ...s.expression, grade },
      lastChangeDate: new Date().getTime()
    })),

    /* Set transitions */
    setTransitions(transitions: BaseAutomataTransition[]) {
      set(produce(({ expression }: { expression: StoredExpression }) => {
        expression.transitions = transitions
      }))
    },

    /* Create a new transition */
    createTransition: transition => {
      const expression = get().expression
      const id = nextIDFor(expression.transitions)
      set(produce(({ expression }) => {
        expression.transitions.push({ ...transition, id })
      }))
      return id
    },

    insertGroup: (createData, isTemplate = false) => {
      // Check that we are inserting into same project type
      if (createData.expressionType !== get().expression.type) {
        return { type: InsertGroupResponseTypeExpression.FAIL, body: `You cannot insert elements from a ${createData.expressionType} expression into a ${get().expression.type} project.` }
      }
      // Check that for transitions being inserted, to and from states are also inserted
      const stateIDs = new Set(createData.states.map(it => it.id))
      for (const transition of createData.transitions) {
        const hasTo = stateIDs.has(transition.to)
        const hasFrom = stateIDs.has(transition.from)
        // If either `to` or `from` is missing then return an error
        if (!(hasTo && hasFrom)) {
          return { type: InsertGroupResponseTypeExpression.FAIL, body: 'Sorry, there was an error.' }
        }
      }
      set(produce(({ expression }: { expression }) => {
        let isInitialStateUpdated = false
        const isNewExpression = createData.expressionSource !== expression._id
        const positionOffset = isTemplate ? 0 : PASTE_POSITION_OFFSET
        const newTransitions = structuredClone(createData.transitions)
        newTransitions.forEach(transition => {
          transition.from = null
          transition.to = null
        })

        const nextStateId = nextIDFor(expression["states"])
        createData.states.forEach((state, i) => {
          // TODO: ensure position isn't out of window
          // Probably will have to take adjusting position out of this function
          [state.x, state.y] = [state.x + positionOffset, state.y + positionOffset]
          const newId = nextStateId + i
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
          expression["states"].push({ ...state })
        })

        createData.transitions = newTransitions
        const nextCommentId = nextIDFor(expression["comments"])
        createData.comments.forEach((comment, i) => {
          // TODO: ensure position isn't out of window
          [comment.x, comment.y] = [comment.x + positionOffset, comment.y + positionOffset]
          comment.id = nextCommentId + i
          // createComment
          expression["comments"].push({ ...comment })
        })

        const nextTransitionId = nextIDFor(expression["transitions"])
        createData.transitions.forEach((transition, i) => {
          transition.id = nextTransitionId + i
          // createTransition
          expression["transitions"].push({ ...transition })
        })

        if (isNewExpression && createData.initialStateId !== null && expression["initialState"] === null) {
          expression["initialState"] = createData.initialStateId
        }
      }))
      return { type: InsertGroupResponseTypeExpression.SUCCESS, body: createData }
    },

    editTransition: newTransition => set(produce(({ expression }: { expression: StoredExpression }) => {
      // Refactor types to enums later
      const ti = expression.transitions.findIndex(t => t.id === newTransition.id)
      // Merge the new transition info with existing transition info
      expression.transitions[ti] = { ...expression.transitions[ti], ...newTransition }
    })),

    // Same as edit but restricted to from/to edits. Should they be the same function?
    moveTransition: newTransition => set(produce(({ expression }: { expression: StoredExpression }) => {
      // Refactor types to enums later
      const ti = expression.transitions.findIndex(t => t.id === newTransition.id)
      // Merge the new transition info with existing transition info
      expression.transitions[ti] = { ...expression.transitions[ti], ...newTransition }
    })),

      /* Remove transitions by id */
    removeTransitions: (transitionIDs: number[]) => set(produce(({ expression }: {expression: StoredExpression}) => {
      expression.transitions = expression.transitions.filter((t: BaseAutomataTransition) => !transitionIDs.includes(t.id))
    })),

    /* Get all transitions */
    getTransitions: () => get().expression.transitions,

    /* Set comments */
    setComments: (comments: ProjectComment[]) => set(produce(({ expression }: { expression: StoredExpression }) => {
      expression.comments = comments
    })),

    /* Create a new comment */
    createComment: comment => {
      const id = nextIDFor(get().expression.comments)
      set(produce(({ expression }: { expression: StoredExpression }) => {
        expression.comments.push({ ...comment, id })
      }))
      return id
    },

    /* Update a comment by id */
    updateComment: comment => set(produce(({ expression }: { expression: StoredExpression }) => {
      updateById(expression.comments, comment)
    })),

    updateComments: comments => set(produce(({ expression }: { expression: StoredExpression }) => {
      for (const comment of comments) {
        updateById(expression.comments, comment)
      }
    })),

    /* Remove a comment by id */
    removeComment: (comment: ProjectComment) => set(produce(({ expression }: { expression: StoredExpression }) => {
      expression.comments = expression.comments.filter((cm: ProjectComment) => cm.id !== comment.id)
    })),

     /* Remove comments by id */
    removeComments: (commentIDs: number[]) => set(produce(({ expression }: {expression: StoredExpression}) => {
      expression.comments = expression.comments.filter(c => !commentIDs.includes(c.id))
    })),

    /* Get all comments */
    getComments: () => get().expression.comments,

    /* Set states */
    setStates: (states: AutomataState[]) => set(produce(({ expression }: { expression: StoredExpression }) => {
      expression.states = states
    })),

    /* Create a new state */
    createState: state => {
      const id = nextIDFor(get().expression.states)
      const modeID = nextModeIDFor(get().expression.states.filter(s => s.mode === state.mode))
      set(produce(({ expression }: { expression: StoredExpression }) => {
        expression.states.push({ ...state, id, modeID, isFinal: state.isFinal ?? false })
      }))
      return id
    },

    /* Update a state by id */
    updateState: state => set(produce(({ expression }: { expression: StoredExpression }) => {
      updateById(expression.states, state)
    })),

    updateStates: states => set(produce(({ expression }: { expression: StoredExpression }) => {
      for (const state of states) {
        updateById(expression.states, state)
      }
    })),

    /* Remove a state by id */
    removeState: (state: AutomataState) => set(produce(({ expression }: { expression: StoredExpression }) => {
      expression.states = expression.states.filter((st: AutomataState) => st.id !== state.id)
    })),

      /* Remove states by id */
    removeStates: (stateIDs: number[]) => set(produce(({ expression }: {expression: StoredExpression}) => {
      const taskRegExp = convertToTaskRegExp(expression)
      // Remove states
      expression.states = expression.states.filter((st: AutomataState) => !stateIDs.includes(st.id))

      // Remove associated transitions
      expression.transitions = expression.transitions.filter((t: BaseAutomataTransition) => !stateIDs.includes(t.from) && !stateIDs.includes(t.to))

      // Remove initial state if deleted
      if (stateIDs.includes(expression.initialState)) {
        expression.initialState = null
      }

      // Remove initial solution state if deleted
      if (stateIDs.includes(taskRegExp.initialStateSolution)) {
        taskRegExp.initialStateSolution = null
      }
    })),

      /* Set given state to be the initial state */
    setStateInitial: (stateID: number) => set((s: ExpressionStore) => ({ expression: { ...s.expression, initialState: stateID } })),

      /* Set a given state to be the solutions initial state*/
    setSolutionInitial: (stateID: number) => set((s: ExpressionStore) => ({ expression: { ...s.expression, initialStateSolution: stateID } })),

      /* Set all provided states as final */
    toggleStatesFinal: (stateIDs: number[]) => set(produce(({ expression }: {expression: StoredExpression}) => {
      expression.states = expression.states.map(state => ({ ...state, isFinal: stateIDs.includes(state.id) ? !state.isFinal : state.isFinal }))
    })),

    /* Get all states */
    getStates: () => get().expression.states,

    reset: () => set({ expression: createNewExpression(), history: [], historyPointer: 0, lastChangeDate: -1, lastSaveDate: -1 })
    }),

    {
      name: "automatarium-expression",
    }
  )
);

const convertToTaskRegExp = (expression: Expression): TaskRegularExpression => {
  if (expression.type === 'TE') {
    return expression as TaskRegularExpression
  }
  throw new Error("Expression is not a task regular expression")
}

export default useExpressionStore

  
  
  