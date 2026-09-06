import * as vscode from 'vscode';
import { 
    LanguageClient, 
    TransportKind,
    ServerOptions,
    LanguageClientOptions,
} from "vscode-languageclient/node";

import { LANG_ZEDSCRIPTS } from "./project";
import { reopenFile } from "./utils";
import { ZedNotification, SetZedScriptsNotificationParams } from "./notifications";


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
    const serverOptions: ServerOptions = useSource
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
    
    const clientOptions: LanguageClientOptions = {
        documentSelector: [
            { 
                scheme: "file", 
                language: "plaintext" 
            },
            {
                scheme: "file",
                language: LANG_ZEDSCRIPTS
            }
        ],
    };
    
    const client = new LanguageClient(
        "zedserver",
        "ZedServer",
        serverOptions,
        clientOptions,
    );
    registerNotification(client);
    
    context.subscriptions.push(client);
    await client.start();
}


function registerNotification(client: LanguageClient) {
    client.onNotification(ZedNotification.SET_ZEDSCRIPTS, (params: SetZedScriptsNotificationParams) => {
        // console.log("Received setZedScripts notification:", params);
        const uri = params.uri;
        reopenFile(vscode.workspace.textDocuments.find(doc => doc.uri.toString() === uri)!);
    });
}

// This method is called when your extension is deactivated
export function deactivate() {}
