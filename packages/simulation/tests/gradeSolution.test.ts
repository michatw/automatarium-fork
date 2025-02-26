import { TaskProjectGraph } from "frontend/src/types/ProjectTypes"
import { gradeSolution } from "../src/minimizeAutomaton"

describe('gradeSolution', () => {
    test('two simple exactly equal DEAs should return true', () => {
        const project: TaskProjectGraph = {
                    projectType: "T",
                    states: [
                        { x: 195, y: 375, mode: "task", id: 0, modeID: 0, isFinal: false },
                        { x: 495, y: 375, mode: "task", id: 1, modeID: 1, isFinal: false },
                        { x: 780, y: 375, mode: "task", id: 2, modeID: 2, isFinal: true },
                        { x: 315, y: 360, mode: "solution", id: 3, modeID: 0, isFinal: false },
                        { x: 615, y: 360, mode: "solution", id: 4, modeID: 1, isFinal: false },
                        { x: 840, y: 345, mode: "solution", id: 5, modeID: 2, isFinal: true }
                    ],
                    transitions: [
                        { from: 0, to: 1, mode: "task", id: 0, read: "a" },
                        { from: 1, to: 2, mode: "task", id: 1, read: "a" },
                        { from: 2, to: 2, mode: "task", id: 2, read: "a" },
                        { from: 3, to: 4, mode: "solution", id: 3, read: "a" },
                        { from: 4, to: 5, mode: "solution", id: 4, read: "a" },
                        { from: 5, to: 5, mode: "solution", id: 5, read: "a" }
                    ],
                    initialState: 0,
                    initialStateSolution: 3,
                    isSolutionVisible: true,
                    grade: null,
                }
        const grade = gradeSolution(project, "")
        expect(grade).toBe(true)
    })

    test('two slightly different DEAs should return false', () => {
        const project: TaskProjectGraph = {
                projectType: "T",
                states: [
                    { x: 195, y: 375, mode: "task", id: 0, modeID: 0, isFinal: false },
                    { x: 495, y: 375, mode: "task", id: 1, modeID: 1, isFinal: false },
                    { x: 780, y: 375, mode: "task", id: 2, modeID: 2, isFinal: true },
                    { x: 615, y: 360, mode: "solution", id: 4, modeID: 0, isFinal: false },
                    { x: 840, y: 345, mode: "solution", id: 5, modeID: 1, isFinal: true }
                ],
                transitions: [
                    { from: 0, to: 1, mode: "task", id: 0, read: "a" },
                    { from: 1, to: 2, mode: "task", id: 1, read: "a" },
                    { from: 2, to: 2, mode: "task", id: 2, read: "a" },
                    { from: 4, to: 5, mode: "solution", id: 4, read: "a" },
                    { from: 5, to: 5, mode: "solution", id: 5, read: "a" }
                ],
                initialState: 0,
                initialStateSolution: 4,
                isSolutionVisible: true,
                grade: null,
            }
        
        const grade = gradeSolution(project, "")
        expect(grade).toBe(false)
    })

    test('Two DEAs with different alphabet should produce an error', () => {
        const project: TaskProjectGraph = {
            projectType: "T",
            states: [
            { x: 195, y: 375, mode: "task", id: 0, modeID: 0, isFinal: false },
            { x: 495, y: 375, mode: "task", id: 1, modeID: 1, isFinal: false },
            { x: 780, y: 375, mode: "task", id: 2, modeID: 2, isFinal: true },
            { x: 615, y: 360, mode: "solution", id: 4, modeID: 0, isFinal: false },
            { x: 840, y: 345, mode: "solution", id: 5, modeID: 1, isFinal: true },
            { x: 780, y: 465, mode: "solution", id: 6, modeID: 2, isFinal: false }
            ],
            transitions: [
            { from: 0, to: 1, mode: "task", id: 0, read: "a" },
            { from: 1, to: 2, mode: "task", id: 1, read: "a" },
            { from: 2, to: 2, mode: "task", id: 2, read: "a" },
            { from: 4, to: 5, mode: "solution", id: 4, read: "b" },
            { from: 5, to: 5, mode: "solution", id: 5, read: "a" },
            { from: 4, to: 6, mode: "solution", id: 6, read: "a" },
            { from: 6, to: 6, mode: "solution", id: 7, read: "a" },
            { from: 6, to: 6, mode: "solution", id: 8, read: "b" },
            { from: 5, to: 5, mode: "solution", id: 9, read: "b" }
            ],
            initialState: 0,
            initialStateSolution: 4,
            isSolutionVisible: true,
            grade: null,
        }
        expect(() => gradeSolution(project, "")).toThrow(Error)
    })

    test('Two DEAs with different alphabet on task site should produce an error', () => {
        const project: TaskProjectGraph = {
            projectType: "T",
            states: [
            { x: 195, y: 375, mode: "solution", id: 0, modeID: 0, isFinal: false },
            { x: 495, y: 375, mode: "solution", id: 1, modeID: 1, isFinal: false },
            { x: 780, y: 375, mode: "solution", id: 2, modeID: 2, isFinal: true },
            { x: 615, y: 360, mode: "task", id: 4, modeID: 0, isFinal: false },
            { x: 840, y: 345, mode: "task", id: 5, modeID: 1, isFinal: true },
            { x: 780, y: 465, mode: "task", id: 6, modeID: 2, isFinal: false }
            ],
            transitions: [
            { from: 0, to: 1, mode: "solution", id: 0, read: "a" },
            { from: 1, to: 2, mode: "solution", id: 1, read: "a" },
            { from: 2, to: 2, mode: "solution", id: 2, read: "a" },
            { from: 4, to: 5, mode: "task", id: 4, read: "b" },
            { from: 5, to: 5, mode: "task", id: 5, read: "a" },
            { from: 4, to: 6, mode: "task", id: 6, read: "a" },
            { from: 6, to: 6, mode: "task", id: 7, read: "a" },
            { from: 6, to: 6, mode: "task", id: 8, read: "b" },
            { from: 5, to: 5, mode: "task", id: 9, read: "b" }
            ],
            initialState: 4,
            initialStateSolution: 1,
            isSolutionVisible: true,
            grade: null,
        }
        expect(() => gradeSolution(project, "")).toThrow(Error)
    })

    test('Two different but equivalent DEAs should return true', () => {
        const project: TaskProjectGraph = {
            projectType: "T",
            states: [
            { x: 195, y: 375, mode: "task", id: 0, modeID: 0, isFinal: false },
            { x: 495, y: 375, mode: "task", id: 1, modeID: 1, isFinal: false },
            { x: 780, y: 375, mode: "task", id: 2, modeID: 2, isFinal: true },
            { x: 315, y: 330, mode: "solution", id: 4, modeID: 0, isFinal: false },
            { x: 810, y: 345, mode: "solution", id: 6, modeID: 1, isFinal: false },
            { x: 945, y: 345, mode: "solution", id: 7, modeID: 2, isFinal: true },
            { x: 1050, y: 345, mode: "solution", id: 8, modeID: 3, isFinal: true }
            ],
            transitions: [
            { from: 0, to: 1, mode: "task", id: 0, read: "a" },
            { from: 1, to: 2, mode: "task", id: 1, read: "a" },
            { from: 2, to: 2, mode: "task", id: 2, read: "a" },
            { from: 7, to: 8, mode: "solution", id: 3, read: "a" },
            { from: 8, to: 8, mode: "solution", id: 4, read: "a" },
            { from: 6, to: 7, mode: "solution", id: 7, read: "a" },
            { from: 4, to: 6, mode: "solution", id: 8, read: "a" }
            ],
            initialState: 0,
            initialStateSolution: 4,
            isSolutionVisible: true,
            grade: null,
        }
        const grade = gradeSolution(project, "")
        expect(grade).toBe(true)
    })

    test('Two exactly equal complex deas should return true', () => {
        const project: TaskProjectGraph = {
            projectType: "T",
            states: [
                { x: 735, y: 915, mode: "solution", id: 5, modeID: 0, isFinal: false },
                { x: 1320, y: 915, mode: "solution", id: 6, modeID: 1, isFinal: false },
                { x: 1635, y: 900, mode: "solution", id: 7, modeID: 2, isFinal: false },
                { x: 1935, y: 900, mode: "solution", id: 8, modeID: 3,  isFinal: false },
                { x: 2085, y: 615, mode: "solution", id: 9, modeID: 4, isFinal: false },
                { x: 1740, y: 390, mode: "solution", id: 10, modeID: 5, isFinal: true },
                { x: 750, y: 765, mode: "solution", id: 11, modeID: 6, isFinal: false },
                { x: 1335, y: 765, mode: "solution", id: 12, modeID: 7, isFinal: false },
                { x: 1650, y: 765, mode: "solution", id: 13, modeID: 8, isFinal: false },
                { x: 2160, y: 390, mode: "solution", id: 14, modeID: 9, isFinal: false },
                { x: 745, y: 925, mode: "task", id: 15, modeID: 0, isFinal: false },
                { x: 1330, y: 925, mode: "task", id: 16, modeID: 1, isFinal: false },
                { x: 1645, y: 910, mode: "task", id: 17, modeID: 2, isFinal: false },
                { x: 1945, y: 910, mode: "task", id: 18, modeID: 3, isFinal: false },
                { x: 2095, y: 625, mode: "task", id: 19, modeID: 4, isFinal: false },
                { x: 1750, y: 400, mode: "task", id: 20, modeID: 5, isFinal: true },
                { x: 760, y: 775, mode: "task", id: 21, modeID: 6, isFinal: false },
                { x: 1345, y: 775, mode: "task", id: 22, modeID: 7, isFinal: false },
                { x: 1660, y: 775, mode: "task", id: 23, modeID: 8, isFinal: false },
                { x: 2170, y: 400, mode: "task", id: 24, modeID: 9, isFinal: false }
            ],
            transitions: [
                { from: 5, to: 6, mode: "solution", id: 0, read: "0" },
                { from: 6, to: 7, mode: "solution", id: 1, read: "0" },
                { from: 7, to: 8, mode: "solution", id: 2, read: "0" },
                { from: 10, to: 14, mode: "solution", id: 6, read: "1" },
                { from: 14, to: 10, mode: "solution", id: 7, read: "1" },
                { from: 14, to: 9, mode: "solution", id: 8, read: "0" },
                { from: 10, to: 9, mode: "solution", id: 9, read: "0" },
                { from: 9, to: 9, mode: "solution", id: 10, read: "0" },
                { from: 9, to: 9, mode: "solution", id: 11, read: "1" },
                { from: 5, to: 11, mode: "solution", id: 12, read: "1" },
                { from: 11, to: 5, mode: "solution", id: 13, read: "1" },
                { from: 12, to: 6, mode: "solution", id: 14, read: "1" },
                { from: 6, to: 12, mode: "solution", id: 15, read: "1" },
                { from: 13, to: 7, mode: "solution", id: 16, read: "1" },
                { from: 7, to: 13, mode: "solution", id: 17, read: "1" },
                { from: 11, to: 12, mode: "solution", id: 18, read: "0" },
                { from: 12, to: 13, mode: "solution", id: 19, read: "0" },
                { from: 8, to: 10, mode: "solution", id: 20, read: "1" },
                { from: 8, to: 9, mode: "solution", id: 21, read: "0" },
                { from: 13, to: 10, mode: "solution", id: 22, read: "0" },
                { from: 15, to: 16, mode: "task", id: 23, read: "0" },
                { from: 16, to: 17, mode: "task", id: 24, read: "0" },
                { from: 17, to: 18, mode: "task", id: 25, read: "0" },
                { from: 20, to: 24, mode: "task", id: 26, read: "1" },
                { from: 24, to: 20, mode: "task", id: 27, read: "1" },
                { from: 24, to: 19, mode: "task", id: 28, read: "0" },
                { from: 20, to: 19, mode: "task", id: 29, read: "0" },
                { from: 19, to: 19, mode: "task", id: 30, read: "0" },
                { from: 19, to: 19, mode: "task", id: 31, read: "1" },
                { from: 15, to: 21, mode: "task", id: 32, read: "1" },
                { from: 21, to: 15, mode: "task", id: 33, read: "1" },
                { from: 22, to: 16, mode: "task", id: 34, read: "1" },
                { from: 16, to: 22, mode: "task", id: 35, read: "1" },
                { from: 23, to: 17, mode: "task", id: 36, read: "1" },
                { from: 17, to: 23, mode: "task", id: 37, read: "1" },
                { from: 21, to: 22, mode: "task", id: 38, read: "0" },
                { from: 22, to: 23, mode: "task", id: 39, read: "0" },
                { from: 18, to: 20, mode: "task", id: 40, read: "1" },
                { from: 18, to: 19, mode: "task", id: 41, read: "0" },
                { from: 23, to: 20, mode: "task", id: 42, read: "0" }
            ],
            initialState: 15,
            initialStateSolution: 5,
            isSolutionVisible: true,
            grade: null,
        }
        const grade = gradeSolution(project, "")
        expect(grade).toBe(true)
    })

    test('Two different but equivalent complex DEA on task site and NEA on solution side should return true', () => {
        const project: TaskProjectGraph = {
            projectType: "T",
            states: [
            { id: 0, modeID: 0, x: 0, y: 400, isFinal: false, mode: "task", name: "10,8,0,6,2,4,11,12" },
            { id: 1, modeID: 1, x: 100, y: 400, isFinal: false, mode: "task", name: "1,9,8,0,6,2,4,11,12,13" },
            { id: 2, modeID: 2, x: 200, y: 400, isFinal: false, mode: "task", name: "3,7,9,8,0,6,2,4,11,12,14" },
            { id: 3, modeID: 3, x: 300, y: 400, isFinal: false, mode: "task", name: "3,7,9,8,0,6,2,4,11,12" },
            { id: 4, modeID: 4, x: 400, y: 400, isFinal: false, mode: "task", name: "5,7,9,8,0,6,2,4,11,12" },
            { id: 5, modeID: 5, x: 500, y: 400, isFinal: true, mode: "task", name: "5,7,9,8,0,6,2,4,11,12,15,26,24,16,22,18,20,27" },
            { id: 6, modeID: 6, x: 600, y: 400, isFinal: true, mode: "task", name: "1,9,8,0,6,2,4,11,12,13,17,25,24,16,22,18,20,27" },
            { id: 7, modeID: 7, x: 700, y: 400, isFinal: true, mode: "task", name: "3,7,9,8,0,6,2,4,11,12,14,19,23,25,24,16,22,18,20,27" },
            { id: 8, modeID: 8, x: 800, y: 400, isFinal: true, mode: "task", name: "3,7,9,8,0,6,2,4,11,12,19,23,25,24,16,22,18,20,27" },
            { id: 9, modeID: 9, x: 900, y: 400, isFinal: true, mode: "task", name: "5,7,9,8,0,6,2,4,11,12,21,23,25,24,16,22,18,20,27" },
            { id: 10, modeID: 10, x: 1000, y: 400, isFinal: true, mode: "task", name: "5,7,9,8,0,6,2,4,11,12,15,26,24,16,22,18,20,27,21,23,25,24,16,22,18,20,27" },
            { id: 11, modeID: 11, x: 1100, y: 400, isFinal: true, mode: "task", name: "1,9,8,0,6,2,4,11,12,13,17,25,24,16,22,18,20,27" },
            { id: 12, modeID: 12, x: 1200, y: 400, isFinal: true, mode: "task", name: "3,7,9,8,0,6,2,4,11,12,19,23,25,24,16,22,18,20,27" },
            { id: 13, modeID: 13, x: 1300, y: 400, isFinal: true, mode: "task", name: "5,7,9,8,0,6,2,4,11,12,21,23,25,24,16,22,18,20,27" },
            { id: 14, modeID: 0, x: 255, y: 180, isFinal: false, mode: "solution" },
            { id: 15, modeID: 1, x: 615, y: 225, isFinal: false, mode: "solution" },
            { id: 16, modeID: 2, x: 765, y: 240, isFinal: false, mode: "solution" },
            { id: 17, modeID: 3, x: 885, y: 255, isFinal: true, mode: "solution" },
            { id: 18, modeID: 4, x: 480, y: 405, isFinal: false, mode: "solution" }
            ],
            transitions: [
            { id: 0, from: 0, to: 1, read: "a", mode: "task" },
            { id: 1, from: 1, to: 1, read: "a", mode: "task" },
            { id: 2, from: 1, to: 2, read: "b", mode: "task" },
            { id: 3, from: 2, to: 1, read: "a", mode: "task" },
            { id: 4, from: 2, to: 3, read: "b", mode: "task" },
            { id: 5, from: 3, to: 1, read: "a", mode: "task" },
            { id: 6, from: 3, to: 3, read: "b", mode: "task" },
            { id: 7, from: 3, to: 4, read: "c", mode: "task" },
            { id: 8, from: 4, to: 1, read: "a", mode: "task" },
            { id: 9, from: 4, to: 3, read: "b", mode: "task" },
            { id: 10, from: 4, to: 4, read: "c", mode: "task" },
            { id: 11, from: 2, to: 5, read: "c", mode: "task" },
            { id: 12, from: 5, to: 6, read: "a", mode: "task" },
            { id: 13, from: 6, to: 6, read: "a", mode: "task" },
            { id: 14, from: 6, to: 7, read: "b", mode: "task" },
            { id: 15, from: 7, to: 6, read: "a", mode: "task" },
            { id: 16, from: 7, to: 8, read: "b", mode: "task" },
            { id: 17, from: 8, to: 6, read: "a", mode: "task" },
            { id: 18, from: 8, to: 8, read: "b", mode: "task" },
            { id: 19, from: 8, to: 9, read: "c", mode: "task" },
            { id: 20, from: 9, to: 6, read: "a", mode: "task" },
            { id: 21, from: 9, to: 8, read: "b", mode: "task" },
            { id: 22, from: 9, to: 9, read: "c", mode: "task" },
            { id: 23, from: 7, to: 10, read: "c", mode: "task" },
            { id: 24, from: 10, to: 11, read: "a", mode: "task" },
            { id: 25, from: 11, to: 11, read: "a", mode: "task" },
            { id: 26, from: 11, to: 7, read: "b", mode: "task" },
            { id: 27, from: 11, to: 9, read: "c", mode: "task" },
            { id: 28, from: 10, to: 12, read: "b", mode: "task" },
            { id: 29, from: 12, to: 11, read: "a", mode: "task" },
            { id: 30, from: 12, to: 12, read: "b", mode: "task" },
            { id: 31, from: 12, to: 9, read: "c", mode: "task" },
            { id: 32, from: 10, to: 13, read: "c", mode: "task" },
            { id: 33, from: 13, to: 11, read: "a", mode: "task" },
            { id: 34, from: 13, to: 12, read: "b", mode: "task" },
            { id: 35, from: 13, to: 13, read: "c", mode: "task" },
            { id: 36, from: 6, to: 13, read: "c", mode: "task" },
            { id: 37, from: 5, to: 12, read: "b", mode: "task" },
            { id: 38, from: 5, to: 13, read: "c", mode: "task" },
            { id: 39, from: 1, to: 4, read: "c", mode: "task" },
            { id: 40, from: 0, to: 3, read: "b", mode: "task" },
            { id: 41, from: 0, to: 4, read: "c", mode: "task" },
            { id: 1, from: 14, to: 14, read: "a", mode: "solution" },
            { id: 2, from: 14, to: 14, read: "b", mode: "solution" },
            { id: 3, from: 14, to: 14, read: "c", mode: "solution" },
            { id: 4, from: 14, to: 15, read: "a", mode: "solution" },
            { id: 5, from: 15, to: 16, read: "b", mode: "solution" },
            { id: 6, from: 16, to: 17, read: "c", mode: "solution" },
            { id: 7, from: 17, to: 17, read: "a", mode: "solution" },
            { id: 8, from: 17, to: 17, read: "b", mode: "solution" },
            { id: 9, from: 17, to: 17, read: "c", mode: "solution" },
            { id: 10, from: 15, to: 18, read: "a", mode: "solution" },
            { id: 11, from: 15, to: 18, read: "c", mode: "solution" },
            { id: 12, from: 16, to: 18, read: "a", mode: "solution" },
            { id: 13, from: 16, to: 18, read: "b", mode: "solution" },
            { id: 14, from: 18, to: 18, read: "a", mode: "solution" },
            { id: 15, from: 18, to: 18, read: "b", mode: "solution" },
            { id: 16, from: 18, to: 18, read: "c", mode: "solution" }
            ],
            initialState: 0,
            initialStateSolution: 14,
            isSolutionVisible: true,
            grade: null,
        }
        const grade = gradeSolution(project, "")
        expect(grade).toBe(true)
    })

    test('Another complex DEA on task site and NEA on solution side should return true', () => {
        const project: TaskProjectGraph = {
            projectType: "T",
            states: [
            { id: 0, modeID: 0, name: "10,0,11", x: 0, y: 400, isFinal: true, mode: "task" },
            { id: 1, modeID: 1, name: "1,8,6,2,4,9,0,11", x: 100, y: 400, isFinal: true, mode: "task" },
            { id: 2, modeID: 2, name: "3,7,6,2,4,9,0,11", x: 200, y: 400, isFinal: true, mode: "task" },
            { id: 3, modeID: 3, name: "1,8,6,2,4,9,0,11,5,7,6,2,4,9,0,11", x: 300, y: 400, isFinal: true, mode: "task" },
            { id: 4, modeID: 4, name: "3,7,6,2,4,9,0,11", x: 400, y: 400, isFinal: true, mode: "task" },
            { id: 5, modeID: 5, name: "1,8,6,2,4,9,0,11,5,7,6,2,4,9,0,11", x: 500, y: 400, isFinal: true, mode: "task" },
            { id: 6, modeID: 6, x: 0, y: 500, isFinal: false, mode: "task", name: "Trap" },
            { x: 240, y: 195, mode: "solution", id: 7, modeID: 0, isFinal: true },
            { x: 450, y: 240, mode: "solution", id: 8, modeID: 1, isFinal: true },
            { x: 315, y: 450, mode: "solution", id: 9, modeID: 2, isFinal: false }
            ],
            transitions: [
            { from: 0, to: 1, read: "1", id: 0, mode: "task" },
            { from: 1, to: 2, read: "0", id: 1, mode: "task" },
            { from: 2, to: 2, read: "0", id: 2, mode: "task" },
            { from: 2, to: 3, read: "1", id: 3, mode: "task" },
            { from: 3, to: 4, read: "0", id: 4, mode: "task" },
            { from: 4, to: 4, read: "0", id: 5, mode: "task" },
            { from: 4, to: 3, read: "1", id: 6, mode: "task" },
            { from: 3, to: 5, read: "1", id: 7, mode: "task" },
            { from: 5, to: 4, read: "0", id: 8, mode: "task" },
            { from: 5, to: 5, read: "1", id: 9, mode: "task" },
            { from: 1, to: 5, read: "1", id: 10, mode: "task" },
            { from: 0, to: 6, read: "0", id: 11, mode: "task" },
            { from: 6, to: 6, read: "0", id: 12, mode: "task" },
            { from: 6, to: 6, read: "1", id: 13, mode: "task" },
            { from: 7, to: 8, mode: "solution", id: 0, read: "1" },
            { from: 8, to: 8, mode: "solution", id: 1, read: "1" },
            { from: 8, to: 8, mode: "solution", id: 2, read: "0" },
            { from: 7, to: 9, mode: "solution", id: 3, read: "1" },
            { from: 7, to: 9, mode: "solution", id: 4, read: "0" },
            { from: 9, to: 9, mode: "solution", id: 5, read: "1" },
            { from: 9, to: 9, mode: "solution", id: 6, read: "0" }
            ],
            initialState: 0,
            initialStateSolution: 7,
            isSolutionVisible: true,
            grade: null
        }
        const grade = gradeSolution(project, "")
        expect(grade).toBe(true)
    })

    test ('A nea on task site and a dea on solution site should return true', () => {
        const project: TaskProjectGraph = {
                projectType: "T",
                states: [
                    { x: 165, y: 375, mode: "solution", id: 3, modeID: 0, isFinal: false, blockID: null },
                    { x: 300, y: 90, mode: "solution", id: 4, modeID: 1, isFinal: true, blockID: null },
                    { x: 435, y: 240, mode: "solution", id: 5, modeID: 2, isFinal: true, blockID: null },
                    { x: 330, y: 480, mode: "solution", id: 6, modeID: 3, isFinal: false, blockID: null },
                    { x: 390, y: 540, mode: "task", id: 7, modeID: 0, isFinal: false },
                    { x: 660, y: 345, mode: "task", id: 8, modeID: 1, isFinal: true },
                    { x: 795, y: 210, mode: "task", id: 9, modeID: 2, isFinal: true }
                ],
                transitions: [
                    { from: 3, to: 4, mode: "solution", id: 3, read: "a" },
                    { from: 4, to: 4, mode: "solution", id: 4, read: "a" },
                    { from: 4, to: 5, mode: "solution", id: 5, read: "b" },
                    { from: 3, to: 6, mode: "solution", id: 6, read: "b" },
                    { from: 5, to: 6, mode: "solution", id: 7, read: "a" },
                    { from: 5, to: 6, mode: "solution", id: 8, read: "b" },
                    { from: 6, to: 6, mode: "solution", id: 9, read: "a" },
                    { from: 6, to: 6, mode: "solution", id: 10, read: "b" },
                    { from: 8, to: 9, mode: "task", id: 11, read: "b" },
                    { from: 7, to: 8, mode: "task", id: 12, read: "a" },
                    { from: 7, to: 7, mode: "task", id: 13, read: "a" }
                ],
                initialState: 7,
                initialStateSolution: 3,
                isSolutionVisible: true,
                grade: null
            }
            const grade = gradeSolution(project, "")
            expect(grade).toBe(true)
    })

    test('A nea on task site and a dea on solution site should return false when not equivalent', () => {
        const project: TaskProjectGraph = {
            projectType: "T",
            states: [
                { x: 165, y: 375, mode: "solution", id: 3, modeID: 0, isFinal: false, blockID: null },
                { x: 300, y: 90, mode: "solution", id: 4, modeID: 1, isFinal: true, blockID: null },
                { x: 435, y: 240, mode: "solution", id: 5, modeID: 2, isFinal: true, blockID: null },
                { x: 330, y: 480, mode: "solution", id: 6, modeID: 3, isFinal: false, blockID: null },
                { x: 390, y: 540, mode: "task", id: 7, modeID: 0, isFinal: false },
                { x: 660, y: 345, mode: "task", id: 8, modeID: 1, isFinal: false },
                { x: 795, y: 210, mode: "task", id: 9, modeID: 2, isFinal: true }
            ],
            transitions: [
                { from: 3, to: 4, mode: "solution", id: 3, read: "a" },
                { from: 4, to: 4, mode: "solution", id: 4, read: "a" },
                { from: 4, to: 5, mode: "solution", id: 5, read: "b" },
                { from: 3, to: 6, mode: "solution", id: 6, read: "b" },
                { from: 5, to: 6, mode: "solution", id: 7, read: "a" },
                { from: 5, to: 6, mode: "solution", id: 8, read: "b" },
                { from: 6, to: 6, mode: "solution", id: 9, read: "a" },
                { from: 6, to: 6, mode: "solution", id: 10, read: "b" },
                { from: 8, to: 9, mode: "task", id: 11, read: "b" },
                { from: 7, to: 8, mode: "task", id: 12, read: "a" },
                { from: 7, to: 7, mode: "task", id: 13, read: "a" },
            ],
            initialState: 7,
            initialStateSolution: 3,
            isSolutionVisible: true,
            grade: null
        }
        const grade = gradeSolution(project, "")
        expect(grade).toBe(false)
    })
})