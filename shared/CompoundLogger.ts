import { ILogger } from "./ILogger";

export class CompoundLogger implements ILogger {
    private logger: ILogger[]

    constructor() {
        this.logger = []
    }

    addLogger(newLogger: ILogger){
        this.logger.push(newLogger)
    }

    info(filename:string, ...message: any[]): void {
        this.logger.forEach(logger => logger.info(filename, ...message));
    }

    debug(filename: string, ...message: any[]): void {
        this.logger.forEach(logger => logger.debug(filename, ...message))
    }

    error(filename:string, ...message: any[]): void{
        this.logger.forEach(logger => logger.error(filename, ...message))
    }
}