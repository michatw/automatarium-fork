import { ILogger } from "./ILogger";

export class ConsoleLogger implements ILogger {
    private getTimestamp(): string {
        const timestamp = new Date().toISOString()
        return timestamp
    }

    info(filename:string, ...message: any[]): void {
        if(process.env.NODE_ENV !== 'no-logging'){
            console.info("[INFO]", `[${this.getTimestamp()}]`,  `[${filename}]`, ...message)
        }
    }

    debug(filename:string, ...message: any[]): void {
        if(process.env.NODE_ENV !== 'no-logging'){
            console.debug("[DEBUG]", `[${this.getTimestamp()}]`,  `[${filename}]`, ...message)
        }
    }

    error(filename:string, ...message: any[]): void{
        if(process.env.NODE_ENV !== 'no-logging'){
            console.error("[ERROR]", `[${this.getTimestamp()}]`,  `[${filename}]`, ...message)
        }
    }
}