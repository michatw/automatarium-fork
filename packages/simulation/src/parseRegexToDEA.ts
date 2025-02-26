import { AutomataState, FSAAutomataTransition } from "frontend/src/types/ProjectTypes"
import { TASK_MODE } from "shared/constants"
import { logger } from "shared/logging"

class TreeNode {
    value: string
    isOperand: boolean
    left: TreeNode | null
    right: TreeNode | null
    constructor(value: string) {
        this.value = value
        this.left = null
        this.right = null
        this.isOperand = false
    }
}

export const parseRegexToDEA = (regex: string): { states: AutomataState[], transitions:FSAAutomataTransition[], initialState: number } => {
    let rootNode = parseRegexToTree(regex)
    let automaton = buildEpsilonNEA(rootNode, 0, 0, null, findFinalPart(rootNode))
    let dea =  convertToDEA(automaton.result, automaton.initialState)
    return completeDEA(dea)
}

// let myRegex = '(aa*bb*cc*)'
// let rootNode = parseRegexToTree(myRegex)
// printTree(rootNode)
// logger.debug(__filename, "Traversing tree")
// logger.debug(__filename, "Final part", findFinalPart(rootNode))
// const automaton = buildEpsilonNEA(rootNode, 0, 0, null, findFinalPart(rootNode));
// logger.debug(__filename, "Transitions:");
// console.log(automaton.result.transitions);
// logger.debug(__filename, "States:");
// logger.debug(__filename, automaton.result.states);
// logger.debug(__filename, "Initial state:");
// logger.debug(__filename, automaton.initialState);
// const dea = convertToDEA(automaton.result, automaton.initialState);
// const completeDEAResult = completeDEA(dea);
// logger.debug(__filename, "DEA:", completeDEAResult);

class ParsedAutomaton {
    states: AutomataState[]
    transitions: FSAAutomataTransition[]
}

/*
    Top Level function to parse a regex to a DEA
*/
function parseRegexToTree(regex: string): TreeNode {
    let rootNode: TreeNode = new TreeNode(regex)
    buildTreev2(rootNode)
    return rootNode
}

/*
    This function prints the tree for debugging purposes
*/
function printTree(node: TreeNode, indent: string = "", position: string = "") {
    if(position != ""){
        console.log(indent, "Position: ", position)
    }
    console.log(indent, "Node value: ", node.value)
    console.log(indent, "Is operand: ", node.isOperand)
    if (node.left != null) {
        printTree(node.left, indent + "    ", "left")
    }
    if (node.right != null) {
        printTree(node.right, indent + "    ", "right")
    }
}

