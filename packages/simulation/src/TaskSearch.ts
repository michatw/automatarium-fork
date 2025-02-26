import { Graph, Node, State } from './interfaces/graph'
import { TaskAutomataTransition } from 'frontend/src/types/ProjectTypes'
import { extractSymbolsToExclude } from 'frontend/src/util/stringManipulations'


/* 
* At the moment TaskState is just a copy of FSAState, but it could be changed in the future
*/
export class TaskState extends State {
  constructor (
    id: number,
    isFinal: boolean,
    readonly read: string | null = null,
    readonly remaining: string = ''
  ) {
    super(id, isFinal)
  }

  key () {
    return String(this.id + this.remaining)
  }
}


/*
* At the moment TaskGraph is just a copy of FSAGraph, but it could be changed in the future
*/
export class TaskGraph extends Graph<TaskState, TaskAutomataTransition> {
  public isFinalState (node: Node<TaskState>) {
    return node.state.isFinal && node.state.remaining.length === 0
  }

  public getSuccessors (node: Node<TaskState>) {
    const transitions = this.transitions.filter(
      (transition) => transition.from === node.state.id
    )
    const successors: Node<TaskState>[] = []
    for (const transition of transitions) {
      const nextState = this.states.find(
        (state) => state.id === transition.to
      )
      const lambdaTransition = transition.read.length === 0
      const symbol = node.state.remaining[0]
      // Get any symbols preceded by an exclusion operator
      const symbolsToExclude = extractSymbolsToExclude(transition.read)
      if (
        nextState === undefined ||
        (!lambdaTransition && !transition.read.includes(symbol) && (symbolsToExclude.length === 0)) ||
        (!lambdaTransition && (symbolsToExclude.length > 0) && (symbolsToExclude.includes(symbol)))
      ) {
        continue
      }
      const graphState = new TaskState(
        nextState.id,
        nextState.isFinal,
        lambdaTransition ? '' : symbol,
        lambdaTransition
          ? node.state.remaining
          : node.state.remaining.slice(1)
      )
      const successor = new Node(graphState, node)
      successors.push(successor)
    }
    return successors
  }
}
