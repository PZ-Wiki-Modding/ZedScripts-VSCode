/**
 * Basic example TreeDataProvider, modelled after the section navigator in
 * vscode-ipython. Shows groups, nested children, icons, descriptions,
 * tooltips, click commands and refresh. Uses static demo data only.
 */
import * as vscode from 'vscode';
import * as path from 'path';

import { log, log_debug } from '../logger';


// explorer-view-icon
// book

export class BaseItem extends vscode.TreeItem {
    public children: BaseItem[] = [];
}

export class WorkspaceItem extends BaseItem {
    readonly iconPath: vscode.ThemeIcon = new vscode.ThemeIcon('folder');

    // args
    readonly fsPath: string;

    constructor(fsPath: string) {
        const label = path.basename(fsPath);
        super(label, vscode.TreeItemCollapsibleState.Collapsed);

        this.fsPath = fsPath;
        this.tooltip = fsPath;
    }
}
export class LibraryItem extends WorkspaceItem {
    readonly iconPath: vscode.ThemeIcon = new vscode.ThemeIcon('book');
}



export class WorkspaceTreeProvider implements vscode.TreeDataProvider<BaseItem> {
    readonly view_id: string = 'zedscriptsEnvironment';

    // args
    readonly context: vscode.ExtensionContext;

    // members
    workspaces: Map<string, vscode.Uri> = new Map();
    libraries: Map<string, vscode.Uri> = new Map();
    
    // events
    private _onDidChangeTreeDataEmitter = new vscode.EventEmitter<WorkspaceItem | undefined | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeDataEmitter.event;

    private roots: WorkspaceItem[] = [];

// INITIALIZATION

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.refresh();
    }

    createTreeView(): vscode.TreeView<BaseItem> {
        return vscode.window.createTreeView(this.view_id, {
            treeDataProvider: this,
            showCollapseAll: false,
        });
    }

    buildTree(): WorkspaceItem[] {
        // TODO: instead of rebuilding everything
        // simply rebuild with a delta of new/removed items
        const tree: WorkspaceItem[] = [];

        for (const [fsPath, ws] of this.workspaces) {
            const item = new WorkspaceItem(fsPath);
            tree.push(item);
        }

        for (const [fsPath, lib] of this.libraries) {
            const item = new LibraryItem(fsPath);
            tree.push(item);
        }

        return tree;
    }


// TREE DATA PROVIDER METHODS

    /**
     * Rebuild the data and tell VS Code to re-query the whole tree.
     */
    refresh(): void {
        this.roots = this.buildTree();
        this._onDidChangeTreeDataEmitter.fire();
    }

    addWorkspace(uri: vscode.Uri): void {
        log_debug(`Adding workspace: ${uri.fsPath}`);
        this.workspaces.set(uri.fsPath, uri);
        this.refresh();
    }
    addLibrary(uri: vscode.Uri): void {
        log_debug(`Adding library: ${uri.fsPath}`);
        this.libraries.set(uri.fsPath, uri);
        this.refresh();
    }

    // TODO: implement removeWorkspace and removeLibrary methods


// method overrides

    getTreeItem(element: WorkspaceItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: BaseItem): vscode.ProviderResult<BaseItem[]> {
        return element ? element.children : this.roots;
    }
}



// /**
//  * Create the demo tree view and register its commands.
//  * @param context of extension
//  */
// export function registerWorkspaceTreeView(context: vscode.ExtensionContext) {
//     const provider = new WorkspaceTreeProvider();
//     const treeView = vscode.window.createTreeView(VIEW_LIBRARIES, {
//         treeDataProvider: provider,
//         showCollapseAll: true,
//     });

//     context.subscriptions.push(
//         treeView,
//         // vscode.commands.registerCommand(REFRESH_COMMAND, () => provider.refresh()),
//         // vscode.commands.registerCommand(SELECT_COMMAND, (item: BaseItem) => {
//         //     vscode.window.showInformationMessage(`Selected: ${item.label}`);
//         // }),
//     );
// }


























export const VIEW_ID = 'zedscriptsNavigator';
export const REFRESH_COMMAND = 'zedscripts.navigator.refresh';
export const SELECT_COMMAND = 'zedscripts.navigator.select';

export class DemoItem extends vscode.TreeItem {
    public children: DemoItem[] = [];

    constructor(
        label: string,
        collapsibleState: vscode.TreeItemCollapsibleState,
    ) {
        super(label, collapsibleState);
    }
}

/**
 * Build the demo tree. Called again on refresh so the timestamp changes.
 */
function buildDemoTree(): DemoItem[] {
    const stamp = new Date().toLocaleTimeString();

    const gettingStarted = new DemoItem(
        'Getting Started',
        vscode.TreeItemCollapsibleState.Expanded,
    );
    gettingStarted.iconPath = new vscode.ThemeIcon('book');
    gettingStarted.description = `refreshed ${stamp}`;
    gettingStarted.children = [
        createLeaf('Overview', 'info'),
        createLeaf('Settings', 'gear'),
    ];

    const examples = new DemoItem(
        'Examples',
        vscode.TreeItemCollapsibleState.Collapsed,
    );
    examples.iconPath = new vscode.ThemeIcon('beaker');
    examples.children = [
        createLeaf('Collapsible groups', 'list-tree'),
        createLeaf('Icons and descriptions', 'symbol-color'),
        createLeaf('Click commands', 'terminal'),
    ];

    return [gettingStarted, examples];
}

function createLeaf(label: string, icon: string): DemoItem {
    const item = new DemoItem(label, vscode.TreeItemCollapsibleState.None);
    item.iconPath = new vscode.ThemeIcon(icon);
    item.tooltip = `Demo leaf: ${label}`;
    item.contextValue = 'demoLeaf';
    item.command = {
        command: SELECT_COMMAND,
        title: 'Select',
        arguments: [item],
    };
    return item;
}

export class DemoTreeProvider implements vscode.TreeDataProvider<DemoItem> {
    private _onDidChangeTreeDataEmitter = new vscode.EventEmitter<DemoItem | undefined | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeDataEmitter.event;

    private roots: DemoItem[] = buildDemoTree();

    getTreeItem(element: DemoItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: DemoItem): vscode.ProviderResult<DemoItem[]> {
        return element ? element.children : this.roots;
    }

    /**
     * Rebuild the data and tell VS Code to re-query the whole tree.
     */
    refresh(): void {
        this.roots = buildDemoTree();
        this._onDidChangeTreeDataEmitter.fire();
    }
}

/**
 * Create the demo tree view and register its commands.
 * @param context of extension
 */
export function registerDemoTreeView(context: vscode.ExtensionContext) {
    const provider = new DemoTreeProvider();
    const treeView = vscode.window.createTreeView(VIEW_ID, {
        treeDataProvider: provider,
        showCollapseAll: true,
    });

    context.subscriptions.push(
        treeView,
        vscode.commands.registerCommand(REFRESH_COMMAND, () => provider.refresh()),
        vscode.commands.registerCommand(SELECT_COMMAND, (item: DemoItem) => {
            vscode.window.showInformationMessage(`Selected: ${item.label}`);
        }),
    );
}