/*
    This function build the tree. All characters of the regex are stored as leafs. All Operators are stored as nodes one level above the leafs.
    The tree should be traversed from left to right to have the regex in the right order.
*/
function buildTreev2(node: TreeNode): TreeNode{
    logger.info(__filename, "Building tree for node value ", node.value)
    let regExp = node.value
    let lengthToStop = regExp.length - 1
    logger.info(__filename, "Length to stop: ", lengthToStop)
    for (let index = 0; index <= lengthToStop; index++) {
        let currentChar = regExp[index]
        logger.info(__filename, "Looking at current char: ", currentChar)
        if (currentChar == "(") {
            logger.info(__filename, "Found bracket at index ", index)
            if(index == 0){
                // If the bracket is the first char, there are no characters to split before the bracket.
                let closingBracketIdx = findMatchingClosingBracket(regExp, index + 1)
                node.left = new TreeNode(regExp.substring(index + 1, closingBracketIdx))
                let leftQuantified:boolean = isQuantified(node.left, regExp[closingBracketIdx + 1])
                logger.info(__filename, "Building tree 1 for node value ", node.left.value)
                if (!leftQuantified) {
                    buildTreev2(node.left)
                }
                if(closingBracketIdx + 1 + Number(leftQuantified) < regExp.length){
                    logger.info(__filename, "Relevant part after closing bracket: ", regExp.substring(closingBracketIdx + 1 + Number(leftQuantified), regExp.length))
                    node.right = new TreeNode(regExp.substring(closingBracketIdx + 1 + Number(leftQuantified), regExp.length))
                    buildTreev2(node.right)
                }
                break
            }
            else{
                // If the bracket is not the first char we need to split everything left from the bracket and everything right from the bracket
                node.left = new TreeNode(regExp.substring(0, index))
                logger.info(__filename, "Building tree 2 for node value ", node.left.value)
                buildTreev2(node.left)
                node.right = new TreeNode(regExp.substring(index, regExp.length))
                logger.info(__filename, "Building tree 3 for node value ", node.right.value)
                buildTreev2(node.right)
                break
            }
        } else if (currentChar == "*"){
            logger.info(__filename, "Found * at index ", index)
            if(index == lengthToStop){
                logger.info(__filename, "Found * at the end of the regex")
                // If the * is the second character there is nothing to split before the quantified character
                if(index == 1){
                    node.left = new TreeNode("*")
                    node.left.isOperand = true
                    node.left.left = new TreeNode(regExp[index - 1])
                } else {
                    node.left = new TreeNode(regExp.substring(0, index - 1))
                    logger.info(__filename, "Building tree 4 for node value ", node.left.value)
                    buildTreev2(node.left)
                    node.right = new TreeNode("*")
                    node.right.isOperand = true
                    node.right.left = new TreeNode(regExp[index - 1])
                }
            }
            else{
                logger.info(__filename, "Found * in the middle of the regex")
                node.left = new TreeNode(regExp.substring(0, index +1))
                logger.info(__filename, "Building tree 5 for node value ", node.left.value)
                buildTreev2(node.left)
                node.right = new TreeNode(regExp.substring(index +1, regExp.length))
                logger.info(__filename, "Building tree 6 for node value ", node.right.value)
                buildTreev2(node.right)
            }
        } else if (currentChar == "+") {
            logger.info(__filename, "Found + at index ", index)
            node.value = "+"
            node.isOperand = true
            node.left = new TreeNode(regExp.substring(0, index))
            logger.info(__filename, "Building tree 7 for node value ", node.left.value)
            buildTreev2(node.left)
            node.right = new TreeNode(regExp.substring(index + 1, regExp.length))
            logger.info(__filename, "Building tree 8 for node value ", node.right.value)
            buildTreev2(node.right)
            break
        }
    }

    logger.info(__filename, "Finished building tree for ", node.value)
    return node
}

/*
    Legacy build tree function. The difference between this and buildTreev2 is that this function only accepts kleene stars if the quantified characters are in brackets.
*/
function buildTree(node: TreeNode): TreeNode{
    logger.info(__filename, "Building tree for node value ", node.value)
    let regExp = node.value
    for (let index = 0; index < regExp.length; index++) {
        let currentChar = regExp[index]
        if (currentChar == "(") {
            logger.info(__filename, "Found bracket at index ", index)
            if(index == 0){
                // If the bracket is the first char, there are no characters to split before the bracket.
                let closingBracketIdx = findMatchingClosingBracket(regExp, index + 1)
                node.left = new TreeNode(regExp.substring(index + 1, closingBracketIdx))
                let leftQuantified:boolean = isQuantified(node.left, regExp[closingBracketIdx + 1])
                buildTree(node.left)
                if(closingBracketIdx + 1 + Number(leftQuantified) < regExp.length){
                    node.right = new TreeNode(regExp.substring(closingBracketIdx + 1 + Number(leftQuantified), regExp.length))
                    buildTree(node.right)
                }
                break
            }
            else{
                // If the bracket is not the first char we need to split everything left from the bracket and everything right from the bracket
                node.left = new TreeNode(regExp.substring(0, index))
                buildTree(node.left)
                node.right = new TreeNode(regExp.substring(index, regExp.length))
                buildTree(node.right)
                break
            }
        } else if (currentChar == "+") {
            logger.info(__filename, "Found + at index ", index)
            node.value = "+"
            node.isOperand = true
            node.left = new TreeNode(regExp.substring(0, index))
            buildTree(node.left)
            node.right = new TreeNode(regExp.substring(index + 1, regExp.length))
            buildTree(node.right)
            break
        }
    }
    return node
}

/*
    Checks if the next character is a kleene star. If this is the case the value of the current node is set as a leaf of a node containing the kleene star operator.
*/
function isQuantified(node: TreeNode, character: string):boolean {
    if (character == "*") {
        logger.info(__filename, "Found * quantified node:", node.value)
        let tempNodeValue = node.value
        node.value = "*"
        node.isOperand = true;
        node.left = new TreeNode(tempNodeValue);
        buildTreev2(node.left)
        return true
    }
    return false
}

