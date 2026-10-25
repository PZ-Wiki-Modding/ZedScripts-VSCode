import * as vscode from "vscode";

export let outputChannel: vscode.OutputChannel;
const date = new Date();

export function log(message: string, level: "debug" | "info" | "warn" | "error" = "info") {
    if (!outputChannel) {
        outputChannel = vscode.window.createOutputChannel("ZedScripts");
    }
    const timestamp = date.toISOString();
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    outputChannel.appendLine(formattedMessage);
}

export function log_debug(message: string) {
    log(message, "debug");
}
export function log_error(message: string) {
    log(message, "error");
}
export function log_warn(message: string) {
    log(message, "warn");
}