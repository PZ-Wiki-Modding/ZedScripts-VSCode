import * as vscode from 'vscode';
import { LanguageClient, TransportKind } from "vscode-languageclient/node";

export async function activate(context: vscode.ExtensionContext) {
    const isDebug = process.env.ZEDSCRIPTS_DEBUG === "1";
    const executableName = process.platform === "win32" 
        ? "ZedScripts.exe" 
        : "ZedScripts";
    const pythonPath = process.platform === "win32" 
        ? "ZedScripts-LSP/.venv/Scripts/python.exe" 
        : "ZedScripts-LSP/.venv/bin/python";

    // In debug mode, run the server from source via the venv's interpreter so debugpy can attach to it.
    const serverOptions = isDebug
        ? {
            command: context.asAbsolutePath(pythonPath),
            args: ["-m", "ZedScripts.main"],
            transport: TransportKind.stdio,
            options: {
                cwd: context.asAbsolutePath("ZedScripts-LSP/src"),
                env: { ...process.env, ZEDSCRIPTS_DEBUG: "1" },
            },
        }
        : {
            command: context.asAbsolutePath(`ZedScripts-LSP/dist/${executableName}`),
            transport: TransportKind.stdio,
        };
    
    const clientOptions = {
        documentSelector: [{ scheme: "file", language: "plaintext" }],
    };
    
    const client = new LanguageClient(
        "zedserver",
        "ZedServer",
        serverOptions,
        clientOptions,
    );
    
    context.subscriptions.push(client);
    await client.start();
}

// This method is called when your extension is deactivated
export function deactivate() {}