function findMatchingClosingBracket(regex: string, counter: number): number{
    let unclosedBrackets = 0
    for(let i = counter; i < regex.length; i ++){
        if (regex[i] == "("){
            unclosedBrackets++
        }
        if(regex[i] == ")"){
            if(unclosedBrackets == 0){
                return i
            }
            else{
                unclosedBrackets--
            }
        }
    }
    return -1
}

/*
    This function takes an tree build above as an input and converts it to an epsilon NEA. Instead of an epsilon automatarium uses the lambda symbol.
*/
function buildEpsilonNEA(node: TreeNode, stateCounter:number, transitionCounter:number, initialState:number, finalPart:TreeNode = null): {result:ParsedAutomaton, sCounter:number, tCounter:number, initialState:number|null} {
    logger.info(__filename, "Building epsilon NEA for node value ", node.value, "State counter ", stateCounter, "Transition counter ", transitionCounter)

    const parseResult: ParsedAutomaton = {
        states: [],
        transitions: [],
    }

    if (node.left == null && node.right == null){
        const isFinalPart = node == finalPart
        for (let i = 0; i < node.value.length; i++) {
            const id = stateCounter ++
            const modeID = id
            const newState: AutomataState = {
                id: id,
                modeID: modeID,
                x: 0,
                y: 0,
                isFinal: false,
                mode: TASK_MODE
            }
            parseResult.states.push(newState)
            if (i == 0){
                initialState = newState.id
            }
            if (i > 0) {
                const transition: FSAAutomataTransition = {
                    id: transitionCounter++,
                    from: parseResult.states[parseResult.states.length - 2].id,
                    to: newState.id,
                    read: node.value[i-1]
                }
                parseResult.transitions.push(transition)
            }
            if (i === node.value.length - 1) {
                const id = stateCounter ++
                const modeID = id
                const newState2: AutomataState = {
                    id: id,
                    modeID: modeID,
                    x: 0,
                    y: 0,
                    isFinal: isFinalPart && i === node.value.length - 1,
                    mode: TASK_MODE
                }
                parseResult.states.push(newState2)
                const transition: FSAAutomataTransition = {
                    id: transitionCounter++,
                    from: newState.id,
                    to: newState2.id,
                    read: node.value[i]
                }
                parseResult.transitions.push(transition)
            }
        }
    }
    else if (node.isOperand) {
        logger.info(__filename, "Node value is operand: ", node.value)
        let isFinalPart = node == finalPart
        if(node.value == "+"){
            logger.info(__filename, "Operand value is +")
            const left = buildEpsilonNEA(node.left, stateCounter, transitionCounter, null, finalPart) // Traverse the left subtree
            const leftResult = left.result
            stateCounter = left.sCounter
            transitionCounter = left.tCounter
            const right = buildEpsilonNEA(node.right, stateCounter, transitionCounter, null, finalPart) // Traverse the right subtree
            const rightResult = right.result
            stateCounter = right.sCounter
            transitionCounter = right.tCounter

            let id = stateCounter ++
            let modeID = id
            const startState: AutomataState = {
                id: id,
                modeID: modeID,
                x: 0,
                y: 0,
                isFinal: false,
                mode: TASK_MODE
            }
            if (initialState === null) {
                initialState = startState.id;
            }
            parseResult.states.push(startState)
            const leftStartTransition: FSAAutomataTransition = {
                id: transitionCounter++,
                from:startState.id,
                to: left.initialState,
                read: "λ"
            }
            parseResult.transitions.push(leftStartTransition)

            const rightStartTransition: FSAAutomataTransition = {
                id: transitionCounter++,
                from: startState.id,
                to: right.initialState,
                read: "λ"
            }
            parseResult.transitions.push(rightStartTransition)

            const combinedStates = [...leftResult.states, ...rightResult.states];
            const combinedTransitions = [...leftResult.transitions, ...rightResult.transitions];

            parseResult.states.push(...combinedStates);
            parseResult.transitions.push(...combinedTransitions);

            id = stateCounter ++
            modeID = id
            const endState: AutomataState = {
                id: id,
                modeID: modeID,
                x: 0,
                y: 0,
                isFinal: isFinalPart,
                mode: TASK_MODE
            }
            parseResult.states.push(endState)

            // This is a hack to prevent the program from crashing with an undefined error message. It should be fixed in the future.
            try {
                let from = leftResult.states[leftResult.states.length - 1].id
            } catch (error) {
                throw new Error(`Some Regex constructs are known to be produce problems. If your regex includes "(...)*+..." or "(...)+..." try to rewrite it.`)
            }
            const leftEndTransition: FSAAutomataTransition = {
                id: transitionCounter++,
                from: leftResult.states[leftResult.states.length - 1].id,
                to: endState.id,
                read: "λ"
            }
            parseResult.transitions.push(leftEndTransition)
            const rightEndTransition: FSAAutomataTransition = {
                id: transitionCounter++,
                from: rightResult.states[rightResult.states.length - 1].id,
                to: endState.id,
                read: "λ"
            }
            parseResult.transitions.push(rightEndTransition)
        } else if(node.value == "*"){
            logger.info(__filename, "Operand value is *")
            const left = buildEpsilonNEA(node.left, stateCounter, transitionCounter, null, finalPart) // Traverse the left subtree
            const leftResult = left.result
            parseResult.states.push(...leftResult.states);
            parseResult.transitions.push(...leftResult.transitions);
            stateCounter = left.sCounter
            transitionCounter = left.tCounter

            let id = stateCounter ++
            let modeID = id
            const startState: AutomataState = {
                id: id,
                modeID: modeID,
                x: 0,
                y: 0,
                isFinal: false,
                mode: TASK_MODE
            }
            if (initialState === null) {
                logger.debug(__filename, "Setting initial state to ", startState.id, "for node value ", node.value)
                initialState = startState.id;
            }
            parseResult.states.push(startState)
            const leftStartTransition: FSAAutomataTransition = {
                id: transitionCounter++,
                from: startState.id,
                to: leftResult.states[0].id,
                read: "λ"
            }
            parseResult.transitions.push(leftStartTransition)

            const loopTransition: FSAAutomataTransition = {
                id: transitionCounter++,
                from: leftResult.states[leftResult.states.length - 1].id,
                to: leftResult.states[0].id,
                read: "λ"
            }
            parseResult.transitions.push(loopTransition)

            id = stateCounter ++
            modeID = id
            const endState: AutomataState = {
                id: id,
                modeID: modeID,
                x: 0,
                y: 0,
                isFinal: isFinalPart,
                mode: TASK_MODE
            }
            parseResult.states.push(endState)

            const endTransition: FSAAutomataTransition = {
                id: transitionCounter++,
                from: leftResult.states[leftResult.states.length - 1].id,
                to: endState.id,
                read: "λ"
            }
            parseResult.transitions.push(endTransition)

            const endTransition2: FSAAutomataTransition = {
                id: transitionCounter++,
                from: startState.id,
                to: endState.id,
                read: "λ"
            }
            parseResult.transitions.push(endTransition2)
        }
    }
    else{
        logger.info(__filename, "Called for node value", node.value)
        let rightBeginState: number = null
        let leftEndState: number = null
        if (node.left != null) {
            const left = buildEpsilonNEA(node.left, stateCounter, transitionCounter, null, finalPart) // Traverse the left subtree
            logger.debug(__filename, "Left", left, "nodevalue", node.value)
            const leftResult = left.result
            leftEndState = leftResult.states[leftResult.states.length - 1].id
            stateCounter = left.sCounter
            transitionCounter = left.tCounter
            if(left.initialState != null){
                initialState = left.initialState
            }
            parseResult.states.push(...leftResult.states);
            parseResult.transitions.push(...leftResult.transitions);
        }
        if (node.right != null) {
            const right = buildEpsilonNEA(node.right, stateCounter, transitionCounter, null, finalPart) // Traverse the right subtree
            const rightResult = right.result
            rightBeginState = right.initialState
            logger.debug(__filename, "Right initial state", right.initialState, " for node value ", node.value)
            stateCounter = right.sCounter
            transitionCounter = right.tCounter
            parseResult.states.push(...rightResult.states);
            parseResult.transitions.push(...rightResult.transitions);
        }

        logger.debug(__filename, "Left end State ", leftEndState, "right begin state ", rightBeginState, "Node value ", node.value)
        if (leftEndState != null && rightBeginState != null) {
            logger.info(__filename, "Making transition to connect both parts ", node.value)
            const transition: FSAAutomataTransition = {
                id: transitionCounter++,
                from: leftEndState,
                to: rightBeginState,
                read: "λ"
            }
            parseResult.transitions.push(transition)
        }
    }

    return {result: parseResult, sCounter: stateCounter, tCounter: transitionCounter, initialState: initialState}
}

