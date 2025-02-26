import { CompoundLogger } from "./CompoundLogger";
import { ConsoleLogger } from "./ConsoleLogger";
import { ILogger } from "./ILogger";

// Automatarium runs solely inside the browser. Logs should only be used for debugging purposes. Before
// deploying automatarium all logs should be remvoed.
class LoggerSingleton {
    private static instance: ILogger

    private constructor() {}

    public static getInstance(): ILogger {
        if (!LoggerSingleton.instance){
            const consoleLogger = new ConsoleLogger();

            const compoundLogger = new CompoundLogger();
            compoundLogger.addLogger(consoleLogger)
            LoggerSingleton.instance = compoundLogger
            
        }
        return LoggerSingleton.instance
    }
}

export const logger = LoggerSingleton.getInstance()