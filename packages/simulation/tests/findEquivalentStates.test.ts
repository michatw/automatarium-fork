import { TaskProjectGraph } from "frontend/src/types/ProjectTypes"
import { findEquivalentStates } from "../src/minimizeAutomaton"
import { TASK_MODE } from "shared"

describe('findEquivalentStates', () => {
    test('should find equivalent states in a simple DEA', () => {
        const project: TaskProjectGraph = {
            projectType: "T",
            states: [
                { x: 450, y: 165, mode: "task", id: 1, modeID: 1, isFinal: false, blockID: null },
                { x: 885, y: 165, mode: "task", id: 2, modeID: 2, isFinal: true, blockID: null },
                { x: 135, y: 555, mode: "task", id: 4, modeID: 4, isFinal: false, blockID: null },
                { x: 405, y: 405, mode: "task", id: 5, modeID: 5, isFinal: false, blockID: 0 },
                { x: 735, y: 405, mode: "task", id: 6, modeID: 6, isFinal: false, blockID: null },
                { x: 150, y: 75, mode: "task", id: 8, modeID: 8, isFinal: false, blockID: null },
                { x: 1155, y: 195, mode: "task", id: 10, modeID: 10, isFinal: false, blockID: 0 },
                { x: 795, y: 540, mode: "task", id: 19, modeID: 11, isFinal: false, name: "Trap", blockID: null }
            ],
            transitions: [
                { from: 1, to: 2, mode: "task", id: 1, read: "1" },
                { from: 2, to: 2, mode: "task", id: 3, read: "1" },
                { from: 8, to: 1, mode: "task", id: 4, read: "0" },
                { from: 2, to: 8, mode: "task", id: 5, read: "0" },
                { from: 6, to: 6, mode: "task", id: 9, read: "0" },
                { from: 5, to: 6, mode: "task", id: 10, read: "1" },
                { from: 4, to: 5, mode: "task", id: 11, read: "1" },
                { from: 8, to: 5, mode: "task", id: 12, read: "1" },
                { from: 6, to: 4, mode: "task", id: 13, read: "1" },
                { from: 1, to: 6, mode: "task", id: 15, read: "0" },
                { from: 5, to: 2, mode: "task", id: 16, read: "0" },
                { from: 10, to: 2, mode: "task", id: 20, read: "0" },
                { from: 10, to: 6, mode: "task", id: 21, read: "1" },
                { from: 4, to: 19, mode: "task", id: 38, read: "0" },
                { from: 19, to: 19, mode: "task", id: 39, read: "1" },
                { from: 19, to: 19, mode: "task", id: 40, read: "0" }
            ],
            initialState: 8,
            initialStateSolution: null,
            grade: null,
            isSolutionVisible: false,
        }

        const statesAndBlockID = findEquivalentStates(project, TASK_MODE)
        expect(statesAndBlockID).toEqual(new Map([
            [5, 0],
            [10, 0]
        ]));
    })

    test('should find equivalent states in another DEA', () => {
        const project: TaskProjectGraph = {
            projectType: "T",
            states: [
                { x: 450, y: 165, mode: "task", id: 1, modeID: 1, isFinal: false, blockID: 2 },
                { x: 885, y: 165, mode: "task", id: 2, modeID: 2, isFinal: true, blockID: null },
                { x: 135, y: 555, mode: "task", id: 4, modeID: 4, isFinal: false, blockID: 0 },
                { x: 405, y: 405, mode: "task", id: 5, modeID: 5, isFinal: false, blockID: 1 },
                { x: 735, y: 405, mode: "task", id: 6, modeID: 6, isFinal: false, blockID: null },
                { x: 150, y: 75, mode: "task", id: 8, modeID: 8, isFinal: false, blockID: 0 },
                { x: 1155, y: 195, mode: "task", id: 10, modeID: 10, isFinal: false, blockID: 1 },
                { x: 1095, y: 525, mode: "task", id: 11, modeID: 11, isFinal: false, blockID: 2 }
            ],
            transitions: [
                { from: 1, to: 2, mode: "task", id: 1, read: "1" },
                { from: 2, to: 2, mode: "task", id: 3, read: "1" },
                { from: 8, to: 1, mode: "task", id: 4, read: "0" },
                { from: 2, to: 8, mode: "task", id: 5, read: "0" },
                { from: 6, to: 6, mode: "task", id: 9, read: "0" },
                { from: 5, to: 6, mode: "task", id: 10, read: "1" },
                { from: 4, to: 5, mode: "task", id: 11, read: "1" },
                { from: 8, to: 5, mode: "task", id: 12, read: "1" },
                { from: 6, to: 4, mode: "task", id: 13, read: "1" },
                { from: 1, to: 6, mode: "task", id: 15, read: "0" },
                { from: 5, to: 2, mode: "task", id: 16, read: "0" },
                { from: 10, to: 2, mode: "task", id: 20, read: "0" },
                { from: 10, to: 6, mode: "task", id: 21, read: "1" },
                { from: 11, to: 6, mode: "task", id: 22, read: "0" },
                { from: 4, to: 11, mode: "task", id: 23, read: "0" },
                { from: 11, to: 2, mode: "task", id: 24, read: "1" }
            ],
            initialState: 8,
            initialStateSolution: 16,
            grade: null,
            isSolutionVisible: true,
        }

        const statesAndBlockID = findEquivalentStates(project, TASK_MODE)
        expect(statesAndBlockID).toEqual(new Map([
            [5, 1],
            [10, 1],
            [1, 2],
            [11, 2],
            [4, 0],
            [8, 0]
        ]));
    })

    test('should not find equivalent states in a DEA with no equivalent states', () => {
        const project: TaskProjectGraph = {
            projectType: "T",
            states: [
                { x: 60, y: 210, mode: "task", id: 0, modeID: 0, isFinal: false, blockID: null },
                { x: 240, y: 300, mode: "task", id: 1, modeID: 1, isFinal: false, blockID: null },
                { x: 525, y: 195, mode: "task", id: 2, modeID: 2, isFinal: true, blockID: null },
                { x: 510, y: 600, mode: "task", id: 4, modeID: 4, isFinal: false, blockID: null },
                { x: 165, y: 585, mode: "task", id: 6, modeID: 6, isFinal: false, blockID: null },
                { x: 45, y: 705, mode: "task", id: 7, modeID: 7, isFinal: false, blockID: null },
                { x: 255, y: 780, mode: "task", id: 9, modeID: 9, isFinal: false, name: "Trap", blockID: null }
            ],
            transitions: [
                { from: 2, to: 0, mode: "task", id: 0, read: "0" },
                { from: 0, to: 1, mode: "task", id: 1, read: "0" },
                { from: 1, to: 2, mode: "task", id: 2, read: "1" },
                { from: 2, to: 2, mode: "task", id: 3, read: "1" },
                { from: 4, to: 7, mode: "task", id: 10, read: "1" },
                { from: 7, to: 6, mode: "task", id: 11, read: "1" },
                { from: 6, to: 4, mode: "task", id: 12, read: "1" },
                { from: 4, to: 4, mode: "task", id: 13, read: "0" },
                { from: 6, to: 2, mode: "task", id: 14, read: "0" },
                { from: 0, to: 6, mode: "task", id: 15, read: "1" },
                { from: 1, to: 4, mode: "task", id: 16, read: "0" },
                { from: 7, to: 9, mode: "task", id: 17, read: "0" },
                { from: 9, to: 9, mode: "task", id: 18, read: "1" },
                { from: 9, to: 9, mode: "task", id: 19, read: "0" }
            ],
            initialState: 0,
            initialStateSolution: null,
            grade: null,
            isSolutionVisible: true,
        }

        const statesAndBlockID = findEquivalentStates(project, TASK_MODE)
        expect(statesAndBlockID.size).toBe(0);
    })
})