/*
    Is needed to find the final part of the tree that isn't an operator. 
*/
function findFinalPart(node: TreeNode): TreeNode {
    let parentNode
    do {
        if (node.isOperand) {
            return node;
        }
        parentNode = node
        node = node.right;
        if (node == null && parentNode.left) {
            node = parentNode.left
        }
    } while (node != null);
    logger.info(__filename, "Returning final part ", parentNode.value)
    return parentNode;
}

/*
    Takes an epsilon NEA as input and converts it to a DEA
*/
function convertToDEA(epsilonNEA: ParsedAutomaton, initialStateId:number): { states: AutomataState[], transitions: FSAAutomataTransition[], initialState: number } {
    const dea: ParsedAutomaton = { states: [], transitions: [] };

    const epsilonClosures = getEpsilonClosures(epsilonNEA);

    const alphabet: string[] = [];

    for (let i = 0; i < epsilonNEA.transitions.length; i++) {
        const transition = epsilonNEA.transitions[i];
        if (transition.read !== "λ" && !alphabet.includes(transition.read)) {
            alphabet.push(transition.read);
        }
    }
    
    const initialState: AutomataState = epsilonNEA.states.find(state => state.id === initialStateId);
    const {result, initialState: initialStateDEA, sCounter, tCounter} = convertFromSingleStateOnwards([initialState], epsilonNEA, dea, alphabet, epsilonClosures, new Map<string, number>(), 0, 0, []);

    return {states: result.states, transitions: result.transitions, initialState: initialStateDEA}; 
}

