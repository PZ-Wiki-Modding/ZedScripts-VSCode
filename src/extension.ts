import * as vscode from 'vscode';
import { 
    LanguageClient, 
    TransportKind,
    ServerOptions,
    LanguageClientOptions,
} from "vscode-languageclient/node";

import { 
    LANG_ZEDSCRIPTS, 
    globalConfigDir, 
    CONFIGURATION_FILE_NAME,
    LSP_VERSION
} from "./project";
import { reopenFile } from "./utils";
import * as Notifications from "./notifications";
import { ensureLSPBinary } from "./lsp";
import { ZedScriptsInterface, State } from "./interface";
import { WorkspaceType } from "./stubs";

export let ZSI: ZedScriptsInterface;

export async function activate(context: vscode.ExtensionContext) {
    const useSource = process.env.ZEDSCRIPTS_USE_SOURCE === "1";
    const useLocalMode = process.env.ZEDSCRIPTS_LOCAL_MODE === "1";
    const pythonPath = process.platform === "win32" 
        ? ".venv/Scripts/python.exe" 
        : ".venv/bin/python";

    ZSI = new ZedScriptsInterface(context);
    ZSI.updateStatusBar();
    context.subscriptions.push(ZSI.statusBar);

    if (useSource) {
        console.debug("Running with Python source files.");
    } else if (useLocalMode) {
        console.debug("Running with local dist folder.");
    }

    let serverOptions: ServerOptions;

    if (useSource) {
        // retrieve source folder from global env var ZEDSCRIPTS_LSP_SRC
        const sourceFolder = process.env.ZEDSCRIPTS_LSP_SRC;

        // in debug mode, run the server from source 
        // via the venv's interpreter so debugpy can attach to it
        serverOptions = {
            command: context.asAbsolutePath(pythonPath),
            args: ["-m", "ZedScripts.main"],
            transport: TransportKind.stdio,
            options: {
                cwd: sourceFolder,
                env: {...process.env},
            },
        };
    } else if (useLocalMode) {
        // use locally built dist folder (for development)
        const executableName = process.platform === "win32" 
            ? "ZedScripts.exe" 
            : "ZedScripts";
        serverOptions = {
            command: context.asAbsolutePath(`ZedScripts-LSP/dist/${executableName}`),
            transport: TransportKind.stdio,
        };
    } else {
        // download or use cached LSP binary from GitHub releases
        const binaryPath = await ensureLSPBinary(context, LSP_VERSION);
        
        serverOptions = {
            command: binaryPath,
            transport: TransportKind.stdio,
        };
    }
    
    const clientOptions: LanguageClientOptions = {
        documentSelector: [
            { 
                scheme: "file", 
                language: "plaintext" 
            },
            {
                scheme: "file",
                language: LANG_ZEDSCRIPTS
            },

            // config files
            {  // workspace-relative config
                scheme: "file",
                pattern: "**/.zedscripts.json"
            },
        ],
    };

    // global config file watcher
    const globalConfigWatcher = vscode.workspace.createFileSystemWatcher(
        new vscode.RelativePattern(vscode.Uri.file(globalConfigDir), 
        CONFIGURATION_FILE_NAME)
    );
    context.subscriptions.push(globalConfigWatcher);

    clientOptions.synchronize = { fileEvents: globalConfigWatcher };

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
    client.onNotification(Notifications.ZedNotification.SET_ZEDSCRIPTS, (params: Notifications.SET_ZEDSCRIPTS_PARAMS) => {
        // console.log("Received setZedScripts notification:", params);
        const uri = params.uri;
        const file = vscode.workspace.textDocuments.find(doc => doc.uri.toString() === uri);
        if (file) {
            reopenFile(file);
        }
    });

    client.onNotification(Notifications.ZedNotification.SET_PROGRESS, (params: Notifications.SET_PROGRESS_PARAMS) => {
        ZSI.setProgress(params.progress);
        ZSI.updateStatusBar();
    });
    client.onNotification(Notifications.ZedNotification.SET_WORKSPACE_COUNT, (params: Notifications.SET_WORKSPACE_COUNT_PARAMS) => {
        ZSI.setWorkspaceCount(params.count);
        ZSI.updateStatusBar();
    });
    client.onNotification(Notifications.ZedNotification.SET_LIBRARIES_COUNT, (params: Notifications.SET_LIBRARIES_COUNT_PARAMS) => {
        ZSI.setLibrariesCount(params.count);
        ZSI.updateStatusBar();
    });

    client.onNotification(Notifications.ZedNotification.LOADING_DOCUMENTS, (params: Notifications.LOADING_DOCUMENTS_PARAMS) => {
        const uri = params.uri;
        const index = params.index;
        const workspaceType = params.workspace_type;
        switch (workspaceType) {
            case WorkspaceType.PROJECT:
                ZSI.setUri(uri);
                ZSI.setWorkspaceIndex(index);
                ZSI.setState(State.LOADING_WORKSPACES);
                break;
            case WorkspaceType.LIBRARY:
                ZSI.setUri(uri);
                ZSI.setLibrariesIndex(index);
                ZSI.setState(State.LOADING_LIBRARIES);
                break;
        }
    });
    client.onNotification(Notifications.ZedNotification.LOADING_DOCUMENTS_DONE, () => {
        ZSI.setState(State.RUNNING);
    });
}

// This method is called when your extension is deactivated
export function deactivate() {}
