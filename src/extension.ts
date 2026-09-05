import * as vscode from 'vscode';
import { LanguageClient, TransportKind } from "vscode-languageclient/node";

export async function activate(context: vscode.ExtensionContext) {
    const useSource = process.env.ZEDSCRIPTS_USE_SOURCE === "1";
    const executableName = process.platform === "win32" 
        ? "ZedScripts.exe" 
        : "ZedScripts";
    const pythonPath = process.platform === "win32" 
        ? "ZedScripts-LSP/.venv/Scripts/python.exe" 
        : "ZedScripts-LSP/.venv/bin/python";

    if (useSource) {
        console.debug("Running with Python source files.");
    }

    // In debug mode, run the server from source via the venv's interpreter so debugpy can attach to it.
    const serverOptions = useSource
        ? {
            command: context.asAbsolutePath(pythonPath),
            args: ["-m", "ZedScripts.main"],
            transport: TransportKind.stdio,
            options: {
                cwd: context.asAbsolutePath("ZedScripts-LSP/src"),
                env: {...process.env},
            },
        }
        : {
            command: context.asAbsolutePath(`ZedScripts-LSP/dist/${executableName}`),
            transport: TransportKind.stdio,
        };
    
    const clientOptions = {
        documentSelector: [
            { 
                scheme: "file", 
                language: "plaintext" 
            }
        ],
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
