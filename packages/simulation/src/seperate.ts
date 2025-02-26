import { FSAProjectGraph, TaskProjectGraph } from "frontend/src/types/ProjectTypes";
import { SOLUTION_MODE, TASK_MODE } from "shared/constants";
import { logger } from "shared/logging";

/* 
    This function takes in a graph and seperates it into two graphs, one for the task and one for the solution.
    The task contains all states and transitions that are in the task mode.
    The solution contains all states and transitions that are in the solution mode.
*/
export const seperateGraph = (graph: TaskProjectGraph): {task: FSAProjectGraph, solution: FSAProjectGraph} => {
    logger.info(__filename, "Starting seperate project...")
    const taskGraph: FSAProjectGraph = {
        projectType: "FSA",
        states: graph.states.filter(state => state.mode === TASK_MODE),
        transitions: graph.transitions.filter(transition =>  transition.mode === TASK_MODE),
        initialState: graph.initialState,
    };

    const solutionGraph: FSAProjectGraph = {
        projectType: "FSA",
        states: graph.states.filter(state => state.mode === SOLUTION_MODE),
        transitions: graph.transitions.filter(transition =>  transition.mode === SOLUTION_MODE),
        initialState: graph['initialStateSolution'],
    };
    logger.info(__filename, "seperated into task and solution graph.")
    logger.debug(__filename, "Task Graph", taskGraph)
    logger.debug(__filename, "Solution Graph", solutionGraph)
    return {task: taskGraph, solution: solutionGraph}
}