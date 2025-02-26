import { TaskProjectGraph } from "frontend/src/types/ProjectTypes"
import { seperateGraph } from "../src/seperate";

describe('parseRegexToDEA', () => {
    test('should seperate a simple TaskGraph', () => {
        const graph: TaskProjectGraph = {
            projectType: "T",
            states: [
                {id: 0, modeID: 0, x: 0, y: 0, mode: "task", isFinal: false},
                {id: 1, modeID: 1, x: 0, y: 0, mode: "task", isFinal: false},
                {id: 2, modeID: 2, x: 0, y: 0, mode: "task", isFinal: true},
                {id: 3, modeID: 0, x: 0, y: 0, mode: "solution", isFinal: false},
                {id: 4, modeID: 1, x: 0, y: 0, mode: "solution", isFinal: false},
                {id: 5, modeID: 2, x: 0, y: 0, mode: "solution", isFinal: false},
            ],
            transitions: [
                {id: 0, from: 0, to: 1, read: "a", mode: "task"},
                {id: 1, from: 1, to: 2, read: "b", mode: "task"},
                {id: 2, from: 3, to: 4, read: "a", mode: "solution"},
                {id: 3, from: 4, to: 5, read: "b", mode: "solution"},
            ],
            initialState: 0,
            initialStateSolution: 3,
            isSolutionVisible: false,
            grade: null,
        }

        const {task, solution} = seperateGraph(graph);
        expect(task.states).toEqual([
            {id: 0, modeID: 0, x: 0, y: 0, mode: "task", isFinal: false},
            {id: 1, modeID: 1, x: 0, y: 0, mode: "task", isFinal: false},
            {id: 2, modeID: 2, x: 0, y: 0, mode: "task", isFinal: true},
        ])
        expect(task.transitions).toEqual([
            {id: 0, from: 0, to: 1, read: "a", mode: "task"},
            {id: 1, from: 1, to: 2, read: "b", mode: "task"},
        ])
        expect(task.initialState).toEqual(0)
        expect(solution.states).toEqual([
            {id: 3, modeID: 0, x: 0, y: 0, mode: "solution", isFinal: false},
            {id: 4, modeID: 1, x: 0, y: 0, mode: "solution", isFinal: false},
            {id: 5, modeID: 2, x: 0, y: 0, mode: "solution", isFinal: false},
        ])
        expect(solution.transitions).toEqual([
            {id: 2, from: 3, to: 4, read: "a", mode: "solution"},
            {id: 3, from: 4, to: 5, read: "b", mode: "solution"},
        ])
        expect(solution.initialState).toEqual(3)
    })

    test('should seperate a complex TaskGraph', () => {
        const graph: TaskProjectGraph = {
            projectType: "T",
            states: [
                {id: 0, modeID: 0, x: 0, y: 0, mode: "task", isFinal: false},
                {id: 1, modeID: 1, x: 0, y: 0, mode: "task", isFinal: false},
                {id: 2, modeID: 2, x: 0, y: 0, mode: "task", isFinal: true},
                {id: 3, modeID: 0,  x: 0, y: 0, mode: "solution", isFinal: false},
                {id: 4, modeID: 1, x: 0, y: 0, mode: "solution", isFinal: false},
                {id: 5, modeID: 2, x: 0, y: 0, mode: "solution", isFinal: false},
                {id: 6, modeID: 3, x: 0, y: 0, mode: "task", isFinal: false},
                {id: 7, modeID: 3, x: 0, y: 0, mode: "solution", isFinal: true},
            ],
            transitions: [
                {id: 0, from: 0, to: 1, read: "a", mode: "task"},
                {id: 1, from: 1, to: 2, read: "b", mode: "task"},
                {id: 2, from: 3, to: 4, read: "a", mode: "solution"},
                {id: 3, from: 4, to: 5, read: "b", mode: "solution"},
                {id: 4, from: 2, to: 6, read: "c", mode: "task"},
                {id: 5, from: 5, to: 7, read: "c", mode: "solution"},
            ],
            initialState: 0,
            initialStateSolution: 3,
            isSolutionVisible: false,
            grade: null,
        }

        const {task, solution} = seperateGraph(graph);
        expect(task.states).toEqual([
            {id: 0, modeID: 0, x: 0, y: 0, mode: "task", isFinal: false},
            {id: 1, modeID: 1, x: 0, y: 0, mode: "task", isFinal: false},
            {id: 2, modeID: 2, x: 0, y: 0, mode: "task", isFinal: true},
            {id: 6, modeID: 3, x: 0, y: 0, mode: "task", isFinal: false},
        ])
        expect(task.transitions).toEqual([
            {id: 0, from: 0, to: 1, read: "a", mode: "task"},
            {id: 1, from: 1, to: 2, read: "b", mode: "task"},
            {id: 4, from: 2, to: 6, read: "c", mode: "task"},
        ])
        expect(task.initialState).toEqual(0)
        expect(solution.states).toEqual([
            {id: 3, modeID: 0, x: 0, y: 0, mode: "solution", isFinal: false},
            {id: 4, modeID: 1, x: 0, y: 0, mode: "solution", isFinal: false},
            {id: 5, modeID: 2, x: 0, y: 0, mode: "solution", isFinal: false},
            {id: 7, modeID: 3, x: 0, y: 0, mode: "solution", isFinal: true},
        ])
        expect(solution.transitions).toEqual([
            {id: 2, from: 3, to: 4, read: "a", mode: "solution"},
            {id: 3, from: 4, to: 5, read: "b", mode: "solution"},
            {id: 5, from: 5, to: 7, read: "c", mode: "solution"},
        ])
        expect(solution.initialState).toEqual(3)
    })

    test('should handle TaskGraph with no solution states and transitions', () => {
        const graph: TaskProjectGraph = {
            projectType: "T",
            states: [
                {id: 0, modeID: 0, x: 0, y: 0, mode: "task", isFinal: false},
                {id: 1, modeID: 1, x: 0, y: 0, mode: "task", isFinal: false},
                {id: 2, modeID: 2, x: 0, y: 0, mode: "task", isFinal: true},
            ],
            transitions: [
                {id: 0, from: 0, to: 1, read: "a", mode: "task"},
                {id: 1, from: 1, to: 2, read: "b", mode: "task"},
            ],
            initialState: 0,
            initialStateSolution: null,
            isSolutionVisible: false,
            grade: null,
        }

        const {task, solution} = seperateGraph(graph);
        expect(task.states).toEqual([
            {id: 0, modeID: 0, x: 0, y: 0, mode: "task", isFinal: false},
            {id: 1, modeID: 1, x: 0, y: 0, mode: "task", isFinal: false},
            {id: 2, modeID: 2, x: 0, y: 0, mode: "task", isFinal: true},
        ])
        expect(task.transitions).toEqual([
            {id: 0, from: 0, to: 1, read: "a", mode: "task"},
            {id: 1, from: 1, to: 2, read: "b", mode: "task"},
        ])
        expect(task.initialState).toEqual(0)
        expect(solution.states).toEqual([])
        expect(solution.transitions).toEqual([])
        expect(solution.initialState).toBeNull()
    })

    test('should handle TaskGraph with no task states and transitions', () => {
        const graph: TaskProjectGraph = {
            projectType: "T",
            states: [
                {id: 3, modeID: 0, x: 0, y: 0, mode: "solution", isFinal: false},
                {id: 4, modeID: 1, x: 0, y: 0, mode: "solution", isFinal: false},
                {id: 5, modeID: 2, x: 0, y: 0, mode: "solution", isFinal: false},
            ],
            transitions: [
                {id: 2, from: 3, to: 4, read: "a", mode: "solution"},
                {id: 3, from: 4, to: 5, read: "b", mode: "solution"},
            ],
            initialState: null,
            initialStateSolution: 3,
            isSolutionVisible: false,
            grade: null,
        }

        const {task, solution} = seperateGraph(graph);
        expect(task.states).toEqual([])
        expect(task.transitions).toEqual([])
        expect(task.initialState).toBeNull()
        expect(solution.states).toEqual([
            {id: 3, modeID: 0, x: 0, y: 0, mode: "solution", isFinal: false},
            {id: 4, modeID: 1, x: 0, y: 0, mode: "solution", isFinal: false},
            {id: 5, modeID: 2, x: 0, y: 0, mode: "solution", isFinal: false},
        ])
        expect(solution.transitions).toEqual([
            {id: 2, from: 3, to: 4, read: "a", mode: "solution"},
            {id: 3, from: 4, to: 5, read: "b", mode: "solution"},
        ])
        expect(solution.initialState).toEqual(3)
    })

    test('should handle TaskGraph with non-sequential IDs', () => {
        const graph: TaskProjectGraph = {
            projectType: "T",
            states: [
                {id: 10, modeID: 1, x: 0, y: 0, mode: "task", isFinal: false},
                {id: 5, modeID: 0, x: 0, y: 0, mode: "task", isFinal: false},
                {id: 20, modeID: 2, x: 0, y: 0, mode: "task", isFinal: true},
                {id: 15, modeID: 0, x: 0, y: 0, mode: "solution", isFinal: false},
                {id: 25, modeID: 1, x: 0, y: 0, mode: "solution", isFinal: false},
                {id: 30, modeID: 2, x: 0, y: 0, mode: "solution", isFinal: false},
            ],
            transitions: [
                {id: 200, from: 10, to: 5, read: "a", mode: "task"},
                {id: 150, from: 5, to: 20, read: "b", mode: "task"},
                {id: 300, from: 15, to: 25, read: "a", mode: "solution"},
                {id: 250, from: 25, to: 30, read: "b", mode: "solution"},
            ],
            initialState: 10,
            initialStateSolution: 15,
            isSolutionVisible: false,
            grade: null,
        }

        const {task, solution} = seperateGraph(graph);
        expect(task.states).toEqual([
            {id: 10, modeID: 1, x: 0, y: 0, mode: "task", isFinal: false},
            {id: 5, modeID: 0, x: 0, y: 0, mode: "task", isFinal: false},
            {id: 20, modeID: 2, x: 0, y: 0, mode: "task", isFinal: true},
        ])
        expect(task.transitions).toEqual([
            {id: 200, from: 10, to: 5, read: "a", mode: "task"},
            {id: 150, from: 5, to: 20, read: "b", mode: "task"},
        ])
        expect(task.initialState).toEqual(10)
        expect(solution.states).toEqual([
            {id: 15, modeID: 0, x: 0, y: 0, mode: "solution", isFinal: false},
            {id: 25, modeID: 1, x: 0, y: 0, mode: "solution", isFinal: false},
            {id: 30, modeID: 2, x: 0, y: 0, mode: "solution", isFinal: false},
        ])
        expect(solution.transitions).toEqual([
            {id: 300, from: 15, to: 25, read: "a", mode: "solution"},
            {id: 250, from: 25, to: 30, read: "b", mode: "solution"},
        ])
        expect(solution.initialState).toEqual(15)
    })
})