/*
    This function is part of the conversion from NEA to DEA.
*/
function convertFromSingleStateOnwards(currentStates: AutomataState[], epsilonNea: ParsedAutomaton, dea: ParsedAutomaton, alphabet: string[], epsilonClosures: { stateId: number, closure: number[] }[], mapNeaToDEAStates:Map<string, number>, sCounter:number, tCounter:number, visitedStates: string []): {result:ParsedAutomaton, initialState:number, sCounter:number, tCounter:number} {
    logger.debug(__filename, "Called for ", currentStates)
    let initialState:number = null
    let currentStateIDs: number[] = []
    let currentStateClosures: number[][] = [];
    for (const state of currentStates) {
        const closure = getSingleClosure(state.id, epsilonNea);
        logger.debug(__filename, "Closure for state ", state.id, "is", closure)
        currentStateClosures.push(closure);
    }
    currentStateIDs.push(...currentStateClosures.flat());

    const newStateName = currentStateIDs.join(",");
    const newState: AutomataState = {
        id: sCounter,
        modeID: sCounter,
        name: newStateName,
        x: 100*sCounter,
        y: 400,
        isFinal: currentStateIDs.some(id => {
            const state = epsilonNea.states.find(s => s.id === id);
            return state && state.isFinal;
        }),
        mode: TASK_MODE
    };
    dea.states.push(newState);
    if(dea.states.length == 1){
        initialState = dea.states[0].id
    }
    mapNeaToDEAStates.set(getMapKey(currentStates), newState.id)
    logger.debug(__filename, "Map nea to dea states", mapNeaToDEAStates)
    const reachableStatesByLetter: { [letter: string]: number[] } = {};

    for (let i = 0; i < alphabet.length; i++) {
        const letter = alphabet[i];
        reachableStatesByLetter[letter] = [];

        for (let j = 0; j < currentStateIDs.length; j++) {
            const currentStateId = currentStateIDs[j];
            const transitions = epsilonNea.transitions.filter(transition => transition.from === currentStateId && transition.read === letter);
            for (let k = 0; k < transitions.length; k++) {
                reachableStatesByLetter[letter].push(transitions[k].to);
            }
        }
    }
    
    logger.debug(__filename, "current State ids", currentStateIDs, "Reachable states by letter", reachableStatesByLetter)
    for (const letter in reachableStatesByLetter) {
        const states = reachableStatesByLetter[letter];
        if (states.length === 0) {
            continue;
        }
        if(visitedStates.includes(visitedStatesID(states))){
            const mapKey = getMapKey(states.map(id => epsilonNea.states.find(state => state.id === id)));
            logger.debug(__filename, "map key", mapKey, "map value", mapNeaToDEAStates.get(mapKey))
            logger.debug(__filename, "map nea to dea states", mapNeaToDEAStates)
            dea.transitions.push({from: newState.id, to: mapNeaToDEAStates.get(mapKey), read: letter, id: tCounter++, mode: TASK_MODE});          
        } else {
            visitedStates.push(visitedStatesID(states));
            dea.transitions.push({from: newState.id, to: ++sCounter, read: letter, id: tCounter++, mode: TASK_MODE});
            const stateAutomaton = epsilonNea.states.filter(state => states.includes(state.id));
            const result = convertFromSingleStateOnwards(stateAutomaton, epsilonNea, dea, alphabet, epsilonClosures, mapNeaToDEAStates, sCounter, tCounter, visitedStates);
            sCounter = result.sCounter;
            tCounter = result.tCounter;
        }
    }
    return {result: dea, initialState: initialState, sCounter: sCounter, tCounter:tCounter};
}

