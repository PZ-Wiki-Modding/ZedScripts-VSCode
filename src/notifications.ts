import type { WorkspaceType } from "./stubs";

export enum ZedNotification {
    SET_ZEDSCRIPTS = "zedscripts/setZedScripts",

    LOADING_DOCUMENTS = "zedscripts/loadingDocuments",
    LOADING_DOCUMENTS_DONE = "zedscripts/loadingDocumentsDone",
}

export interface SetZedScriptsNotificationParams {
    uri: string;
}
export interface LoadingDocumentsNotificationParams {
    uri: string;
    progress: number;
    workspace_type: WorkspaceType;
}