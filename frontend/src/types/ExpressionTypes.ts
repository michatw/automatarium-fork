import { AutomataState, BaseAutomataTransition, ProjectComment } from "./ProjectTypes"

/**
 * Possible types of an Expression based project
 * - RE: RegularExpression
 */
export type ExpressionType = 'RE' | 'TE'

/**
 * Expression Config
 */
export interface ExpressionConfig {
    statePrefixTask: string,
    statePrefixSolution: string,
    orOperator: string,
}

/**
 * Expression project.
 */
type BaseExpression<PT extends ExpressionType> = {
    type: PT
    expression: string
    meta: ExpressionMetaData
    states: AutomataState[]
    transitions: BaseAutomataTransition[]
    comments: ProjectComment[]
    initialState: number | null
}

/**
 * What an expression project for the frontend looks like.
 */
export type RegularExpression = BaseExpression<'RE'>

/**
*  A gradeable regular expression. Extends Base Expression with initialStateSolution and grade.
*/
export type GradeableRegularExpression<PT extends ExpressionType> = BaseExpression<PT> & {  
    initialStateSolution: number | null,
    isSolutionVisible: boolean
    grade: boolean | null
}

/** 
 * Regular expression which is used inside an Expression graph.
 */
export type TaskRegularExpression = GradeableRegularExpression<'TE'>

/**
 * Different possible implementations of an Expression
 */
export type ExpressionImplementation = RegularExpression | TaskRegularExpression

/**
 * All the different types an Expression can be. 
 */
export type Expression = ExpressionImplementation & {
    config: ExpressionConfig
}

/**
 * What the meta data for an Expression looks like.
 */
export interface ExpressionMetaData {
    automatariumVersion: string,
    dateCreated: number,
    dateEdited: number,
    name: string,
    version: string
}

// This is for copy/paste function which isn't TS converted yet
// Leaving it here so its ready for when its converted, so as not to clutter useActions
export type CopyDataExpression = {
    states: AutomataState[],
    transitions: BaseAutomataTransition[],
    comments: ProjectComment[],
    expressionSource: string,
    expressionType: ExpressionType,
    initialStateId: number | null
}

export type TemplateExpression = CopyDataExpression & {
    _id: string,
    name: string,
    date: number
}