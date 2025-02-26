import { TASK_MODE, SOLUTION_MODE, PROJECT_TYPE } from 'shared/constants'
import { FSAProjectGraph, TaskProjectGraph } from 'frontend/src/types/ProjectTypes'
import _ from 'lodash'
import { convertNFAtoDFA } from './convert'
import { seperateGraph } from './seperate'
import { isAutomatonNea } from './simulateFSA'
import { logger } from 'shared/logging'

/*
    This function grades a task based on a given solution, using the table filling algorithm.
    The function returns true if the task is equivalent to the solution, otherwise false.
*/
export const gradeSolution = (graph: TaskProjectGraph, type: string): boolean => {
    logger.info(__filename, "Starting grading solution...")

    const seperatedGraph = seperateGraph(graph)
    let taskGraph = seperatedGraph.task
    let solutionGraph = seperatedGraph.solution

    if (isAutomatonNea(taskGraph)){
        const maxSolutionStateId = Math.max(...solutionGraph.states.map(state => state.id))
        const maxSolutionTransitionId = Math.max(...solutionGraph.transitions.map(transition => transition.id))
        taskGraph = convertNFAtoDFA(taskGraph, maxSolutionStateId, maxSolutionTransitionId);
    } else {
        logger.info(__filename, "Task automaton is DEA.")
    }
    if (isAutomatonNea(solutionGraph)){
        const maxTaskStateId = Math.max(...taskGraph.states.map(state => state.id))
        const maxTaskTransitionId = Math.max(...taskGraph.transitions.map(transition => transition.id))
        logger.info(__filename, "Solution Graph before conversion: ", solutionGraph)
        solutionGraph = convertNFAtoDFA(solutionGraph, maxTaskStateId, maxTaskTransitionId);
        logger.info(__filename, "Solution Graph after conversion: ", solutionGraph)
    } else {
        logger.info(__filename, "Solution automaton is DEA.")
    }

    graph = {
        ...graph,
        states: [...taskGraph.states, ...solutionGraph.states],
        transitions: [...taskGraph.transitions, ...solutionGraph.transitions]
    }
    
    let statesWithMode = new Map()
    graph.states.forEach((state) => {
        statesWithMode.set(state.id, state.mode)
        state.blockID = null
    })

    validateAlphabet(graph)
    let blocks = tableFillingAlgorithm(graph, type)
    blocks.forEach((block) => {
        let taskStatesCounter = 0
        let solutionStatesCounter = 0
        block.forEach((state_id) => {
            if(statesWithMode.get(state_id) == TASK_MODE){
                taskStatesCounter ++
            } else if (statesWithMode.get(state_id) == SOLUTION_MODE){
                solutionStatesCounter ++
            }
        })
        if(taskStatesCounter == 0 || solutionStatesCounter == 0){
            block.length = 0
        }
    })
    let equivalentStates = []
    let result = true
    logger.info(__filename, "Blocks: ", blocks)
    blocks.forEach((block) => {
        block.forEach((state) => {
            equivalentStates.push(state)
        });
    })
    graph.states.forEach(state => {
        if(!equivalentStates.includes(state.id)){
            logger.info(__filename, "Found non-equivalent state: ", state)
            result = false
        }
    });

    logger.info(__filename, "Grading result: ", result)
    return result
}

/*
    This function validates the alphabet of a given graph.
    The function throws an error if the solution contains read values not present in the task, or if the task contains read values not present in the solution.
*/
export const validateAlphabet = (graph: TaskProjectGraph) => {
    const alphabetSolution = [...new Set(graph.transitions.filter(transition => transition.mode == SOLUTION_MODE).map(transition => transition.read))]
    const alphabetTask = [...new Set(graph.transitions.filter(transition => transition.mode == TASK_MODE).map(transition => transition.read))]
    const uniqueSolutionReads = alphabetSolution.filter(read => !alphabetTask.includes(read));
    if (uniqueSolutionReads.length > 0) {
        logger.info(__filename, "Solution contains read values not present in the task:", uniqueSolutionReads);
        throw new Error("Solution contains read values not present in the task: " + uniqueSolutionReads);
    }
    const uniqueTaskReads = alphabetTask.filter(read => !alphabetSolution.includes(read));
    if (uniqueTaskReads.length > 0) {
        logger.info(__filename, "Task contains read values not present in the solution:", uniqueTaskReads);
        throw new Error("Task contains read values not present in the solution: " + uniqueTaskReads);
    } 
}

/*
    This function finds equivalent states in a given graph.
    The function returns a map of states and their block ID. Two states are equivalent if they are in the same block.
*/
export const findEquivalentStates = (graph: TaskProjectGraph, type: string): Map<number, number> => {
    logger.info(__filename, "Starting find equivalent states...")
    let statesWithMode = new Map()
    graph.states.forEach((state) => {
        statesWithMode.set(state.id, state.mode)
        state.blockID = null
    })

    let blocks = tableFillingAlgorithm(graph, type)
    blocks.forEach((block) => {
        let taskStatesCounter = 0
        block.forEach((state_id) => {
            if(statesWithMode.get(state_id) == TASK_MODE){
                taskStatesCounter ++
            }
        })
        if(taskStatesCounter < 2){
            block.length = 0
        }
    })

    let statesWithBlockID = new Map<number, number>()
    blocks.forEach((block, index) => {
        graph.states.forEach((state) => {
            if(state.mode == TASK_MODE && block.includes(state.id)){
                statesWithBlockID.set(state.id, index)
            }
        })
    })

    return statesWithBlockID
}

