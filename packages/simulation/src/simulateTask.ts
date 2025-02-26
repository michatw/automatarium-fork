import { TaskState } from './TaskSearch'
import { TaskExecutionResult, TaskExecutionTrace } from './graph'
import { Node } from './interfaces/graph'
import { breadthFirstSearch } from './search'
import { TaskProjectGraph } from 'frontend/src/types/ProjectTypes'
import { buildProblem } from './utils'


/*
* At the moment this file is just a copy of simulateFSA.ts, but it could be changed in the future
*/
const generateTrace = (node: Node<TaskState>): TaskExecutionTrace[] => {
  const trace: TaskExecutionTrace[] = []
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

export const simulateTask = (
  graph: TaskProjectGraph,
  input: string
): TaskExecutionResult => {
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
