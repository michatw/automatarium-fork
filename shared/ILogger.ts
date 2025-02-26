export interface ILogger {
    info(filename: string, ...message: any[]): void
    error(filename: string, ...message: any[]): void
    debug(filename: string, ...message: any[]): void
}