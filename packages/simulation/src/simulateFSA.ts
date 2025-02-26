import { FSAState } from './FSASearch'
import { FSAExecutionResult, FSAExecutionTrace } from './graph'
import { Node } from './interfaces/graph'
import { breadthFirstSearch } from './search'
import { FSAProjectGraph, TaskProjectGraph } from 'frontend/src/types/ProjectTypes'
import { buildProblem } from './utils'
import { logger } from 'shared/logging'

const generateTrace = (node: Node<FSAState>): FSAExecutionTrace[] => {
  const trace: FSAExecutionTrace[] = []
  while (node.parent) {
    trace.push({
      to: node.state.id,
      read: node.state.read
    })
    node = node.parent
  }
  trace.push({
    to: node.state.id,
    read: null
  })
  return trace.reverse()
}

export const simulateFSA = (
  graph: FSAProjectGraph | TaskProjectGraph,
  input: string
): FSAExecutionResult => {
  const problem = buildProblem(graph, input)
  if (!problem) {
    return {
      accepted: false,
      remaining: input,
      trace: []
    }
  }

  const result = breadthFirstSearch(problem)

  if (!result) {
    return {
      trace: [{ to: 0, read: null }],
      accepted: false,
      remaining: input
    }
  }

  return {
    accepted: result.state.isFinal && result.state.remaining === '',
    remaining: result.state.remaining,
    trace: generateTrace(result)
  }
}

export const isAutomatonNea = (graph: FSAProjectGraph): boolean => {
  logger.info(__filename, "Starting check if automaton is NEA...")
  let transitions = graph.transitions
  let isNEA = false
  let transitionsSeen = new Map<string, boolean>()
  for (const transition of transitions) {
      if(transition.read == ""){
          isNEA = true
          break
      }
      if(transitionsSeen.get(transition.from.toString() + transition.read.toString())){
          isNEA = true
          logger.debug(__filename, "Transition seen twice: " + transition.from.toString() + transition.read.toString())
          break
      }
      transitionsSeen.set(transition.from.toString() + transition.read.toString(), true)
  }

  return isNEA
}
