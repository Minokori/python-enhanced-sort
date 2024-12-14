import * as vscode from "vscode";

let MESSAGE = vscode.workspace.getConfiguration("PythonEnhancedSort.Debug").get("Information") as boolean;
let LOG = vscode.workspace.getConfiguration("PythonEnhancedSort.Debug").get("Console") as boolean;

export function log(message: string) {
    if (MESSAGE) {
        vscode.window.showInformationMessage(message);
    }
    if (LOG) {
        console.log(message);
    }
}