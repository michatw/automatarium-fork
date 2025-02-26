import { FSAProjectGraph } from "frontend/src/types/ProjectTypes"
import { removeUnreachableStates } from "../src/minimizeAutomaton"

describe('removeUnreachableStates', () => {
    test('should remove unreachable states from a simple DEA', () => {
        const project: FSAProjectGraph = {
            projectType: "FSA",
            states: [
                { x: 180, y: 270, mode: "task", id: 0, modeID: 0, isFinal: false },
                { x: 300, y: 180, mode: "task", id: 1, modeID: 1, isFinal: false },
                { x: 285, y: 435, mode: "task", id: 2, modeID: 2, isFinal: false },
                { x: 495, y: 345, mode: "task", id: 3, modeID: 3, isFinal: false },
                { x: 510, y: 240, mode: "task", id: 4, modeID: 4, isFinal: false }
            ],
            transitions: [
                { from: 0, to: 1, mode: "task", id: 0, read: "a" }
            ],
            initialState: 0
        }

        const { statesToRemove, transitionsToRemove } = removeUnreachableStates(project)
        expect(statesToRemove).toEqual([
            { x: 285, y: 435, mode: "task", id: 2, modeID: 2, isFinal: false },
            { x: 495, y: 345, mode: "task", id: 3, modeID: 3, isFinal: false },
            { x: 510, y: 240, mode: "task", id: 4, modeID: 4, isFinal: false }
        ])
        expect(transitionsToRemove).toEqual([])
    })

    test('should remove unreachable states from a DEA where unneccessary transitions exist', () => {
        const project: FSAProjectGraph = {
            projectType: "FSA",
            states: [
                { x: 180, y: 270, mode: "task", id: 0, modeID: 0, isFinal: false },
                { x: 300, y: 180, mode: "task", id: 1, modeID: 1, isFinal: false },
                { x: 285, y: 435, mode: "task", id: 2, modeID: 2, isFinal: false },
                { x: 495, y: 345, mode: "task", id: 3, modeID: 3, isFinal: false },
                { x: 510, y: 240, mode: "task", id: 4, modeID: 4, isFinal: false }
            ],
            transitions: [
                { from: 0, to: 1, mode: "task", id: 0, read: "a" },
                { from: 2, to: 3, mode: "task", id: 1, read: "a" },
                { from: 3, to: 4, mode: "task", id: 2, read: "b" }
            ],
            initialState: 0
        }

        const { statesToRemove, transitionsToRemove } = removeUnreachableStates(project)
        expect(statesToRemove).toEqual([
            { x: 285, y: 435, mode: "task", id: 2, modeID: 2, isFinal: false },
            { x: 495, y: 345, mode: "task", id: 3, modeID: 3, isFinal: false },
            { x: 510, y: 240, mode: "task", id: 4, modeID: 4, isFinal: false }
        ])
        expect(transitionsToRemove).toEqual([
            { from: 2, to: 3, mode: "task", id: 1, read: "a" },
            { from: 3, to: 4, mode: "task", id: 2, read: "b" }
        ])
    })

    test('should remove unreachable states from a DEA where all states are connected but some are not reachable from the initial state', () => {
        const project: FSAProjectGraph = {
            projectType: "FSA",
            states: [
                { x: 180, y: 270, mode: "task", id: 0, modeID: 0, isFinal: false },
                { x: 300, y: 180, mode: "task", id: 1, modeID: 1, isFinal: false },
                { x: 285, y: 435, mode: "task", id: 2, modeID: 2, isFinal: false },
                { x: 495, y: 345, mode: "task", id: 3, modeID: 3, isFinal: false },
                { x: 510, y: 240, mode: "task", id: 4, modeID: 4, isFinal: false }
            ],
            transitions: [
                { from: 0, to: 1, mode: "task", id: 0, read: "a" },
                { from: 1, to: 0, mode: "task", id: 1, read: "b" },
                { from: 2, to: 3, mode: "task", id: 2, read: "a" },
                { from: 3, to: 4, mode: "task", id: 3, read: "b" },
                { from: 4, to: 2, mode: "task", id: 4, read: "c" },
                { from: 3, to: 1, mode: "task", id: 5, read: "d" }
            ],
            initialState: 0
        }

        const { statesToRemove, transitionsToRemove } = removeUnreachableStates(project)
        expect(statesToRemove).toEqual([
            { x: 285, y: 435, mode: "task", id: 2, modeID: 2, isFinal: false },
            { x: 495, y: 345, mode: "task", id: 3, modeID: 3, isFinal: false },
            { x: 510, y: 240, mode: "task", id: 4, modeID: 4, isFinal: false }
        ])
        expect(transitionsToRemove).toEqual([
            { from: 2, to: 3, mode: "task", id: 2, read: "a" },
            { from: 3, to: 4, mode: "task", id: 3, read: "b" },
            { from: 4, to: 2, mode: "task", id: 4, read: "c" },
            { from: 3, to: 1, mode: "task", id: 5, read: "d" }
        ])
    })

        test('should not remove any states when all states are reachable from the initial state', () => {
            const project: FSAProjectGraph = {
                projectType: "FSA",
                states: [
                    { x: 180, y: 270, mode: "task", id: 0, modeID: 0, isFinal: false },
                    { x: 300, y: 180, mode: "task", id: 1, modeID: 1, isFinal: false },
                    { x: 285, y: 435, mode: "task", id: 2, modeID: 2, isFinal: false },
                    { x: 495, y: 345, mode: "task", id: 3, modeID: 3, isFinal: false },
                    { x: 510, y: 240, mode: "task", id: 4, modeID: 4, isFinal: false }
                ],
                transitions: [
                    { from: 0, to: 1, mode: "task", id: 0, read: "a" },
                    { from: 1, to: 2, mode: "task", id: 1, read: "b" },
                    { from: 2, to: 3, mode: "task", id: 2, read: "c" },
                    { from: 3, to: 4, mode: "task", id: 3, read: "d" }
                ],
                initialState: 0
            }

            const { statesToRemove, transitionsToRemove } = removeUnreachableStates(project)
            expect(statesToRemove).toEqual([])
            expect(transitionsToRemove).toEqual([])
        })
})