function getMapKey(states: AutomataState[]): string {
    return [...new Set(states.map(s => s.id))].sort().join(",")
}

function visitedStatesID(states: number[]): string {
    return states.sort().join(",");
}

function getEpsilonClosures(parseResult: ParsedAutomaton): { stateId: number, closure: number[] }[]{
    let epsilonClosures: { stateId: number, closure: number[] }[] = []

    for (let i = 0; i < parseResult.states.length; i++) {
        const currentState = parseResult.states[i]
        let epsilonClosure: number[] = getSingleClosure(currentState.id, parseResult)
        epsilonClosures.push({ stateId: currentState.id, closure: epsilonClosure });
    }
    return epsilonClosures;
}

function getSingleClosure(stateId: number, parseResult: ParsedAutomaton): number[] {
    const epsilonClosure: number[] = [];
    epsilonClosure.push(stateId);

    for (let j = 0; j < parseResult.transitions.length; j++) {
        const transition = parseResult.transitions[j];
        if (transition.from === stateId && transition.read === "λ") {
            const nextState = parseResult.states.find(state => state.id === transition.to);
            if (nextState) {
                const nextStateId = nextState.id;
                if (!epsilonClosure.includes(nextStateId)) {
                    const recursiveClosure = getSingleClosure(nextStateId, parseResult);
                    epsilonClosure.push(...recursiveClosure);
                }
            }
        }
    }

    return epsilonClosure;
}

/*
    Takes an incomplete DEA, and creates an trap state to make it complete.
*/
function completeDEA(dea: { states: AutomataState[], transitions: FSAAutomataTransition[], initialState: number }): { states: AutomataState[], transitions: FSAAutomataTransition[], initialState: number } {
    logger.info(__filename, "Calling completeDEA")
    const alphabet = [...new Set(dea.transitions.map(transition => transition.read))];
    let createdTrapState: boolean = false;
    let trapState = null;

    for (const state of dea.states) {
        for (const letter of alphabet) {
            const transitions = dea.transitions.filter(transition => transition.from === state.id && transition.read === letter);
            if (transitions.length === 0) {
                if (!createdTrapState) {
                    trapState = {id: dea.states.length, modeID: dea.states.length, x: 0, y: 500, isFinal: false, mode: TASK_MODE, name: "Trap"};
                    dea.states.push(trapState);
                    createdTrapState = true
                }
                dea.transitions.push({from: state.id, to: trapState.id, read: letter, id: dea.transitions.length, mode: TASK_MODE});
                const existingTransition = dea.transitions.find(transition => transition.from === trapState.id && transition.to === trapState.id && transition.read === letter);
                if (!existingTransition) {
                    dea.transitions.push({from: trapState.id, to: trapState.id, read: letter, id: dea.transitions.length, mode: TASK_MODE});
                }
            }
        }
    }
    logger.info(__filename, "Exited completeDEA")
    return dea;
}

export default parseRegexToDEA
