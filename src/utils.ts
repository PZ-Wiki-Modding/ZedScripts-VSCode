import * as vscode from "vscode";
import { LANG_ZEDSCRIPTS } from "./project";

export function reopenFile(document: vscode.TextDocument): Thenable<vscode.TextDocument> {
    return vscode.languages.setTextDocumentLanguage(document, LANG_ZEDSCRIPTS);
}