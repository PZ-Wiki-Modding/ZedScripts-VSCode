import * as vscode from "vscode";
import { LANG_ZEDSCRIPTS } from "./project";

export function reopenFile(document: vscode.TextDocument): void {
    // no need to reopen if it's already the correct language
    if (document.languageId === LANG_ZEDSCRIPTS) {
        return;
    }
    vscode.languages.setTextDocumentLanguage(document, LANG_ZEDSCRIPTS);
    return;
}



/**
 * Taken from the LaTeX-Workshop extension
 * https://github.com/James-Yu/LaTeX-Workshop
 */

function toUri(filePath: string): vscode.Uri {
    const scheme = vscode.workspace.workspaceFolders?.find(
        folder => filePath.startsWith(folder.uri.path)
    )?.uri.scheme ?? 'file'
    return vscode.Uri.file(filePath).with({ scheme })
}

export async function graph2md(filePath: string, opts: { height: number, width: number, pageNumber?: number }): Promise<vscode.MarkdownString | undefined> {
    const filePathUriString = toUri(filePath).toString()
    if (/\.(bmp|jpg|jpeg|gif|png)$/i.exec(filePath)) {
        // Workaround for https://github.com/microsoft/vscode/issues/137632
        if (vscode.env.remoteName) {
            const md = new vscode.MarkdownString(`![img](${filePathUriString})`)
            return md
        }
        const md = new vscode.MarkdownString(`<img src="${filePathUriString}" height="${opts.height}">`)
        md.supportHtml = true
        return md
    }
    return
}