/*
    This function implements the table filling algorithm.
    The function returns a list of blocks, where each block contains equivalent states.
*/
export const tableFillingAlgorithm = (graph: TaskProjectGraph, type: string): any[] => {
    logger.info(__filename, "Starting table filling Algorithm...")

    // Step 1: Initialize the table
    const table: boolean[][] = []
    const states = graph.states.map(state => state.id)
    const numStates = states.length
    const stateToTable = {}
    const tableToState = {}
    states.forEach((id, index) => {
        stateToTable[id] = index
        tableToState[index] = id
    })

    const alphabetSolution = [...new Set(graph.transitions.filter(transition => transition.mode == SOLUTION_MODE).map(transition => transition.read))]
    const alphabetTask = [...new Set(graph.transitions.filter(transition => transition.mode == TASK_MODE).map(transition => transition.read))]

    const finalStates = graph.states.filter(state => state.isFinal).map(state => state.id)
    const alphabet =  [...new Set([...alphabetSolution, ...alphabetTask])]

    // Check if automaton is complete.
    graph.states.forEach((state) => {     
        let readValues = [...new Set(graph.transitions.filter(transitions => transitions.from === state.id).map(transition => transition.read))]
        const stateIsComplete:boolean = alphabet.every((value) => {
            if(!readValues.includes(value) || alphabet.length != readValues.length) {
                logger.error(__filename, "Found incomplete state: ", state)
                return false
            }
            return true
        })
        if (!stateIsComplete){
            logger.error(__filename, "Automaton is not complete. Throwing error.")
            if (type == PROJECT_TYPE) {
                throw new Error("The automaton is expected to be complete. You can make it complete by using the option 'Convert to DFA' in the tools menu.")
            } else {
                throw new Error("The automaton is expected to be complete.")
            }
        }
    })

    logger.info(__filename, "Automaton is complete.")

    // Mark final states as distingishuable
    for (let i = 0; i < numStates; i++) {
        table[i] = []
        for (let j = 0; j < numStates; j++) {
            let distinguishable = ((!(finalStates.includes(tableToState[i]) && finalStates.includes(tableToState[j]))) &&
                (finalStates.includes(tableToState[i]) || finalStates.includes(tableToState[j])) && i > j) ? true : null
            table[i][j] = distinguishable
        }
    }

    // Step 2: Fill Table
    let unchanged = true 
    while(unchanged){
        let oldTable = _.cloneDeep(table)
        for (let i = 0; i < numStates; i++) {
            for (let j = 0; j < numStates; j++) {
                if (table[i][j] != true && i > j) {
                    hasDistinguishableSuccessor(graph, tableToState[i], tableToState[j], table, alphabet, stateToTable) 
                }
            }
        }
        unchanged = !_.isEqual(table, oldTable)
    }

    // Step 3: Process Table
    let equivalentStates = table.flatMap((row, i) => 
        row.map((value, j) => value === false ? {value, position: [tableToState[i], tableToState[j]]} : null)
        .filter(value => value !== null)
    );
    let blocks = []
    equivalentStates.forEach((states) => {
        let found = false
        blocks.forEach((block) => {
            if(block.includes(states.position[0])){
                block.push(states.position[1])
                found = true
            }
            if(block.includes(states.position[1])){
                block.push(states.position[0])
                found = true
            }
        }) 
        if(!found) {
            blocks.push(states.position)
        }
    })
    return blocks
}

/*
    This function checks if two states are distinguishable.
    If they are distinguishable, the function sets the table value to true.
*/
const hasDistinguishableSuccessor = (graph: TaskProjectGraph, firstState: number, secondState: number, table, alphabet, stateToTable) => {
    let done = false
    alphabet.forEach(function (value) {
        let firstDest = graph.transitions.filter(transitions => transitions.from === firstState && transitions.read === value).map(transition => transition.to)[0]
        let secondDest = graph.transitions.filter(transitions => transitions.from === secondState && transitions.read === value).map(transition => transition.to)[0] 
        let firstDestTable = stateToTable[firstDest]
        let secondDestTable = stateToTable[secondDest]
        if(firstDestTable < secondDestTable){
            [firstDestTable, secondDestTable] = [secondDestTable, firstDestTable]
        }
        if (table[firstDestTable][secondDestTable] === true){
            table[stateToTable[firstState]][stateToTable[secondState]] = true
            done = true
            return
        }
    })
    if(!done){
        table[stateToTable[firstState]][stateToTable[secondState]] = false
    }
}

/*
    This function removes unreachable states from a given graph.
    The function returns a list of states and transitions to remove. A state is unreachable if it cannot be reached from the initial state.
*/
export const removeUnreachableStates = (graph: FSAProjectGraph): {statesToRemove, transitionsToRemove} => {
    // Get all ids
    logger.info(__filename, "Starting remove unreachable States...")
    let unreachableTransitions, unreachableStates
    let transitions = graph.transitions
    let reachableStates = []
    findReachableStates(graph.initialState, reachableStates, transitions)
    unreachableTransitions = transitions.filter(transition => !(reachableStates.includes(transition.from) && reachableStates.includes(transition.to)))
    unreachableStates = graph.states.filter(state => !reachableStates.includes(state.id))

    logger.info(__filename, "Unreachable states: ", unreachableStates)
    logger.info(__filename, "Unreachable transitions: ", unreachableTransitions)
    return {statesToRemove: unreachableStates, transitionsToRemove: unreachableTransitions}
}

/*
    This function finds all reachable states from a given state.
    The function gives a list of reachable states (visited states).
*/
export const findReachableStates = (state, visitedStates, transitions) => {
    visitedStates.push(state)
    let outTransitions = transitions.filter(transition => transition.from == state)
    outTransitions.forEach((transition) => {
        if(!visitedStates.includes(transition.to)){
            findReachableStates(transition.to, visitedStates, transitions)
        }
    })
}
