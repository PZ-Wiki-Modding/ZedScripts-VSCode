import * as vscode from 'vscode';

import { LSP_VERSION } from "./project";

/**
 * Python logging module levels.
 */
enum LoggingLevel {
    NOTSET = "NOTSET",
    DEBUG = "DEBUG",
    INFO = "INFO",
    WARNING = "WARNING",
    ERROR = "ERROR",
    CRITICAL = "CRITICAL",
}
const level_to_number: Record<LoggingLevel, number> = {
    [LoggingLevel.NOTSET]: 0,
    [LoggingLevel.DEBUG]: 10,
    [LoggingLevel.INFO]: 20,
    [LoggingLevel.WARNING]: 30,
    [LoggingLevel.ERROR]: 40,
    [LoggingLevel.CRITICAL]: 50,
};

/**
 * Structure expected by the LSP during initialization for 
 * client configurations.
 */
export interface InitializationOptions {
    logging?: {
        level: number;
    };
}

export function getInitializationOptions(): InitializationOptions {
    return {
        logging: {
            level: level_to_number[
                vscode.workspace
                    .getConfiguration("zedscripts")
                    .get<LoggingLevel>("logging.level", LoggingLevel.INFO)
            ],
        },
    };
}

export function getLSPVersion(): string {
    return vscode.workspace.getConfiguration("zedscripts").get("lsp.version", LSP_VERSION);
}