import * as vscode from 'vscode';


interface StatusBarConfig {
    readonly text: string;
    readonly color?: vscode.ThemeColor;
    readonly backgroundColor?: vscode.ThemeColor;
}

export enum State {
    STOPPED,
    LOADING_WORKSPACES,
    LOADING_LIBRARIES,
    RUNNING,
}



export class ZedScriptsInterface {
    context: vscode.ExtensionContext;

    // status bar
    statusBar: vscode.StatusBarItem;
    state: State = State.STOPPED;

    _progress: number = 0;
    _uri: string = "";

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.statusBar = this.initializeStatusBar();
    }

    updateStatusBar(): void {
        // set current config
        const config = this.getStatusBarConfig();
        this.statusBar.text = config.text;
        this.statusBar.color = config.color;
        this.statusBar.backgroundColor = config.backgroundColor;

        // update tooltip
        this.statusBar.tooltip = this.createTooltip();

        this.statusBar.show();
    }

    initializeStatusBar(): vscode.StatusBarItem {
        const statusBar = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left, 0
        );
        statusBar.command = "ZedScripts.showInfo";
        return statusBar;
    }


    getStatusBarConfig(): StatusBarConfig {
        const fileCounter = this.getProgress();
        const configs: Record<State, StatusBarConfig> = {
            [State.STOPPED]: {
                text: "$(debug-stop) ZedScripts",
            },
            [State.LOADING_WORKSPACES]: {
                text: "$(sync~spin) ZedScripts: loading workspaces... " + fileCounter,
                color: new vscode.ThemeColor("statusBarItem.warningBackground"),
            },
            [State.LOADING_LIBRARIES]: {
                text: "$(sync~spin) ZedScripts: loading libraries... " + fileCounter,
                color: new vscode.ThemeColor("statusBarItem.warningBackground"),
            },
            [State.RUNNING]: {
                text: "$(check) ZedScripts",
            }
        }
        return configs[this.state];
    }


    private createTooltip(): vscode.MarkdownString {
        const tooltip = new vscode.MarkdownString();
        tooltip.isTrusted = true;

        switch (this.state) {
            case State.STOPPED:
                tooltip.appendMarkdown("ZedScripts is currently OFF.");
                break;
            case State.LOADING_WORKSPACES:
                tooltip.appendMarkdown("ZedScripts is loading workspace:" + this._uri);
                break;
            case State.LOADING_LIBRARIES:
                tooltip.appendMarkdown("ZedScripts is loading library: " + this._uri);
                break;
            case State.RUNNING:
                tooltip.appendMarkdown("ZedScripts is loaded.");
                break;
        }
        

        // tooltip.appendMarkdown("Hello World!");
        // tooltip.appendMarkdown('\n\n')

        // if (this.activeWorkspace) {
        //     tooltip.appendMarkdown(formatText(
        //         DefaultText.STATUS_BAR_TOOLTIP_PROCESSING, {
        //             workspaceType: this.activeWorkspace.workspaceType
        //         }));
        //     if (this.activeWorkspace.isLoading) {
        //         tooltip.appendMarkdown('\n\n');
        //         tooltip.appendMarkdown(`${this.getFileCounter()}`);
        //     }
        // } else if (this.state !== State.RUNNING) {
        //     tooltip.appendMarkdown(DefaultText.STATUS_BAR_TOOLTIP_LOADING);
        // } else {
        //     tooltip.appendMarkdown(DefaultText.STATUS_BAR_TOOLTIP_LOADED);
        // }

        return tooltip;
    }

    private getProgress(): string {
        return `${Math.floor(this._progress)}%`;
    }


// STATE UPDATERS

    setState(state: State): void {
        this.state = state;
        this.updateStatusBar();
    }

    setProgress(state: State, progress: number, uri: string): void {
        this._progress = progress;
        this._uri = uri;
        this.setState(state)
    }

}