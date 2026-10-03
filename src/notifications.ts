import type { WorkspaceType } from "./stubs";

export enum ZedNotification {
    SET_ZEDSCRIPTS = "zedscripts/setZedScripts",

    SET_PROGRESS = "zedscripts/setProgress",
    SET_WORKSPACE_COUNT = "zedscripts/setWorkspaceCount",
    SET_LIBRARIES_COUNT = "zedscripts/setLibrariesCount",

    LOADING_DOCUMENTS = "zedscripts/loadingDocuments",
    LOADING_DOCUMENTS_DONE = "zedscripts/loadingDocumentsDone",
}

export interface SET_ZEDSCRIPTS_PARAMS {
    uri: string;
}

export interface SET_PROGRESS_PARAMS {
    progress: number;
}
export interface SET_WORKSPACE_COUNT_PARAMS {
    count: number;
}
export interface SET_LIBRARIES_COUNT_PARAMS {
    count: number;
}

export interface LOADING_DOCUMENTS_PARAMS {
    uri: string;
    workspace_type: WorkspaceType;
    index: number;
}